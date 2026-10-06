'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSelector } from 'react-redux'

import Skeleton from '@mui/material/Skeleton'
import FullCalendar from '@fullcalendar/react'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import esLocale from '@fullcalendar/core/locales/es'

import { useOccupiedSlots } from '@/views/explorar/hooks/useOccupiedSlots'
import boardStyles from '@/views/explorar/player-board.module.css'

import { loadAdminBlocks, loadAdminCourts, loadAdminSchedules } from './admin-api'
import AdminDock from './AdminDock'
import NewCourtForm from './NewCourtForm'
import styles from './admin-board.module.css'
import {
  addDaysYmd,
  formatLongDate,
  freeRanges,
  calendarStamp,
  hourSlots,
  mondayOf,
  normalizeBlocks,
  normalizeSchedules,
  parseYYYYMMDD,
  SHORT_DAYS,
  slotKind,
  timeToMinutes,
  toggleHour,
  toYYYYMMDD,
  weekdayOf
} from './schedule-model'

const HOURS = hourSlots()

export default function AdminCourtBoard() {
  const userId = useSelector(state => state.loginReducer.user?.id)
  const [courts, setCourts] = useState([])
  const [schedules, setSchedules] = useState([])
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [courtId, setCourtId] = useState(null)
  const [fecha, setFecha] = useState(() => toYYYYMMDD(new Date()))
  const [calendarView, setCalendarView] = useState('week')
  const [selection, setSelection] = useState(null)
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [addingCourt, setAddingCourt] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setLoadError('')

    try {
      const [courtRows, scheduleRows, blockRows] = await Promise.all([
        loadAdminCourts(userId),
        loadAdminSchedules(userId),
        loadAdminBlocks(userId)
      ])

      setCourts(courtRows)
      setSchedules(normalizeSchedules(scheduleRows))
      setBlocks(normalizeBlocks(blockRows))
      setCourtId(current => current || courtRows[0]?.id || null)
    } catch {
      setLoadError('No pudimos cargar tus canchas.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load, reloadKey])

  const court = courts.find(item => item.id === courtId) || null
  const byCourtSchedules = useMemo(
    () => schedules.filter(row => row.courtId === Number(courtId)),
    [schedules, courtId]
  )
  const byCourtBlocks = useMemo(
    () => blocks.filter(row => row.courtId === Number(courtId)),
    [blocks, courtId]
  )
  const today = toYYYYMMDD(new Date())
  const weekMonday = mondayOf(fecha)
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDaysYmd(weekMonday, index)),
    [weekMonday]
  )
  const visibleDates = calendarView === 'week' ? weekDates : [fecha]
  const { occupiedByDate, slotsLoading } = useOccupiedSlots(courtId, visibleDates.join('|'))

  const chooseHour = (date, start, kind) => {
    if (kind === 'booked') {
      setNotice('Esa hora ya está reservada. La reserva se queda aunque cambies el precio de las otras.')
      setFecha(date)

      return
    }

    setNotice('')
    setFecha(date)
    const startM = timeToMinutes(start)

    setSelection(current => {
      if (!current || current.date !== date) {
        return { date, ranges: [{ start: startM, end: startM + 60 }] }
      }

      const ranges = toggleHour(current.ranges, startM)

      return ranges.length ? { date, ranges } : null
    })
  }

  const selectDay = () => {
    const ranges = freeRanges(fecha, byCourtSchedules, byCourtBlocks, occupiedByDate[fecha] || [])

    const skipped = ranges.reduce((sum, range) => sum + (range.end - range.start) / 60, 0) < HOURS.length

    setNotice(
      ranges.length === 0
        ? 'Este día ya está reservado o no tiene horas libres.'
        : skipped
          ? 'Dejé afuera las horas que ya están reservadas.'
          : ''
    )
    setSelection(ranges.length ? { date: fecha, ranges } : null)
  }

  const shiftWeek = delta => {
    const next = addDaysYmd(weekMonday, delta * 7)

    setFecha(next)
    setSelection(null)
    setNotice('')
  }

  const goToday = () => {
    setFecha(today)
    setSelection(null)
    setNotice('')
    setCalendarView('day')
  }

  const draft = selection
    ? {
        courtId,
        courtName: court?.nombre || 'Cancha',
        date: selection.date,
        dateLabel: formatLongDate(selection.date),
        weekday: weekdayOf(selection.date),
        ranges: selection.ranges,
        hours: selection.ranges.reduce((sum, range) => sum + (range.end - range.start) / 60, 0),
        schedules: byCourtSchedules,
        blocks: byCourtBlocks,
        canOpen: selection.ranges.some(range =>
          HOURS.some(slot => {
            const start = timeToMinutes(slot.start)

            if (start < range.start || start >= range.end) return false

            return (
              slotKind({
                fecha: selection.date,
                start: slot.start,
                end: slot.end,
                schedules: byCourtSchedules,
                blocks: byCourtBlocks,
                occupied: occupiedByDate[selection.date] || []
              }).kind === 'closed'
            )
          })
        )
      }
    : null

  return (
    <div>
      <p className={boardStyles.courtPrompt}>
        Tus canchas
        <span>Elige una para ver el precio de cada hora, o agrega una nueva.</span>
      </p>

      {loading ? <Skeleton variant='rounded' height={72} /> : null}
      {loadError ? <p className={boardStyles.empty}>{loadError}</p> : null}

      {!loading && !loadError && courts.length > 0 ? (
        <div className={styles.chips} role='group' aria-label='Canchas'>
          {courts.map(item => (
            <button
              key={item.id}
              type='button'
              className={`${styles.chip} ${item.id === courtId ? styles.chipOn : ''}`}
              aria-pressed={item.id === courtId}
              onClick={() => {
                setCourtId(item.id)
                setAddingCourt(false)
                setSelection(null)
                setNotice('')
              }}
            >
              {item.nombre}
            </button>
          ))}
          {addingCourt || courts.length === 0 ? null : (
            <button type='button' className={styles.addCourt} onClick={() => setAddingCourt(true)}>
              <i className='ri-add-line' aria-hidden />
              Agregar cancha
            </button>
          )}
        </div>
      ) : null}

      {!loading && (addingCourt || courts.length === 0) && !loadError ? (
        <NewCourtForm
          userId={userId}
          onCancel={courts.length > 0 ? () => setAddingCourt(false) : null}
          onCreated={created => {
            if (created?.id) {
              setCourts(current => (current.some(item => item.id === created.id) ? current : [...current, created]))
              setCourtId(created.id)
            }

            setAddingCourt(false)
            setSelection(null)
            setNotice('Cancha lista. Toca las horas del calendario y ponles el precio.')
            setReloadKey(value => value + 1)
          }}
        />
      ) : null}

      {court ? (
        <section className={boardStyles.calendar}>
          <div className={boardStyles.calendarHead}>
            <div>
              <h2 className={boardStyles.calendarTitle}>
                <i className='ri-calendar-2-line' aria-hidden />
                {court.nombre}
              </h2>
              <p>Cada hora muestra su precio. Si dice «Sin precio», el jugador todavía no puede reservarla.</p>
            </div>
            <div className={boardStyles.calendarTools}>
              <div className={`${boardStyles.viewToggle} ${styles.viewToggle}`} role='group' aria-label='Cómo quieres ver el calendario'>
                <button type='button' aria-pressed={calendarView === 'day'} onClick={() => setCalendarView('day')}>
                  Ver un día
                </button>
                <button type='button' aria-pressed={calendarView === 'week'} onClick={() => setCalendarView('week')}>
                  Ver la semana
                </button>
              </div>
              <div className={styles.legend}>
                <span>
                  <i className={styles.swatchPrice} /> Precio por hora
                </span>
                <span>
                  <i className={styles.swatchEmpty} /> Sin precio
                </span>
                <span>
                  <i className={styles.swatchBooked} /> Reservada
                </span>
                <span>
                  <i className={styles.swatchClosed} /> Cerrada
                </span>
              </div>
            </div>
          </div>

          <div className={styles.when}>
            <button type='button' className={styles.navBtn} onClick={() => shiftWeek(-1)}>
              <i className='ri-arrow-left-s-line' aria-hidden />
              Semana pasada
            </button>
            <div className={styles.pickDay}>
              <p>Elige un día para ver solo esas horas</p>
              <div className={styles.days} role='group' aria-label='Días de esta semana'>
                {weekDates.map(date => (
                  <button
                    key={date}
                    type='button'
                    className={`${styles.day} ${date === fecha ? styles.dayOn : ''}`}
                    aria-pressed={date === fecha}
                    onClick={() => {
                      setFecha(date)
                      setCalendarView('day')
                      setSelection(null)
                      setNotice('')
                    }}
                  >
                    <span>{date === today ? 'Hoy' : SHORT_DAYS[weekdayOf(date)]}</span>
                    <strong>{parseYYYYMMDD(date).getDate()}</strong>
                  </button>
                ))}
              </div>
            </div>
            <button type='button' className={styles.navBtn} onClick={() => shiftWeek(1)}>
              Semana siguiente
              <i className='ri-arrow-right-s-line' aria-hidden />
            </button>
          </div>
          {fecha === today ? null : (
            <button type='button' className={styles.todayBtn} onClick={goToday}>
              Volver a hoy
            </button>
          )}

          <button type='button' className={styles.markDay} onClick={selectDay}>
            <strong>Marcar todas las horas del {formatLongDate(fecha)}</strong>
            <span>De 00:00 a 24:00. Las que ya están reservadas no se marcan. El resto puedes cerrarlo.</span>
          </button>

          {notice ? <p className={styles.notice}>{notice}</p> : null}
          {slotsLoading ? <Skeleton variant='rounded' height={280} /> : null}

          <div className={`${boardStyles.agenda} ${calendarView === 'week' ? boardStyles.agendaWeek : ''}`}>
            <FullCalendar
              key={`${court.id}-${calendarView}-${calendarView === 'week' ? weekMonday : fecha}`}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView={calendarView === 'week' ? 'timeGridWeek' : 'timeGridDay'}
              initialDate={calendarView === 'week' ? weekMonday : fecha}
              firstDay={1}
              locale={esLocale}
              headerToolbar={false}
              allDaySlot={false}
              nowIndicator
              height='auto'
              slotDuration='01:00:00'
              slotMinTime='00:00:00'
              slotMaxTime='24:00:00'
              scrollTime='06:00:00'
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
              displayEventTime={false}
              dayHeaderClassNames={arg => (toYYYYMMDD(arg.date) === fecha ? 'day-selected' : '')}
              events={visibleDates.flatMap(date =>
                HOURS.map(slot => {
                  const status = slotKind({
                    fecha: date,
                    start: slot.start,
                    end: slot.end,
                    schedules: byCourtSchedules,
                    blocks: byCourtBlocks,
                    occupied: occupiedByDate[date] || []
                  })
                  const startM = timeToMinutes(slot.start)
                  const selected = selection?.date === date && selection.ranges.some(range => startM >= range.start && startM < range.end)

                  return {
                    id: `${date}-${slot.start}`,
                    start: calendarStamp(date, slot.startM),
                    end: calendarStamp(date, slot.endM),
                    title: status.label,
                    classNames: [`slot-${status.kind}`, selected ? 'slot-selected' : ''].filter(Boolean),
                    extendedProps: { date, start: slot.start, kind: status.kind, price: status.price, selected }
                  }
                })
              )}
              eventClick={info => {
                info.jsEvent.preventDefault()
                const { date, start, kind } = info.event.extendedProps

                chooseHour(date, start, kind)
              }}
              eventContent={arg => (
                <span className={boardStyles.fcEvent}>
                  {arg.event.extendedProps.kind === 'booked' ? <i className='ri-lock-2-line' aria-hidden /> : null}
                  {arg.event.extendedProps.kind === 'closed' ? <i className='ri-close-circle-line' aria-hidden /> : null}
                  {arg.event.extendedProps.selected && arg.event.extendedProps.kind !== 'priced' ? (
                    'Seleccionada'
                  ) : arg.event.extendedProps.kind === 'priced' ? (
                    <span className={styles.hourPrice}>
                      {arg.event.title}
                      <small>por hora</small>
                    </span>
                  ) : (
                    arg.event.title
                  )}
                  {arg.event.extendedProps.selected ? (
                    <img src='/images/sidebar/icon-check.svg' alt='' className={boardStyles.fcCheck} />
                  ) : null}
                </span>
              )}
            />
          </div>
        </section>
      ) : null}

      {draft ? <div className={boardStyles.dockSpacer} aria-hidden /> : null}
      {draft ? (
        <AdminDock
          flowKey={`${courtId}|${draft.date}|${reloadKey}`}
          rangesKey={draft.ranges.map(range => `${range.start}-${range.end}`).join(',')}
          draft={draft}
          onSaved={() => {
            setSelection(null)
            setNotice('')
            setReloadKey(value => value + 1)
          }}
        />
      ) : null}
    </div>
  )
}
