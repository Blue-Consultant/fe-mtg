'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

import Skeleton from '@mui/material/Skeleton'

import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import esLocale from '@fullcalendar/core/locales/es'

import modalStyles from '@/components/brand-modal/brand-modal.module.css'
import BrandModal from '@/components/brand-modal/BrandModal'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'
import BookingDock from './booking-chat/BookingDock'
import { toYYYYMMDD } from './dates'
import { useOccupiedSlots } from './hooks/useOccupiedSlots'
import { usePublishedCourts } from './hooks/usePublishedCourts'
import styles from './player-board.module.css'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=640&h=360&fit=crop'

const parseYYYYMMDD = value => {
  const [y, m, d] = String(value || '')
    .split('-')
    .map(Number)

  if (!y || !m || !d) return new Date()

  return new Date(y, m - 1, d)
}

const addDays = (date, days) => {
  const next = new Date(date)

  next.setDate(next.getDate() + days)

  return next
}

const timeToMinutes = value => {
  const [h, m] = String(value || '0:0')
    .split(':')
    .map(Number)

  return (h || 0) * 60 + (m || 0)
}

const minutesToTime = total => {
  const h = Math.floor(total / 60) % 24
  const m = total % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const schedulesForDate = (court, fecha) => {
  const day = parseYYYYMMDD(fecha).getDay()

  return (court?.PriceSchedules || []).filter(row => {
    if (Number(row.dia_semana) !== day) return false
    if (row.vigencia_desde && fecha < row.vigencia_desde) return false
    if (row.vigencia_hasta && fecha > row.vigencia_hasta) return false

    return true
  })
}

const formatAddress = venue =>
  [venue?.address, venue?.city, venue?.postal_code, venue?.country].filter(Boolean).join(', ')

const mapsSearchUrl = address => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

const priceLabel = schedules => {
  const prices = schedules.map(row => Number(row.precio)).filter(n => Number.isFinite(n))

  if (prices.length === 0) return 'Sin horario este día'

  const min = Math.min(...prices)
  const max = Math.max(...prices)

  if (min === max) return `S/ ${min} / h`

  return `S/ ${min}–${max} / h`
}

const scheduleScore = row => (row.vigencia_desde ? 1 : 0) + (row.vigencia_hasta ? 1 : 0)

const scheduleSpan = row => {
  if (!row.vigencia_desde || !row.vigencia_hasta) return Number.POSITIVE_INFINITY

  return Math.abs(parseYYYYMMDD(row.vigencia_hasta).getTime() - parseYYYYMMDD(row.vigencia_desde).getTime())
}

const buildHourlySlots = schedules => {
  const byStart = new Map()

  schedules.forEach(row => {
    const startM = timeToMinutes(row.hora_inicio)
    const rawEnd = timeToMinutes(row.hora_fin)
    const endM = rawEnd <= startM ? rawEnd + 24 * 60 : rawEnd
    const precio = Number(row.precio) || 0
    const score = scheduleScore(row)
    const span = scheduleSpan(row)

    for (let cursor = startM; cursor + 60 <= endM; cursor += 60) {
      const start = minutesToTime(cursor)
      const current = byStart.get(start)

      if (current && (current.score > score || (current.score === score && current.span <= span))) continue

      byStart.set(start, {
        start,
        end: cursor + 60 === 24 * 60 ? '24:00' : minutesToTime(cursor + 60),
        precio,
        score,
        span
      })
    }
  })

  return [...byStart.values()]
    .map(({ start, end, precio }) => ({ start, end, precio }))
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
}

const endMinutes = (start, end) => {
  if (end === '24:00') return 24 * 60

  const startM = timeToMinutes(start)
  const endM = timeToMinutes(end)

  return endM <= startM ? endM + 24 * 60 : endM
}

const overlaps = (occupied, start, end) =>
  occupied.some(row => {
    const rowStart = timeToMinutes(row.hora_inicio)
    const rowEnd = endMinutes(row.hora_inicio, row.hora_fin)

    return rowStart < endMinutes(start, end) && rowEnd > timeToMinutes(start)
  })

const blockedByDate = (court, fecha, start, end) => {
  const slotStart = parseYYYYMMDD(fecha).getTime() + timeToMinutes(start) * 60 * 1000
  const slotEnd = parseYYYYMMDD(fecha).getTime() + endMinutes(start, end) * 60 * 1000

  return (court?.DateBlocks || []).some(block => {
    const from = new Date(block.fecha_inicio).getTime()
    const to = new Date(block.fecha_fin).getTime()

    return from < slotEnd && to > slotStart
  })
}

const isPastSlot = (fecha, start) => {
  if (fecha !== toYYYYMMDD(new Date())) return false

  return new Date(`${fecha}T${start}:00`).getTime() <= Date.now()
}

const MAX_CONSECUTIVE_HOURS = 3

const slotsAreContiguous = (left, right) => timeToMinutes(right.start) === timeToMinutes(left.end)

const rangeFromStart = (slots, start, hours) => {
  const index = slots.findIndex(slot => slot.start === start)

  if (index < 0 || hours < 1) return []

  const count = Math.min(MAX_CONSECUTIVE_HOURS, hours)
  const range = [slots[index]]

  for (let step = 1; step < count; step += 1) {
    const next = slots[index + step]

    if (!next || !slotsAreContiguous(range[step - 1], next)) return []
    range.push(next)
  }

  return range
}

const slotIsBlocked = (slot, occupied, court, fecha) =>
  overlaps(occupied, slot.start, slot.end) ||
  blockedByDate(court, fecha, slot.start, slot.end) ||
  isPastSlot(fecha, slot.start)

const contactPhone = venue => String(venue?.phone_number || '').trim()

const phoneTelHref = value => {
  const digits = String(value || '').replace(/[^\d+]/g, '')

  return digits ? `tel:${digits}` : ''
}

const whatsAppDigits = value => {
  let digits = String(value || '').replace(/\D/g, '')

  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('51') && digits.length >= 11) return digits
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '')
  if (digits.length === 9) return `51${digits}`

  return digits.length >= 8 ? digits : ''
}

const sportIcon = name => {
  const value = String(name || '').toLowerCase()

  if (value.includes('fút') || value.includes('fut')) return 'ri-football-line'
  if (value.includes('bás') || value.includes('bas')) return 'ri-basketball-line'
  if (value.includes('vó') || value.includes('vol')) return 'ri-circle-line'

  return 'ri-basketball-line'
}

const heroDateLabel = value => {
  const date = parseYYYYMMDD(value)
  const month = date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '')

  return `${DAY_LABELS[date.getDay()]}, ${date.getDate()} ${month} ${date.getFullYear()}`
}

const formatLongDate = value => {
  const label = parseYYYYMMDD(value).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })

  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function PlayerCourtBoard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const { courts, loading, loadError } = usePublishedCourts(
    'No pudimos cargar las canchas. Revisa que el servidor esté activo.'
  )

  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()

    today.setHours(0, 0, 0, 0)
    const requested = parseYYYYMMDD(searchParams.get('fecha') || toYYYYMMDD(today))

    requested.setHours(0, 0, 0, 0)
    if (requested <= today) return today
    const diff = Math.round((requested.getTime() - today.getTime()) / 86400000)

    return addDays(today, Math.floor(diff / 7) * 7)
  })

  const [fecha, setFecha] = useState(() => searchParams.get('fecha') || toYYYYMMDD(new Date()))

  const [selectedId, setSelectedId] = useState(() => {
    const raw = Number(searchParams.get('cancha'))

    return Number.isFinite(raw) && raw > 0 ? raw : null
  })

  const [calendarView, setCalendarView] = useState('day')
  const [selectedStart, setSelectedStart] = useState(() => searchParams.get('hora') || null)

  const [selectedHours, setSelectedHours] = useState(() => {
    const raw = Number(searchParams.get('horas'))

    return raw === 2 || raw === 3 ? raw : 1
  })

  const [locationOpen, setLocationOpen] = useState(null)
  const [longBookingOpen, setLongBookingOpen] = useState(false)

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])
  const sedeId = Number(searchParams.get('sede'))

  const listedCourts = useMemo(() => {
    if (!Number.isFinite(sedeId) || sedeId <= 0) return courts

    const match = courts.filter(court => court.SportsVenue?.id === sedeId)

    return match.length > 0 ? match : courts
  }, [courts, sedeId])

  useEffect(() => {
    if (loading || listedCourts.length === 0) return

    setSelectedId(current => (listedCourts.some(court => court.id === current) ? current : listedCourts[0].id))
  }, [loading, listedCourts])

  const selectedCourt = listedCourts.find(court => court.id === selectedId) || null
  const daySchedules = useMemo(() => schedulesForDate(selectedCourt, fecha), [selectedCourt, fecha])
  const slots = useMemo(() => buildHourlySlots(daySchedules), [daySchedules])
  const calendarDatesKey = calendarView === 'week' ? days.map(day => toYYYYMMDD(day)).join('|') : fecha
  const { occupiedByDate, slotsLoading } = useOccupiedSlots(selectedId, calendarDatesKey)
  const occupied = occupiedByDate[fecha] || []

  const slotsByDate = useMemo(() => {
    const map = {}

    calendarDatesKey.split('|').forEach(date => {
      map[date] = buildHourlySlots(schedulesForDate(selectedCourt, date))
    })

    return map
  }, [calendarDatesKey, selectedCourt])

  const visibleSlots = Object.values(slotsByDate).flat()
  const earliestSlot = visibleSlots.reduce((min, slot) => (min && min < slot.start ? min : slot.start), '')
  const latestSlot = visibleSlots.reduce((max, slot) => (max && max > slot.end ? max : slot.end), '')
  const slotMinTime = earliestSlot ? `${earliestSlot}:00` : '06:00:00'
  const slotMaxTime = latestSlot === '24:00' ? '24:00:00' : latestSlot ? `${latestSlot}:00` : '24:00:00'

  const selectedRange = useMemo(() => {
    const range = rangeFromStart(slots, selectedStart, selectedHours)

    if (range.length !== selectedHours) return []
    if (range.some(slot => slotIsBlocked(slot, occupied, selectedCourt, fecha))) return []

    return range
  }, [slots, selectedStart, selectedHours, occupied, selectedCourt, fecha])

  const reserveTotal = selectedRange.reduce((sum, slot) => sum + slot.precio, 0)

  useEffect(() => {
    if (loading || slotsLoading || !selectedStart) return

    const range = rangeFromStart(slots, selectedStart, selectedHours)

    const intact =
      range.length === selectedHours && range.every(slot => !slotIsBlocked(slot, occupied, selectedCourt, fecha))

    if (!intact) {
      setSelectedStart(null)
      setSelectedHours(1)
    }
  }, [loading, slotsLoading, selectedStart, selectedHours, slots, occupied, selectedCourt, fecha])

  const syncQuery = useCallback(
    (nextCourt, nextFecha, nextHora, nextHoras) => {
      const params = new URLSearchParams()

      if (nextCourt) params.set('cancha', String(nextCourt))
      if (nextFecha) params.set('fecha', nextFecha)
      if (nextHora) params.set('hora', nextHora)
      if (nextHora && nextHoras > 1) params.set('horas', String(nextHoras))
      const sede = searchParams.get('sede')

      if (sede) params.set('sede', sede)
      const query = params.toString()

      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const venues = useMemo(() => {
    const map = new Map()

    listedCourts.forEach(court => {
      const venue = court.SportsVenue
      const key = venue?.id ?? 'sin-sede'

      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: venue?.name || 'Sede',
          city: venue?.city || '',
          address: formatAddress(venue),
          courts: []
        })
      }

      map.get(key).courts.push(court)
    })

    return Array.from(map.values()).map(venue => ({
      ...venue,
      courts: [...venue.courts].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    }))
  }, [listedCourts])

  const applySelection = (start, hours) => {
    setSelectedStart(start)
    setSelectedHours(hours)
    syncQuery(selectedId, fecha, start, hours)
  }

  const clearSelection = () => {
    setSelectedStart(null)
    setSelectedHours(1)
    syncQuery(selectedId, fecha, null, 1)
  }

  const chooseCourt = courtId => {
    setSelectedId(courtId)
    setSelectedStart(null)
    setSelectedHours(1)
    syncQuery(courtId, fecha, null, 1)

    if (window.matchMedia('(max-width: 640px)').matches) {
      document.querySelector(`[data-court-id="${courtId}"]`)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }

  const chooseDate = value => {
    setFecha(value)
    setSelectedStart(null)
    setSelectedHours(1)
    syncQuery(selectedId, value, null, 1)
  }

  const chooseSlot = start => {
    const slot = slots.find(item => item.start === start)

    if (!slot || slotIsBlocked(slot, occupied, selectedCourt, fecha)) return

    if (selectedRange.length === 0) {
      applySelection(start, 1)

      return
    }

    const starts = selectedRange.map(item => item.start)

    if (starts.includes(start)) {
      if (starts.length === 1) {
        clearSelection()

        return
      }

      if (start === starts[0]) {
        applySelection(starts[1], starts.length - 1)

        return
      }

      if (start === starts[starts.length - 1]) {
        applySelection(starts[0], starts.length - 1)

        return
      }

      applySelection(starts[0], starts.indexOf(start) + 1)

      return
    }

    const first = selectedRange[0]
    const last = selectedRange[selectedRange.length - 1]
    const growsForward = slotsAreContiguous(last, slot)
    const growsBackward = slotsAreContiguous(slot, first)

    if (growsForward || growsBackward) {
      if (selectedRange.length >= MAX_CONSECUTIVE_HOURS) {
        setLongBookingOpen(true)

        return
      }

      applySelection(growsBackward ? slot.start : first.start, selectedRange.length + 1)

      return
    }

    applySelection(start, 1)
  }

  const chooseSlotAt = (date, start) => {
    if (date === fecha) {
      chooseSlot(start)

      return
    }

    setFecha(date)
    setSelectedStart(start)
    setSelectedHours(1)
    syncQuery(selectedId, date, start, 1)
  }

  const activeVenue = venues.find(venue => venue.courts.some(court => court.id === selectedId)) || venues[0] || null
  const pageTitle = activeVenue?.name || 'Canchas'
  const pageAddress = activeVenue?.address || ''
  const pageMeta = listedCourts.length === 1 ? '1 cancha' : `${listedCourts.length} canchas`
  const todayValue = toYYYYMMDD(new Date())

  const shiftDay = delta => {
    const next = addDays(parseYYYYMMDD(fecha), delta)

    next.setHours(0, 0, 0, 0)
    const today = parseYYYYMMDD(todayValue)

    today.setHours(0, 0, 0, 0)
    if (next < today) return

    const nextValue = toYYYYMMDD(next)
    const weekEnd = addDays(weekStart, 6)

    if (next < weekStart || next > weekEnd) setWeekStart(addDays(weekStart, delta > 0 ? 7 : -7))
    chooseDate(nextValue)
  }

  const openLocation = venue => {
    if (!venue?.address) return
    setLocationOpen(venue)
  }

  const copyLocation = async () => {
    if (!locationOpen?.address) return

    try {
      await navigator.clipboard.writeText(locationOpen.address)
      notificationSuccesMessage('Dirección copiada')
      setLocationOpen(null)
    } catch {
      notificationErrorMessage('No se pudo copiar la dirección')
    }
  }

  const venuePhone = contactPhone(selectedCourt?.SportsVenue)
  const venueWhatsApp = whatsAppDigits(venuePhone)
  const venueAddress = formatAddress(selectedCourt?.SportsVenue)
  const longBookingMessage = `Hola, quiero reservar ${selectedCourt?.nombre || 'una cancha'} el ${formatLongDate(fecha)} por más de 3 horas. ¿Me ayudan a completar la reserva?`

  if (loading) {
    return (
      <>
        <Skeleton variant='rounded' height={156} />
        <div className={styles.courtGrid}>
          {[1, 2, 3, 4].map(item => (
            <Skeleton key={item} variant='rounded' height={210} />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>{pageTitle}</h1>
          {pageAddress ? (
            <button type='button' className={styles.locationBtn} onClick={() => openLocation(activeVenue)}>
              <i className='ri-map-pin-2-line' aria-hidden />
              {pageAddress}
            </button>
          ) : null}
          <p className={styles.courtCount}>
            <i className='ri-layout-grid-line' aria-hidden />
            {pageMeta}
          </p>
        </div>
        <div className={styles.datePanel}>
          <div className={styles.dateHead}>
            <i className='ri-calendar-2-line' aria-hidden />
            <span>{heroDateLabel(fecha)}</span>
            <button type='button' aria-label='Día anterior' disabled={fecha <= todayValue} onClick={() => shiftDay(-1)}>
              <i className='ri-arrow-left-s-line' />
            </button>
            <button type='button' aria-label='Día siguiente' onClick={() => shiftDay(1)}>
              <i className='ri-arrow-right-s-line' />
            </button>
          </div>
          <div className={styles.dayStrip} role='group' aria-label='Días'>
            {days.map(day => {
              const value = toYYYYMMDD(day)

              return (
                <button
                  key={value}
                  type='button'
                  className={styles.dayBtn}
                  aria-pressed={value === fecha}
                  onClick={() => chooseDate(value)}
                >
                  <span className={styles.dayDow}>{DAY_LABELS[day.getDay()]}</span>
                  <span className={styles.dayNum}>{day.getDate()}</span>
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {loadError ? <p className={styles.empty}>{loadError}</p> : null}
      {!loadError && listedCourts.length === 0 ? <p className={styles.empty}>No hay canchas activas.</p> : null}
      {!loadError && listedCourts.length > 0 ? (
        <p className={styles.courtPrompt}>
          Selecciona la cancha que quieres
          <span>Luego eliges la hora en el calendario.</span>
        </p>
      ) : null}

      {venues.map(venue => (
        <section key={venue.id} aria-label={venue.name}>
          {venues.length > 1 ? (
            <div className={styles.venueHeading}>
              <h2 className={styles.venueName}>{venue.name}</h2>
              {venue.address ? (
                <button type='button' className={styles.locationBtn} onClick={() => openLocation(venue)}>
                  <i className='ri-map-pin-2-line' aria-hidden />
                  {venue.address}
                </button>
              ) : null}
            </div>
          ) : null}
          <div className={styles.courtGrid}>
            {venue.courts.map(court => {
              const schedules = schedulesForDate(court, fecha)
              const image = court.imagen || court.SportsVenue?.logo || DEFAULT_IMAGE

              return (
                <button
                  key={court.id}
                  type='button'
                  data-court-id={court.id}
                  className={styles.courtCard}
                  aria-pressed={court.id === selectedId}
                  onClick={() => chooseCourt(court.id)}
                >
                  <div className={styles.courtImage}>
                    <OptimizedS3Image
                      src={image}
                      alt=''
                      fill
                      className='object-cover'
                      sizes='(max-width: 640px) 100vw, 25vw'
                    />
                    {court.id === selectedId ? (
                      <span className={styles.selectedChip}>
                        <i className='ri-check-line' aria-hidden />
                        Seleccionada
                      </span>
                    ) : null}
                    <span className={styles.sportBadge} aria-hidden>
                      <i className={sportIcon(court.court_types?.nombre)} />
                    </span>
                  </div>
                  <div className={styles.courtBody}>
                    <h3 className={styles.courtTitle}>{court.nombre}</h3>
                    <p className={styles.courtMeta}>
                      <i className='ri-group-line' aria-hidden />
                      {court.capacidad ? `${court.capacidad} jugadores` : court.court_types?.nombre || 'Cancha'}
                    </p>
                    <span className={styles.pricePill}>{priceLabel(schedules)}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {selectedCourt ? (
        <section className={styles.calendar} aria-live='polite'>
          <div className={styles.calendarHead}>
            <div>
              <h2 className={styles.calendarTitle}>
                <i className='ri-calendar-2-line' aria-hidden />
                {selectedCourt.nombre}
              </h2>
              <p>
                {formatLongDate(fecha)}
                {daySchedules.length > 0 ? ` · ${priceLabel(daySchedules).replace(' / h', '/h')}` : ''}
                {' · hasta 3 horas seguidas'}
              </p>
            </div>
            <div className={styles.calendarTools}>
              <div className={styles.viewToggle} role='group' aria-label='Vista del calendario'>
                <button type='button' aria-pressed={calendarView === 'day'} onClick={() => setCalendarView('day')}>
                  Día
                </button>
                <button type='button' aria-pressed={calendarView === 'week'} onClick={() => setCalendarView('week')}>
                  Semana
                </button>
              </div>
              <div className={styles.legend}>
                <span>
                  <i className={styles.dot} /> Disponible
                </span>
                <span>
                  <i className={`${styles.dot} ${styles.dotOff}`} /> Ocupado
                </span>
              </div>
            </div>
          </div>

          {slotsLoading ? <Skeleton variant='rounded' height={280} /> : null}

          {!slotsLoading && visibleSlots.length === 0 ? (
            <p className={styles.empty}>
              {calendarView === 'week'
                ? 'Sin horario publicado para esta semana.'
                : 'Sin horario publicado para este día.'}
            </p>
          ) : null}

          {!slotsLoading && visibleSlots.length > 0 ? (
            <div className={`${styles.agenda} ${calendarView === 'week' ? styles.agendaWeek : ''}`}>
              <FullCalendar
                key={`${selectedCourt.id}-${calendarView}-${calendarDatesKey}`}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView={calendarView === 'week' ? 'timeGridWeek' : 'timeGridDay'}
                initialDate={calendarView === 'week' ? toYYYYMMDD(weekStart) : fecha}
                firstDay={weekStart.getDay()}
                locale={esLocale}
                headerToolbar={false}
                allDaySlot={false}
                nowIndicator
                height='auto'
                slotDuration='01:00:00'
                slotMinTime={slotMinTime}
                slotMaxTime={slotMaxTime}
                slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                displayEventTime={false}
                dayHeaderClassNames={arg => (toYYYYMMDD(arg.date) === fecha ? 'day-selected' : '')}
                events={Object.entries(slotsByDate).flatMap(([date, daySlots]) =>
                  daySlots.map(slot => {
                    const dayOccupied = occupiedByDate[date] || []
                    const disabled = slotIsBlocked(slot, dayOccupied, selectedCourt, date)

                    const selected =
                      date === fecha && !disabled && selectedRange.some(item => item.start === slot.start)

                    return {
                      id: `${date}-${slot.start}`,
                      start: `${date}T${slot.start}:00`,
                      end:
                        slot.end === '24:00'
                          ? `${toYYYYMMDD(new Date(parseYYYYMMDD(date).getTime() + 24 * 60 * 60 * 1000))}T00:00:00`
                          : `${date}T${slot.end}:00`,
                      title: disabled ? 'Ocupado' : `S/ ${slot.precio}`,
                      classNames: [disabled ? 'slot-off' : 'slot-free', selected ? 'slot-selected' : ''].filter(
                        Boolean
                      ),
                      extendedProps: { disabled, start: slot.start, date, selected }
                    }
                  })
                )}
                eventClick={info => {
                  info.jsEvent.preventDefault()
                  if (info.event.extendedProps.disabled) return
                  chooseSlotAt(info.event.extendedProps.date, info.event.extendedProps.start)
                }}
                eventContent={arg => (
                  <span className={styles.fcEvent}>
                    {arg.event.extendedProps.disabled ? <i className='ri-lock-2-line' aria-hidden /> : null}
                    {arg.event.title}
                    {arg.event.extendedProps.selected ? (
                      <img src='/images/sidebar/icon-check.svg' alt='' className={styles.fcCheck} />
                    ) : null}
                  </span>
                )}
              />
            </div>
          ) : null}
        </section>
      ) : null}

      {selectedRange.length > 0 && selectedCourt ? <div className={styles.dockSpacer} aria-hidden /> : null}

      {selectedRange.length > 0 && selectedCourt ? (
        <BookingDock
          selectionKey={`${selectedCourt.id}|${fecha}|${selectedRange[0].start}|${selectedRange.length}|${reserveTotal}`}
          draft={{
            courtId: selectedCourt.id,
            courtName: selectedCourt.nombre,
            venueName: selectedCourt.SportsVenue?.name || 'Sede',
            fecha,
            dateLabel: formatLongDate(fecha),
            start: selectedRange[0].start,
            end: selectedRange[selectedRange.length - 1].end,
            hours: selectedRange.length,
            total: reserveTotal
          }}
          authenticated={status === 'authenticated'}
          playerName={session?.user?.name || ''}
        />
      ) : null}

      <BrandModal
        open={longBookingOpen}
        onClose={() => setLongBookingOpen(false)}
        kicker='Por seguridad'
        title='Reserva de más de 3 horas'
        actions={[
          { label: 'Cerrar', onClick: () => setLongBookingOpen(false) },
          venuePhone
            ? {
                label: 'Llamar',
                href: phoneTelHref(venuePhone),
                icon: 'ri-phone-line',
                variant: venueWhatsApp ? undefined : 'primary'
              }
            : null,
          venueWhatsApp
            ? {
                label: 'WhatsApp',
                href: `https://wa.me/${venueWhatsApp}?text=${encodeURIComponent(longBookingMessage)}`,
                icon: 'ri-whatsapp-line',
                variant: 'primary',
                external: true
              }
            : null
        ].filter(Boolean)}
      >
        <p className={modalStyles.lead}>
          Vemos que quieres reservar más de 3 horas. Por seguridad, las reservas largas se confirman con el
          administrador de la sede, para revisar la disponibilidad y el pago antes de dejar el horario tomado.
        </p>
        {selectedRange.length > 0 ? (
          <p className={modalStyles.meta}>
            {selectedCourt?.nombre} · {selectedRange[0].start}–{selectedRange[selectedRange.length - 1].end} ·{' '}
            {formatLongDate(fecha)}
          </p>
        ) : null}
        <div className={modalStyles.card}>
          <p className={modalStyles.cardTitle}>{selectedCourt?.SportsVenue?.name || 'Sede'}</p>
          {venueAddress ? <p className={modalStyles.cardText}>{venueAddress}</p> : null}
          {venuePhone ? (
            <a className={modalStyles.contact} href={phoneTelHref(venuePhone)}>
              <i className='ri-phone-line' aria-hidden />
              {venuePhone}
            </a>
          ) : (
            <p className={modalStyles.cardText}>Esta sede no tiene un teléfono publicado.</p>
          )}
          {selectedCourt?.SportsVenue?.email ? (
            <a className={modalStyles.contact} href={`mailto:${selectedCourt.SportsVenue.email}`}>
              <i className='ri-mail-line' aria-hidden />
              {selectedCourt.SportsVenue.email}
            </a>
          ) : null}
        </div>
      </BrandModal>

      <BrandModal
        open={Boolean(locationOpen)}
        onClose={() => setLocationOpen(null)}
        kicker='Sede'
        title={locationOpen?.name || 'Ubicación'}
        actions={[
          { label: 'Copiar ubicación', onClick: copyLocation, icon: 'ri-file-copy-line' },
          locationOpen?.address
            ? {
                label: 'Ir a Maps',
                href: mapsSearchUrl(locationOpen.address),
                icon: 'ri-map-pin-2-line',
                variant: 'primary',
                external: true
              }
            : null
        ].filter(Boolean)}
      >
        <div className={modalStyles.card}>
          <p className={modalStyles.cardTitle}>{locationOpen?.name}</p>
          <p className={modalStyles.cardText}>{locationOpen?.address}</p>
        </div>
      </BrandModal>
    </>
  )
}
