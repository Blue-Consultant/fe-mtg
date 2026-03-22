'use client'

import { useEffect, useState, useCallback, forwardRef, useRef } from 'react'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import {
  Box,
  Stack,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  ButtonBase,
  Alert,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material'

import Skeleton from '@mui/material/Skeleton'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import { getCourtDetail, getCourtOccupiedSlots, searchCourts } from '@/views/courts/api'
import CourtCardHorizontal from './components/CourtCardHorizontal'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import styles from './explorar-detail.module.css'
import { createPreference } from './api'

const DEFAULT_COURT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop'
const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Emoji según nombre del tipo de cancha (fallback genérico). */
const sportEmojiForTypeName = nombre => {
  if (!nombre || typeof nombre !== 'string') return '🏟️'
  const n = nombre.toLowerCase()
  if (n.includes('fútbol') || n.includes('futbol')) return '⚽'
  if (n.includes('vóley') || n.includes('voley') || n.includes('volley')) return '🏐'
  if (n.includes('básquet') || n.includes('basquet') || n.includes('basket')) return '🏀'
  if (n.includes('tenis')) return '🎾'
  if (n.includes('pádel') || n.includes('padel')) return '🎾'
  if (n.includes('squash')) return '🎾'
  return '🏟️'
}

/** Fecha calendario local YYYY-MM-DD (evita desfase UTC de toISOString). */
const toYYYYMMDD = d => {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const startOfLocalToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Convierte "HH:mm" a minutos desde medianoche */
const timeToMinutes = str => {
  if (!str || typeof str !== 'string') return 0
  const [h, m] = str.trim().split(':').map(Number)

  return (h || 0) * 60 + (m || 0)
}

/** Suma horas a una hora "HH:mm" y devuelve "HH:mm" */
const addHoursToTime = (startStr, hours) => {
  const totalM = timeToMinutes(startStr) + Math.round(hours * 60)
  const h = Math.floor(totalM / 60) % 24
  const m = totalM % 60

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** ¿Alguna reserva existente solapa con [slotStart, slotEnd)? */
const reservationOverlapsSlot = (occupiedList, slotStart, slotEnd) =>
  occupiedList.some(
    o =>
      timeToMinutes(o.hora_inicio) < timeToMinutes(slotEnd) &&
      timeToMinutes(o.hora_fin) > timeToMinutes(slotStart)
  )

/** Genera slots de 1 hora por cada bloque de horario del día (ej: 08:00-23:00 → 08:00-09:00, 09:00-10:00, ...) */
const buildHourlySlots = schedules => {
  if (!Array.isArray(schedules) || schedules.length === 0) return []
  const out = []

  schedules.forEach(s => {
    const startM = timeToMinutes(s.hora_inicio)
    const endM = timeToMinutes(s.hora_fin)
    const precio = s.precio != null ? Number(s.precio) : 0

    for (let m = startM; m < endM; m += 60) {
      const h = Math.floor(m / 60)
      const start = `${String(h).padStart(2, '0')}:00`
      const end = `${String(h + 1).padStart(2, '0')}:00`

      out.push({ start, end, precio })
    }
  })

  return out
}

const DatePickerInput = forwardRef(({ value, onClick, onChange, ...rest }, ref) => (
  <TextField
    fullWidth
    size='small'
    label='Fecha'
    value={value ?? ''}
    onClick={onClick}
    onChange={onChange}
    inputRef={ref}
    InputLabelProps={{ shrink: true }}
    inputProps={{ readOnly: true }}
    variant='outlined'
    {...rest}
  />
))

DatePickerInput.displayName = 'DatePickerInput'

const PAYMENT_METHODS = [
  { value: 'credit', label: 'Tarjeta de crédito/débito', icon: 'ri-bank-card-line' },
  { value: 'yape', label: 'Yape / Plin', icon: 'ri-smartphone-line' },
  { value: 'cash', label: 'Efectivo en el lugar', icon: 'ri-money-dollar-circle-line' }
]

const ExploreCourtDetailView = ({ courtId, lang, onlyDetail = false }) => {
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [otherCourts, setOtherCourts] = useState([])
  const [reservaFecha, setReservaFecha] = useState(() => toYYYYMMDD(new Date()))
  const [selectedStartTime, setSelectedStartTime] = useState(null) // hora de inicio "08:00"
  const [horasReserva, setHorasReserva] = useState(1)
  const [occupiedSlots, setOccupiedSlots] = useState([]) // [{ hora_inicio, hora_fin }] desde API para reservaFecha
  const [isFavorite, setIsFavorite] = useState(false)
  const otherCourtsScrollRef = useRef(null)
  const [carouselCanScrollLeft, setCarouselCanScrollLeft] = useState(false)
  const [carouselCanScrollRight, setCarouselCanScrollRight] = useState(false)
  const CARD_WIDTH = 280
  const CARD_GAP = 16
  const scrollAmount = CARD_WIDTH + CARD_GAP

  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState(null)

  const { data: session, status } = useSession()
  const router = useRouter()

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: court?.nombre,
          url: typeof window !== 'undefined' ? window.location.href : '',
          text: court?.nombre
        })
        .catch(() => {})
    } else {
      navigator.clipboard?.writeText(typeof window !== 'undefined' ? window.location.href : '')
    }
  }, [court?.nombre])

  const toggleFavorite = useCallback(() => {
    setIsFavorite(f => !f)
  }, [])

  const loadCourt = useCallback(() => {
    if (!courtId) return
    setLoading(true)
    setError(null)
    getCourtDetail(courtId)
      .then(data => setCourt(data))
      .catch(() => setError('No se pudo cargar la cancha'))
      .finally(() => setLoading(false))
  }, [courtId])

  useEffect(() => {
    loadCourt()
  }, [loadCourt])

  useEffect(() => {
    if (!court?.id || !reservaFecha || !/^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)) {
      setOccupiedSlots([])
      return
    }
    let cancelled = false
    getCourtOccupiedSlots(court.id, reservaFecha).then(slots => {
      if (!cancelled) setOccupiedSlots(Array.isArray(slots) ? slots : [])
    })
    return () => {
      cancelled = true
    }
  }, [court?.id, reservaFecha])

  useEffect(() => {
    if (!selectedStartTime || horasReserva < 1) return
    const slotEnd = addHoursToTime(selectedStartTime, horasReserva)
    if (reservationOverlapsSlot(occupiedSlots, selectedStartTime, slotEnd)) {
      setSelectedStartTime(null)
    }
  }, [occupiedSlots, selectedStartTime, horasReserva])

  /** Si la fecha quedó en el pasado (medianoche, pestaña abierta) o la hora ya pasó hoy, limpiar selección. */
  useEffect(() => {
    if (!reservaFecha || !/^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)) return
    const todayStr = toYYYYMMDD(new Date())
    if (reservaFecha < todayStr) {
      setReservaFecha(todayStr)
      setSelectedStartTime(null)
      return
    }
    if (!selectedStartTime) return
    if (reservaFecha === todayStr) {
      const slotStartMs = new Date(`${reservaFecha}T${selectedStartTime}:00`).getTime()
      if (slotStartMs <= Date.now()) setSelectedStartTime(null)
    }
  }, [reservaFecha, selectedStartTime])

  useEffect(() => {
    const todayStr = toYYYYMMDD(new Date())

    searchCourts(todayStr, '06:00', '23:00', null, 1, 12)
      .then(response => {
        const list = response?.data ?? []
        const filtered = list.filter(c => Number(c.id) !== Number(courtId)).slice(0, 12)

        setOtherCourts(filtered)
      })
      .catch(() => setOtherCourts([]))
  }, [courtId])

  const updateCarouselScrollState = useCallback(() => {
    const el = otherCourtsScrollRef.current

    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const hasScroll = scrollWidth > clientWidth

    setCarouselCanScrollLeft(hasScroll && scrollLeft > 10)
    setCarouselCanScrollRight(hasScroll && scrollLeft < scrollWidth - clientWidth - 10)
  }, [])

  useEffect(() => {
    if (otherCourts.length === 0) return
    updateCarouselScrollState()
    const el = otherCourtsScrollRef.current

    if (!el) return
    el.addEventListener('scroll', updateCarouselScrollState)
    const ro = new ResizeObserver(updateCarouselScrollState)

    ro.observe(el)

    return () => {
      el.removeEventListener('scroll', updateCarouselScrollState)
      ro.disconnect()
    }
  }, [otherCourts.length, updateCarouselScrollState])

  const handleCarouselPrev = useCallback(() => {
    otherCourtsScrollRef.current?.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }, [scrollAmount])

  const handleCarouselNext = useCallback(() => {
    otherCourtsScrollRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }, [scrollAmount])

  if (loading && !court) {
    return (
      <Box className={styles.detailRoot}>
        <Skeleton variant='text' width={120} height={36} className={styles.backLink} />
        <div className={styles.detailHeader}>
          <Skeleton variant='text' width={280} height={40} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant='circular' width={40} height={40} />
            <Skeleton variant='circular' width={40} height={40} />
          </Box>
        </div>
        <div className={styles.pageSplit}>
          <div className={styles.mainColumn}>
            <Skeleton variant='rectangular' className={styles.galleryGrid} style={{ minHeight: 280 }} />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant='text' width='100%' height={24} />
              <Skeleton variant='text' width='80%' height={20} />
              <Skeleton variant='rectangular' width='100%' height={120} sx={{ mt: 2, borderRadius: 1 }} />
            </Box>
          </div>
          <Box sx={{ minWidth: 0 }}>
            <Skeleton variant='rectangular' height={320} sx={{ borderRadius: 2 }} />
          </Box>
        </div>
      </Box>
    )
  }

  if (error || (!loading && !court)) {
    return (
      <Box className={styles.detailRoot}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error || 'Cancha no encontrada'}
        </Alert>
        <Link href={`/${lang}/explorar`} passHref legacyBehavior>
          <Button component='a' variant='contained'>
            Volver a explorar canchas
          </Button>
        </Link>
      </Box>
    )
  }

  const typeName = court.court_types?.nombre || 'Sin tipo'
  const venue = court.SportsVenue
  const schedules = court.PriceSchedules || []
  const blocks = court.DateBlocks || []
  const ratingAvg = court.rating_avg != null ? Number(court.rating_avg) : null
  const ratingCount = court.rating_count ?? 0
  const imageSrc = court.imagen || venue?.logo || DEFAULT_COURT_IMAGE
  const galleryImages = [imageSrc, imageSrc, imageSrc, imageSrc, imageSrc]

  const minPrecioHora =
    schedules.length > 0
      ? Math.min(...schedules.map(s => (s.precio != null ? Number(s.precio) : Number.POSITIVE_INFINITY)))
      : null
  const precioCardValue =
    minPrecioHora != null && Number.isFinite(minPrecioHora) ? `S/ ${minPrecioHora.toFixed(0)}` : '—'

  const capNum = court.capacidad != null ? Number(court.capacidad) : null
  const jugadoresCardValue =
    capNum != null && capNum > 0 ? `${Math.max(1, Math.ceil(capNum / 2))} – ${capNum}` : '—'
  const capacidadCardValue = capNum != null && capNum > 0 ? String(capNum) : '—'

  const locationSubtitle = [venue?.name, venue?.city].filter(Boolean).join(' · ')
  const sportEmoji = sportEmojiForTypeName(typeName)
  const schedulesSorted = [...schedules].sort((a, b) => Number(a.dia_semana) - Number(b.dia_semana))

  const descripcionDelPropietario =
    typeof court.descripcion === 'string' && court.descripcion.trim().length > 0 ? court.descripcion.trim() : ''

  const descripcionMostrada =
    descripcionDelPropietario ||
    (() => {
      const tipoFragment =
        typeName && typeName !== 'Sin tipo' ? ` de ${typeName.toLowerCase()}` : ' deportiva'
      const partes = [
        `${court.nombre} es una cancha${tipoFragment} que puedes reservar con nosotros de forma simple y segura.`
      ]
      if (locationSubtitle) partes.push(`La encuentras en ${locationSubtitle}.`)
      if (capNum != null && capNum > 0) {
        partes.push(`Pensada para grupos de hasta ${capNum} personas.`)
      }
      if (minPrecioHora != null && Number.isFinite(minPrecioHora)) {
        partes.push(`Tarifas desde S/ ${minPrecioHora.toFixed(0)} por hora, según el día y la franja.`)
      }
      partes.push(
        'Más abajo verás los horarios disponibles y podrás elegir fecha, duración y hora para completar tu reserva.'
      )
      return partes.join(' ')
    })()

  const todayStart = startOfLocalToday()

  const reservaFechaDate =
    reservaFecha && /^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)
      ? new Date(`${reservaFecha}T12:00:00`)
      : todayStart

  const todayStrLocal = toYYYYMMDD(new Date())
  const isReservaDiaHoy = reservaFecha === todayStrLocal

  const isSlotStartInPast = slotStart => {
    if (!isReservaDiaHoy || !/^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)) return false
    return new Date(`${reservaFecha}T${slotStart}:00`).getTime() <= Date.now()
  }

  const dayOfWeek = reservaFechaDate.getDay()
  const schedulesForSelectedDay = schedules.filter(s => Number(s.dia_semana) === dayOfWeek)
  const hourlySlots = buildHourlySlots(schedulesForSelectedDay)

  const selectedSlotData = selectedStartTime ? hourlySlots.find(s => s.start === selectedStartTime) : null

  const horaFinReserva = selectedStartTime && horasReserva >= 1 ? addHoursToTime(selectedStartTime, horasReserva) : null

  const scheduleStart = schedulesForSelectedDay.length
    ? schedulesForSelectedDay.reduce((min, s) => {
        const m = timeToMinutes(s.hora_inicio)

        return m < timeToMinutes(min) ? s.hora_inicio : min
      }, '23:59')
    : '00:00'

  const scheduleEnd = schedulesForSelectedDay.length
    ? schedulesForSelectedDay.reduce((max, s) => {
        const m = timeToMinutes(s.hora_fin)

        return m > timeToMinutes(max) ? s.hora_fin : max
      }, '00:00')
    : '00:00'

  const maxHorasVentana = schedulesForSelectedDay.length
    ? (timeToMinutes(scheduleEnd) - timeToMinutes(scheduleStart)) / 60
    : 5

  const horasOptions = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].filter(h => h <= maxHorasVentana)

  if (horasOptions.length === 0) horasOptions.push(1)

  // Slots de inicio válidos para la duración elegida: solo los que caben hasta scheduleEnd
  const startSlotsForDuration = hourlySlots.filter(slot => {
    const endTime = addHoursToTime(slot.start, horasReserva)

    return timeToMinutes(endTime) <= timeToMinutes(scheduleEnd)
  })

  const bookingParams = new URLSearchParams()

  if (court.id) bookingParams.set('courtId', court.id)
  if (reservaFecha) bookingParams.set('fecha', reservaFecha)
  if (selectedStartTime) bookingParams.set('hora_inicio', selectedStartTime)
  if (horaFinReserva) bookingParams.set('hora_fin', horaFinReserva)
  if (horasReserva) bookingParams.set('horas', String(horasReserva))
  // const bookingUrl = `/${lang}/booking?${bookingParams.toString()}`

  const precioHora = selectedSlotData?.precio != null ? Number(selectedSlotData.precio) : 0
  const totalPagar = precioHora * horasReserva
  const resumenCompleto = reservaFecha && selectedStartTime && horasReserva >= 1
  const canSelectSlots = court.estado !== false

  const handleIrAPagar = async () => {
    setPayError(null)

    console.log(status, session)

    const todayPay = toYYYYMMDD(new Date())
    if (!reservaFecha || reservaFecha < todayPay) {
      setPayError('No puedes reservar en una fecha pasada.')
      return
    }
    if (selectedStartTime && reservaFecha === todayPay) {
      if (new Date(`${reservaFecha}T${selectedStartTime}:00`).getTime() <= Date.now()) {
        setPayError('Ese horario ya no está disponible.')
        return
      }
    }

    if (status !== 'authenticated' || !session?.user?.id) {
      const returnPath = typeof window !== 'undefined' ? window.location.pathname : `/${lang}/explorar/${courtId}`
      router.push(`/${lang}/login?redirectTo=${encodeURIComponent(returnPath)}`)
      return
    }

    setPayLoading(true)
    try {
      const response = await createPreference({
        courtId: court.id,
        courtName: court.nombre,
        fecha: reservaFecha,
        hora_inicio: selectedStartTime,
        hora_fin: horaFinReserva,
        horas: horasReserva,
        precio_hora: Number(precioHora),
        total: totalPagar,
        currency_id: 'PEN',
      })
      if (response?.init_point) {
        window.location.href = response.init_point
        return
      }
      setPayError('No se recibió URL de pago')
    } catch (error) {
      setPayError(error.message)
    } finally {
      setPayLoading(false)
    }
  }

  const isSlotOccupied = (slotStart, slotEnd) => reservationOverlapsSlot(occupiedSlots, slotStart, slotEnd)

  const fechaFormateada =
    reservaFecha && /^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)
      ? new Date(reservaFecha + 'T12:00:00').toLocaleDateString('es-PE', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : ''

  return (
    <Box className={styles.detailRoot}>
      {!onlyDetail && (
        <Link href={`/${lang}/explorar`} passHref legacyBehavior>
          <Button
            component='a'
            variant='outlined'
            color='primary'
            startIcon={<i className='ri-arrow-left-line' />}
            className={styles.backLink}
            sx={{ fontWeight: 600 }}
          >
            Volver a explorar canchas
          </Button>
        </Link>
      )}

      {/* Cabecera estilo Airbnb: nombre izquierda, acciones derecha */}
      <Box component='header' className={styles.detailHeader}>
        <Stack direction='row' alignItems='center' spacing={0.25} className={styles.detailActions}>
          <Tooltip title='Compartir'>
            <IconButton onClick={handleShare} aria-label='Compartir' color='inherit' size='medium'>
              <i className='ri-share-line' style={{ fontSize: '1.25rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
            <IconButton onClick={toggleFavorite} aria-label='Favoritos' color='inherit' size='medium'>
              <i
                className={isFavorite ? 'ri-heart-fill' : 'ri-heart-line'}
                style={{ fontSize: '1.25rem', color: isFavorite ? '#e53935' : undefined }}
              />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Galería + ficha a la izquierda, formulario de reserva a la derecha (sticky) */}
      <Box className={styles.pageSplit}>
        <Box className={styles.mainColumn}>
          <Box className={styles.galleryGrid}>
            <Box className={styles.galleryMain}>
              <OptimizedS3Image
                src={galleryImages[0]}
                alt={court.nombre}
                fill
                className='object-cover'
                sizes='(max-width: 899px) 100vw, 40vw'
              />
            </Box>
            <Box className={styles.gallerySide}>
              {galleryImages.slice(0, 4).map((src, idx) => (
                <Box key={idx} className={styles.galleryCell}>
                  <OptimizedS3Image
                    src={src}
                    alt={`${court.nombre} ${idx + 1}`}
                    fill
                    className='object-cover'
                    sizes='(max-width: 899px) 50vw, 20vw'
                  />
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={styles.infoColumn}>
          <Box component='section' className={styles.detailSection}>
            <Typography variant='h1' className={styles.detailTitle}>
              {court.nombre}
            </Typography>

            <Stack direction='row' flexWrap='wrap' alignItems='center' spacing={0.5} className={styles.detailHeadMeta}>
              {ratingCount > 0 ? (
                <Stack direction='row' alignItems='center' spacing={0.35} className={styles.detailRatingLine}>
                  <Rating value={ratingAvg ?? 0} precision={0.1} size='small' readOnly sx={{ mr: 0.25 }} />
                  <Typography component='span' variant='body2' className={styles.detailRatingScore}>
                    {ratingAvg != null ? ratingAvg.toFixed(1) : '—'}
                  </Typography>
                  <Typography component='span' variant='body2' className={styles.detailRatingCount}>
                    ({ratingCount} {ratingCount === 1 ? 'reseña' : 'reseñas'})
                  </Typography>
                </Stack>
              ) : (
                <Typography component='span' variant='body2' className={styles.detailRatingCount}>
                  Sin reseñas aún
                </Typography>
              )}
              {locationSubtitle ? (
                <Stack direction='row' alignItems='center' spacing={0.35} className={styles.detailLocationWrap}>
                  <i className={`ri-map-pin-line ${styles.detailLocationIcon}`} aria-hidden />
                  <Typography component='span' variant='body2' className={styles.detailLocationLine}>
                    {locationSubtitle}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>

            <Box className={styles.statCardsRow}>
              <Paper elevation={0} className={styles.statCard}>
                <Typography component='div' className={`${styles.statCardValue} ${styles.statCardValueAccent}`}>
                  {precioCardValue}
                </Typography>
                <Typography component='div' className={styles.statCardLabel}>
                  Precio por hora
                </Typography>
              </Paper>
              <Paper elevation={0} className={styles.statCard}>
                <Typography component='div' className={styles.statCardValue}>
                  {jugadoresCardValue}
                </Typography>
                <Typography component='div' className={styles.statCardLabel}>
                  Jugadores
                </Typography>
              </Paper>
              <Paper elevation={0} className={styles.statCard}>
                <Typography component='div' className={styles.statCardValue}>
                  {capacidadCardValue}
                </Typography>
                <Typography component='div' className={styles.statCardLabel}>
                  Capacidad máx.
                </Typography>
              </Paper>
            </Box>

            <Typography variant='body1' className={styles.descriptionBlock} component='p'>
              {descripcionMostrada}
            </Typography>

            <Stack direction='row' alignItems='center' flexWrap='wrap' spacing={0.75} className={styles.sportInfoCard}>
              <Typography component='span' variant='body2' className={styles.sportInfoSport}>
                <Box component='span' className={styles.sportInfoEmoji} aria-hidden>
                  {sportEmoji}
                </Box>
                {typeName}
              </Typography>
              {court.estado ? (
                <Chip
                  size='small'
                  icon={<i className='ri-check-line' aria-hidden />}
                  label='Disponible'
                  color='success'
                  variant='outlined'
                  sx={{ fontWeight: 500, '& .MuiChip-icon': { fontSize: '1rem' } }}
                />
              ) : null}
            </Stack>

            {blocks.length > 0 && (
              <Paper variant='outlined' className={styles.dateBlocksCard} elevation={0}>
                <Typography variant='subtitle2' component='span' className={styles.dateBlocksCardTitle}>
                  Fechas bloqueadas
                </Typography>
                <List dense disablePadding className={styles.blocksList}>
                  {blocks.map(row => (
                    <ListItem key={row.id} disableGutters sx={{ py: 0.25, pl: 2 }}>
                      <ListItemText
                        primary={`${new Date(row.fecha_inicio).toLocaleDateString('es-PE', { dateStyle: 'short' })} – ${new Date(row.fecha_fin).toLocaleDateString('es-PE', { dateStyle: 'short' })}${row.motivo ? ` · ${row.motivo}` : ''}`}
                        primaryTypographyProps={{ variant: 'body2', className: styles.blocksListText }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          {/* Horarios disponibles */}
          <Box component='section' className={styles.detailSection}>
            <Typography variant='h6' component='h3' className={styles.detailSectionTitle}>
              Horarios disponibles
            </Typography>
            {schedules.length === 0 ? (
              <Typography variant='body2' color='text.secondary'>
                No hay horarios definidos.
              </Typography>
            ) : (
              <Box className={styles.schedulesPanel}>
                <Stack
                  direction='row'
                  spacing={2}
                  useFlexGap
                  flexWrap='wrap'
                  alignItems='stretch'
                  className={styles.schedulesStack}
                >
                  {schedulesSorted.map((row, idx) => (
                    <Box
                      key={`${row.dia_semana}-${row.hora_inicio}-${idx}`}
                      className={styles.scheduleStackItem}
                      sx={{ maxWidth: '100%' }}
                    >
                      <Typography variant='subtitle2' component='div' className={styles.schedulePanelDay}>
                        {DAYS_OF_WEEK[row.dia_semana] ?? row.dia_semana}
                      </Typography>
                      <Stack spacing={0.35} className={styles.schedulePanelMeta} sx={{ width: '100%' }}>
                        <Typography variant='body2' component='div' className={styles.schedulePanelTime}>
                          {row.hora_inicio} – {row.hora_fin}
                        </Typography>
                        <Typography variant='body2' component='div' className={styles.schedulePanelPrice}>
                          S/ {Number(row.precio).toFixed(0)} / hora
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Métodos de pago */}
          <Box component='section' className={styles.detailSection}>
            <Typography variant='h6' component='h3' className={styles.detailSectionTitle}>
              Métodos de pago
            </Typography>
            <Stack direction='row' flexWrap='wrap' alignItems='center' className={styles.paymentRow}>
              {PAYMENT_METHODS.map((m, idx) => (
                <Stack
                  key={m.value}
                  direction='row'
                  alignItems='center'
                  spacing={0.35}
                  component='span'
                  className={styles.paymentRowItem}
                >
                  {idx > 0 ? (
                    <Typography component='span' variant='body2' className={styles.paymentRowDot}>
                      {' · '}
                    </Typography>
                  ) : null}
                  <i className={m.icon} />
                  <Typography component='span' variant='body2'>
                    {m.label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant='body2' color='text.secondary' className={styles.paymentRowNote}>
              Al reservar podrás elegir el método de pago.
            </Typography>
          </Box>
        </Box>
        </Box>

        <Box component='aside' className={styles.reservationColumn}>
          <Paper elevation={0} className={`${styles.reservationBlock} ${styles.reservationFormLight}`}>
            <Typography variant='subtitle1' component='h3' className={styles.reservationBlockTitle}>
              <i className='ri-calendar-event-line' />
              Elige tu fecha y horario
            </Typography>

            <Box className={styles.reservationStep}>
              <Typography variant='overline' component='span' display='block' className={styles.reservationStepLabel}>
                1. Selecciona el día
              </Typography>
              <AppReactDatepicker
                selected={reservaFechaDate}
                onChange={date => {
                  if (date) {
                    setReservaFecha(toYYYYMMDD(date))
                    setSelectedStartTime(null)
                  }
                }}
                dateFormat='dd/MM/yyyy'
                placeholderText='Elige la fecha'
                customInput={<DatePickerInput />}
                popperPlacement='bottom-start'
                minDate={todayStart}
                filterDate={d => {
                  if (!d) return false
                  const t0 = startOfLocalToday().getTime()
                  const c = new Date(d)
                  c.setHours(0, 0, 0, 0)
                  return c.getTime() >= t0
                }}
              />
            </Box>

            {reservaFecha && (
              <>
                <Box className={styles.reservationStep}>
                  <Typography variant='overline' component='span' display='block' className={styles.reservationStepLabel}>
                    2. ¿Cuántas horas quieres reservar?
                  </Typography>
                  <FormControl fullWidth size='small' className={styles.reservationSelect}>
                    <InputLabel id='horas-reserva-label'>Horas</InputLabel>
                    <Select
                      labelId='horas-reserva-label'
                      label='Horas'
                      value={horasOptions.includes(horasReserva) ? horasReserva : (horasOptions[0] ?? 1)}
                      onChange={e => {
                        setHorasReserva(Number(e.target.value))
                        setSelectedStartTime(null)
                      }}
                    >
                      {horasOptions.map(h => (
                        <MenuItem key={h} value={h}>
                          {`${Math.floor(h)}${h % 1 === 0.5 ? ' h 30 min' : ' h'}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className={styles.reservationStep}>
                  <Typography variant='overline' component='span' display='block' className={styles.reservationStepLabel}>
                    3. Elige tu hora de inicio ({DAYS_OF_WEEK[dayOfWeek]})
                  </Typography>
                  {startSlotsForDuration.length === 0 ? (
                    <Typography variant='body2' color='text.secondary' className={styles.reservationEmpty}>
                      No hay bloques de {horasReserva} h para este día. Prueba otra duración o fecha.
                    </Typography>
                  ) : (
                    <>
                      <Stack direction='row' flexWrap='wrap' className={styles.slotsLegend} spacing={1} useFlexGap>
                        <Stack direction='row' alignItems='center' spacing={0.35} component='span' className={styles.slotsLegendItem}>
                          <Box component='span' className={styles.slotsLegendDotAvailable} />
                          <Typography variant='caption' color='text.secondary'>
                            Disponible
                          </Typography>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={0.35} component='span' className={styles.slotsLegendItem}>
                          <Box component='span' className={styles.slotsLegendDotOccupied} />
                          <Typography variant='caption' color='text.secondary'>
                            Ocupado
                          </Typography>
                        </Stack>
                        <Stack direction='row' alignItems='center' spacing={0.35} component='span' className={styles.slotsLegendItem}>
                          <Box component='span' className={styles.slotsLegendDotUnavailable} />
                          <Typography variant='caption' color='text.secondary'>
                            No disponible
                          </Typography>
                        </Stack>
                      </Stack>
                      <Box className={styles.slotsGrid}>
                        {startSlotsForDuration.map(slot => {
                          const slotEnd = addHoursToTime(slot.start, horasReserva)
                          const occupied = isSlotOccupied(slot.start, slotEnd)
                          const pastSlot = isSlotStartInPast(slot.start)
                          const unavailable = !canSelectSlots
                          const disabled = occupied || unavailable || pastSlot
                          const selected = !disabled && selectedStartTime === slot.start

                          return (
                            <ButtonBase
                              key={`${slot.start}-${slotEnd}`}
                              type='button'
                              className={`${styles.slotCell} ${occupied ? styles.slotCellOccupied : ''} ${(unavailable && !occupied) || pastSlot ? styles.slotCellUnavailable : ''} ${selected ? styles.slotCellSelected : ''}`}
                              onClick={() => !disabled && setSelectedStartTime(slot.start)}
                              disabled={disabled}
                              focusRipple
                              title={
                                pastSlot
                                  ? 'Este horario ya pasó'
                                  : unavailable
                                    ? 'Cancha no disponible para reserva'
                                    : occupied
                                      ? 'Este horario ya está reservado'
                                      : `De ${slot.start} a ${slotEnd} · S/ ${slot.precio}/h`
                              }
                            >
                              <Typography component='span' variant='caption' className={styles.slotCellTime} display='block'>
                                {slot.start} – {slotEnd}
                              </Typography>
                              {!disabled ? (
                                <Typography component='span' variant='caption' className={styles.slotCellPrice} display='block'>
                                  S/ {slot.precio}/h
                                </Typography>
                              ) : null}
                            </ButtonBase>
                          )
                        })}
                      </Box>
                    </>
                  )}

                  {resumenCompleto ? (
                    <Paper elevation={0} className={styles.resumenBlock}>
                      <Typography variant='subtitle1' component='h4' className={styles.resumenTitle}>
                        Resumen de tu reserva
                      </Typography>
                      <Stack spacing={0}>
                        <Stack direction='row' justifyContent='space-between' alignItems='baseline' className={styles.resumenRow}>
                          <Typography variant='body2' component='span' className={styles.resumenLabel}>
                            Cancha
                          </Typography>
                          <Typography variant='body2' component='span' className={styles.resumenValue}>
                            {court.nombre}
                          </Typography>
                        </Stack>
                        <Stack direction='row' justifyContent='space-between' alignItems='baseline' className={styles.resumenRow}>
                          <Typography variant='body2' component='span' className={styles.resumenLabel}>
                            Fecha
                          </Typography>
                          <Typography variant='body2' component='span' className={styles.resumenValue}>
                            {fechaFormateada}
                          </Typography>
                        </Stack>
                        <Stack direction='row' justifyContent='space-between' alignItems='baseline' className={styles.resumenRow}>
                          <Typography variant='body2' component='span' className={styles.resumenLabel}>
                            Horario
                          </Typography>
                          <Typography variant='body2' component='span' className={styles.resumenValue}>
                            De {selectedStartTime} a {horaFinReserva}
                          </Typography>
                        </Stack>
                        <Stack direction='row' justifyContent='space-between' alignItems='baseline' className={styles.resumenRow}>
                          <Typography variant='body2' component='span' className={styles.resumenLabel}>
                            Duración
                          </Typography>
                          <Typography variant='body2' component='span' className={styles.resumenValue}>
                            {horasReserva} {horasReserva === 1 ? 'hora' : 'horas'}
                          </Typography>
                        </Stack>
                        <Stack direction='row' justifyContent='space-between' alignItems='baseline' className={styles.resumenRow}>
                          <Typography variant='body2' component='span' className={styles.resumenLabel}>
                            Precio por hora
                          </Typography>
                          <Typography variant='body2' component='span' className={styles.resumenValue}>
                            S/ {precioHora.toFixed(0)}
                          </Typography>
                        </Stack>
                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='baseline'
                          className={styles.resumenRowTotal}
                        >
                          <Typography variant='body2' component='span' className={styles.resumenLabel}>
                            Total a pagar
                          </Typography>
                          <Typography variant='body1' component='span' className={styles.resumenTotal}>
                            S/ {totalPagar.toFixed(0)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Button
                        type='button'
                        variant='contained'
                        size='large'
                        fullWidth
                        className={styles.reservarBtn}
                        startIcon={!payLoading && <i className='ri-bank-card-line' />}
                        disabled={payLoading}
                        onClick={handleIrAPagar}
                      >
                        Ir a pagar ahora
                      </Button>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', textAlign: 'center', mt: 1, fontWeight: 400 }}
                      >
                        Serás redirigido para completar el pago (Mercado Pago próximamente).
                      </Typography>
                    </Paper>
                  ) : null}
                </Box>
              </>
            )}

            {!resumenCompleto ? (
              <Typography variant='body2' color='text.secondary' className={styles.reservationHint}>
                Selecciona el día, un horario y las horas para ver el resumen y continuar al pago.
              </Typography>
            ) : null}
          </Paper>
        </Box>
      </Box>

      {/* Otras opciones: carrusel con flechas al costado de las cards */}
      {otherCourts.length > 0 && (
        <Box component='section' className={styles.otherCourtsSection}>
          <Typography variant='h6' component='h2' className={styles.otherCourtsTitle}>
            Otras opciones · Ver más canchas
          </Typography>
          <Box className={styles.carouselWrapper}>
            <Tooltip title='Anterior'>
              <Box component='span' className={styles.carouselNavWrap}>
                <IconButton
                  aria-label='Canchas anteriores'
                  onClick={handleCarouselPrev}
                  disabled={!carouselCanScrollLeft}
                  className={styles.carouselNavButton}
                  size='large'
                  sx={{
                    boxShadow: 2,
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100', color: 'primary.dark' },
                    '&.Mui-disabled': { opacity: 0.4 }
                  }}
                >
                  <i className='ri-arrow-left-s-line' style={{ fontSize: '1.5rem' }} />
                </IconButton>
              </Box>
            </Tooltip>
            <Box
              ref={otherCourtsScrollRef}
              className={styles.otherCourtsScroll}
              role='region'
              aria-label='Carrusel de otras canchas'
            >
              {otherCourts.map(c => (
                <CourtCardHorizontal key={c.id} court={c} lang={lang} />
              ))}
            </Box>
            <Tooltip title='Siguiente'>
              <Box component='span' className={styles.carouselNavWrap}>
                <IconButton
                  aria-label='Más canchas'
                  onClick={handleCarouselNext}
                  disabled={!carouselCanScrollRight}
                  className={styles.carouselNavButton}
                  size='large'
                  sx={{
                    boxShadow: 2,
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100', color: 'primary.dark' },
                    '&.Mui-disabled': { opacity: 0.4 }
                  }}
                >
                  <i className='ri-arrow-right-s-line' style={{ fontSize: '1.5rem' }} />
                </IconButton>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ExploreCourtDetailView
