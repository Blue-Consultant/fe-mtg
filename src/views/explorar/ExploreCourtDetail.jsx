'use client'

import { useEffect, useState, useCallback, forwardRef, useRef } from 'react'
import Link from 'next/link'
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import OptimizedS3Image from '@/components/OptimizedS3Image'
import { getCourtDetail } from '@/views/courts/api'
import { searchCourts } from '@/views/courts/api'
import Skeleton from '@mui/material/Skeleton'
import CourtCardHorizontal from './components/CourtCardHorizontal'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import styles from './explorar-detail.module.css'

const DEFAULT_COURT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop'
const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const toYYYYMMDD = d => (d ? d.toISOString().split('T')[0] : '')

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

/** Genera slots de 1 hora por cada bloque de horario del día (ej: 08:00-23:00 → 08:00-09:00, 09:00-10:00, ...) */
const buildHourlySlots = (schedules) => {
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
    size="small"
    label="Fecha"
    value={value ?? ''}
    onClick={onClick}
    onChange={onChange}
    inputRef={ref}
    InputLabelProps={{ shrink: true }}
    inputProps={{ readOnly: true }}
    variant="outlined"
    {...rest}
  />
))
DatePickerInput.displayName = 'DatePickerInput'

const PAYMENT_METHODS = [
  { value: 'credit', label: 'Tarjeta de crédito/débito', icon: 'ri-bank-card-line' },
  { value: 'yape', label: 'Yape / Plin', icon: 'ri-smartphone-line' },
  { value: 'cash', label: 'Efectivo en el lugar', icon: 'ri-money-dollar-circle-line' },
]

const ExploreCourtDetailView = ({ courtId, lang, onlyDetail = false }) => {
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [otherCourts, setOtherCourts] = useState([])
  const [reservaFecha, setReservaFecha] = useState(() => toYYYYMMDD(new Date()))
  const [selectedStartTime, setSelectedStartTime] = useState(null) // hora de inicio "08:00"
  const [horasReserva, setHorasReserva] = useState(1)
  const [occupiedSlots, setOccupiedSlots] = useState([]) // [{ hora_inicio, hora_fin }] para la fecha elegida (futuro: desde API)
  const [isFavorite, setIsFavorite] = useState(false)
  const [stepsCollapsed, setStepsCollapsed] = useState(false)
  const otherCourtsScrollRef = useRef(null)
  const [carouselCanScrollLeft, setCarouselCanScrollLeft] = useState(false)
  const [carouselCanScrollRight, setCarouselCanScrollRight] = useState(false)
  const CARD_WIDTH = 280
  const CARD_GAP = 16
  const scrollAmount = CARD_WIDTH + CARD_GAP

  const handleShare = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: court?.nombre,
        url: typeof window !== 'undefined' ? window.location.href : '',
        text: court?.nombre,
      }).catch(() => {})
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
    if (reservaFecha && selectedStartTime && horasReserva >= 1) {
      setStepsCollapsed(true)
    }
  }, [reservaFecha, selectedStartTime, horasReserva])

  useEffect(() => {
    const today = toYYYYMMDD(new Date())
    searchCourts(today, '06:00', '23:00', null, 1, 12)
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
        <Skeleton variant="text" width={120} height={36} className={styles.backLink} />
        <div className={styles.detailHeader}>
          <Skeleton variant="text" width={280} height={40} />
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </div>
        <Skeleton variant="rectangular" className={styles.galleryGrid} style={{ minHeight: 320 }} />
        <div className={styles.contentRow}>
          <Box>
            <Skeleton variant="text" width="100%" height={24} />
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={120} sx={{ mt: 2, borderRadius: 1 }} />
          </Box>
          <Box>
            <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
          </Box>
        </div>
      </Box>
    )
  }

  if (error || (!loading && !court)) {
    return (
      <Box className={styles.detailRoot}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Cancha no encontrada'}
        </Alert>
        <Link href={`/${lang}/explorar`} passHref legacyBehavior>
          <Button component="a" variant="contained">
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
  const precioEjemplo = schedules.length > 0 && schedules[0].precio != null
    ? `S/ ${Number(schedules[0].precio).toFixed(0)}/h`
    : null

  const today = new Date()
  const reservaFechaDate =
    reservaFecha && /^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)
      ? new Date(reservaFecha + 'T12:00:00')
      : today
  const dayOfWeek = reservaFechaDate.getDay()
  const schedulesForSelectedDay = schedules.filter(s => Number(s.dia_semana) === dayOfWeek)
  const hourlySlots = buildHourlySlots(schedulesForSelectedDay)
  const selectedSlotData = selectedStartTime
    ? hourlySlots.find(s => s.start === selectedStartTime)
    : null
  const horaFinReserva = selectedStartTime && horasReserva >= 1
    ? addHoursToTime(selectedStartTime, horasReserva)
    : null
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
  const bookingUrl = `/${lang}/booking?${bookingParams.toString()}`

  const precioHora = selectedSlotData?.precio != null ? Number(selectedSlotData.precio) : 0
  const totalPagar = precioHora * horasReserva
  const resumenCompleto = reservaFecha && selectedStartTime && horasReserva >= 1

  const isSlotOccupied = (slotStart, slotEnd) =>
    occupiedSlots.some(
      o => timeToMinutes(o.hora_inicio) < timeToMinutes(slotEnd) && timeToMinutes(o.hora_fin) > timeToMinutes(slotStart)
    )
  const fechaFormateada = reservaFecha && /^\d{4}-\d{2}-\d{2}$/.test(reservaFecha)
    ? new Date(reservaFecha + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <Box className={styles.detailRoot}>
      {!onlyDetail && (
        <Link href={`/${lang}/explorar`} passHref legacyBehavior>
          <Button
            component="a"
            variant="outlined"
            color="primary"
            startIcon={<i className="ri-arrow-left-line" />}
            className={styles.backLink}
            sx={{ fontWeight: 600 }}
          >
            Volver a explorar canchas
          </Button>
        </Link>
      )}

      {/* Cabecera estilo Airbnb: nombre izquierda, acciones derecha */}
      <header className={styles.detailHeader}>
        <h1 className={styles.detailTitle}>{court.nombre}</h1>
        <div className={styles.detailActions}>
          <Tooltip title="Compartir">
            <IconButton onClick={handleShare} aria-label="Compartir" color="inherit" size="medium">
              <i className="ri-share-line" style={{ fontSize: '1.25rem' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
            <IconButton onClick={toggleFavorite} aria-label="Favoritos" color="inherit" size="medium">
              <i className={isFavorite ? 'ri-heart-fill' : 'ri-heart-line'} style={{ fontSize: '1.25rem', color: isFavorite ? '#e53935' : undefined }} />
            </IconButton>
          </Tooltip>
        </div>
      </header>

      {/* Galería estilo Airbnb: 1 grande izquierda (2 filas), 4 imágenes derecha (2x2) */}
      <div className={styles.galleryGrid}>
        <div className={styles.galleryMain}>
          <OptimizedS3Image
            src={galleryImages[0]}
            alt={court.nombre}
            fill
            className="object-cover"
            sizes="(max-width: 899px) 100vw, 40vw"
          />
        </div>
        <div className={styles.gallerySide}>
          {galleryImages.slice(0, 4).map((src, idx) => (
            <div key={idx} className={styles.galleryCell}>
              <OptimizedS3Image
                src={src}
                alt={`${court.nombre} ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 899px) 50vw, 20vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contenido: detalles izquierda, formulario reserva derecha */}
      <div className={styles.contentRow}>
        <div className={styles.infoColumn}>
          {/* Precio destacado + descripción */}
          <section className={styles.detailSection}>
            {precioEjemplo != null && (
              <p className={styles.detailPrice}>{precioEjemplo}</p>
            )}
            <p className={styles.descriptionBlock}>
              {court.descripcion || 'Cancha deportiva disponible para reserva.'}
            </p>
            {blocks.length > 0 && (
              <>
                <span className={styles.descriptionLabel}>Fechas bloqueadas</span>
                <ul className={styles.blocksList}>
                  {blocks.map(row => (
                    <li key={row.id}>
                      {new Date(row.fecha_inicio).toLocaleDateString('es-PE', { dateStyle: 'short' })} – {new Date(row.fecha_fin).toLocaleDateString('es-PE', { dateStyle: 'short' })}{row.motivo ? ` · ${row.motivo}` : ''}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* Ficha: tipo, estado, ubicación, capacidad, valoración */}
          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Detalles</h3>
            <div className={styles.detailMeta}>
              <span className={styles.detailMetaItem}>
                <i className="ri-football-line" />
                {typeName}
              </span>
              {court.estado && (
                <span className={styles.detailMetaItem}>
                  <i className="ri-checkbox-circle-line" />
                  Disponible
                </span>
              )}
              {venue && (
                <span className={styles.detailMetaItem}>
                  <i className="ri-map-pin-line" />
                  {venue.name}{venue.city ? ` · ${venue.city}` : ''}
                </span>
              )}
              {court.capacidad != null && (
                <span className={styles.detailMetaItem}>
                  <i className="ri-group-line" />
                  {court.capacidad} personas
                </span>
              )}
              {(ratingAvg != null && ratingCount > 0) && (
                <span className={styles.detailMetaItem}>
                  <Rating value={ratingAvg} precision={0.1} size="small" readOnly />
                  <span>({ratingCount})</span>
                </span>
              )}
            </div>
          </section>

          {/* Horarios disponibles */}
          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Horarios disponibles</h3>
            {schedules.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No hay horarios definidos.</Typography>
            ) : (
              <ul className={styles.schedulesList}>
                {schedules.map((row, idx) => (
                  <li key={idx} className={styles.scheduleRow}>
                    <span className={styles.scheduleRowDay}>{DAYS_OF_WEEK[row.dia_semana] ?? row.dia_semana}</span>
                    <span className={styles.scheduleRowTime}>{row.hora_inicio} – {row.hora_fin}</span>
                    <span className={styles.scheduleRowPrice}>S/ {Number(row.precio).toFixed(0)}/h</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Tipos de pago */}
          <section className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Tipos de pago</h3>
            <div className={styles.paymentRow}>
              {PAYMENT_METHODS.map((m, idx) => (
                <span key={m.value} className={styles.paymentRowItem}>
                  {idx > 0 && <span className={styles.paymentRowDot}> · </span>}
                  <i className={m.icon} />
                  <span>{m.label}</span>
                </span>
              ))}
            </div>
            <Typography variant="body2" color="text.secondary" className={styles.paymentRowNote}>
              Al reservar podrás elegir el método de pago.
            </Typography>
          </section>
        </div>

        <aside className={styles.reservationColumn}>
          <div className={styles.reservationBlock}>
            {resumenCompleto && stepsCollapsed ? (
              <button
                type="button"
                className={styles.reservationCollapsedHeader}
                onClick={() => setStepsCollapsed(false)}
                aria-expanded="false"
              >
                <span>
                  <i className="ri-calendar-event-line" />
                  Cambiar fecha u horario
                </span>
                <i className="ri-arrow-down-s-line" aria-hidden />
              </button>
            ) : (
              <>
                <h3 className={styles.reservationBlockTitle}>
                  <i className="ri-calendar-event-line" />
                  {resumenCompleto ? (
                    <button
                      type="button"
                      className={styles.reservationTitleButton}
                      onClick={() => setStepsCollapsed(true)}
                      aria-label="Cerrar"
                    >
                      Elige tu fecha y horario
                      <i className="ri-arrow-up-s-line" />
                    </button>
                  ) : (
                    'Elige tu fecha y horario'
                  )}
                </h3>

                <div className={styles.reservationStep}>
                  <span className={styles.reservationStepLabel}>1. Selecciona el día</span>
                  <AppReactDatepicker
                    selected={reservaFechaDate}
                    onChange={date => {
                      if (date) {
                        setReservaFecha(toYYYYMMDD(date))
                        setSelectedStartTime(null)
                      }
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Elige la fecha"
                    customInput={<DatePickerInput />}
                    popperPlacement="bottom-start"
                    minDate={today}
                  />
                </div>

                {reservaFecha && (
                  <>
                    <div className={styles.reservationStep}>
                      <span className={styles.reservationStepLabel}>2. ¿Cuántas horas quieres reservar?</span>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Elige la duración; luego verás solo los horarios que encajan.
                      </Typography>
                      <FormControl fullWidth size="small" className={styles.reservationSelect}>
                        <InputLabel id="horas-reserva-label">Horas</InputLabel>
                        <Select
                          labelId="horas-reserva-label"
                          label="Horas"
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
                    </div>

                    <div className={styles.reservationStep}>
                      <span className={styles.reservationStepLabel}>
                        3. Elige tu hora de inicio ({DAYS_OF_WEEK[dayOfWeek]})
                      </span>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                        Horarios de {horasReserva} {horasReserva === 1 ? 'hora' : 'horas'}. Los ocupados se ven en gris.
                      </Typography>
                      {startSlotsForDuration.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" className={styles.reservationEmpty}>
                          No hay bloques de {horasReserva} h para este día. Prueba otra duración o fecha.
                        </Typography>
                      ) : (
                        <>
                          <div className={styles.slotsLegend}>
                            <span className={styles.slotsLegendItem}><span className={styles.slotsLegendDotAvailable} /> Disponible</span>
                            <span className={styles.slotsLegendItem}><span className={styles.slotsLegendDotOccupied} /> Ocupado</span>
                          </div>
                          <div className={styles.slotsGrid}>
                            {startSlotsForDuration.map((slot) => {
                              const slotEnd = addHoursToTime(slot.start, horasReserva)
                              const occupied = isSlotOccupied(slot.start, slotEnd)
                              const selected = selectedStartTime === slot.start
                              return (
                                <button
                                  key={`${slot.start}-${slotEnd}`}
                                  type="button"
                                  className={`${styles.slotCell} ${occupied ? styles.slotCellOccupied : ''} ${selected ? styles.slotCellSelected : ''}`}
                                  onClick={() => !occupied && setSelectedStartTime(slot.start)}
                                  disabled={occupied}
                                  title={occupied ? 'Este horario ya está reservado' : `De ${slot.start} a ${slotEnd} · S/ ${slot.precio}/h`}
                                >
                                  <span className={styles.slotCellTime}>{slot.start} – {slotEnd}</span>
                                  {!occupied && <span className={styles.slotCellPrice}>S/ {slot.precio}/h</span>}
                                </button>
                              )
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {resumenCompleto && (
              <div className={styles.resumenBlock}>
                <h4 className={styles.resumenTitle}>Resumen de tu reserva</h4>
                <div className={styles.resumenRow}>
                  <span className={styles.resumenLabel}>Cancha</span>
                  <span className={styles.resumenValue}>{court.nombre}</span>
                </div>
                <div className={styles.resumenRow}>
                  <span className={styles.resumenLabel}>Fecha</span>
                  <span className={styles.resumenValue}>{fechaFormateada}</span>
                </div>
                <div className={styles.resumenRow}>
                  <span className={styles.resumenLabel}>Horario</span>
                  <span className={styles.resumenValue}>De {selectedStartTime} a {horaFinReserva}</span>
                </div>
                <div className={styles.resumenRow}>
                  <span className={styles.resumenLabel}>Duración</span>
                  <span className={styles.resumenValue}>{horasReserva} {horasReserva === 1 ? 'hora' : 'horas'}</span>
                </div>
                <div className={styles.resumenRow}>
                  <span className={styles.resumenLabel}>Precio por hora</span>
                  <span className={styles.resumenValue}>S/ {precioHora.toFixed(0)}</span>
                </div>
                <div className={styles.resumenRowTotal}>
                  <span className={styles.resumenLabel}>Total a pagar</span>
                  <span className={styles.resumenTotal}>S/ {totalPagar.toFixed(0)}</span>
                </div>
                <Link href={bookingUrl} passHref legacyBehavior>
                  <Button
                    component="a"
                    variant="contained"
                    size="large"
                    fullWidth
                    className={styles.reservarBtn}
                    startIcon={<i className="ri-bank-card-line" />}
                  >
                    Ir a pagar ahora
                  </Button>
                </Link>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Serás redirigido para completar el pago (Mercado Pago próximamente).
                </Typography>
              </div>
            )}

            {!resumenCompleto && (
              <Typography variant="body2" color="text.secondary" className={styles.reservationHint}>
                Selecciona el día, un horario y las horas para ver el resumen y continuar al pago.
              </Typography>
            )}
          </div>
        </aside>
      </div>

      {/* Otras opciones: carrusel con flechas al costado de las cards */}
      {otherCourts.length > 0 && (
        <section className={styles.otherCourtsSection}>
          <Typography component="h2" className={styles.otherCourtsTitle}>
            Otras opciones · Ver más canchas
          </Typography>
          <Box className={styles.carouselWrapper}>
            <Tooltip title="Anterior">
              <span className={styles.carouselNavWrap}>
                <IconButton
                  aria-label="Canchas anteriores"
                  onClick={handleCarouselPrev}
                  disabled={!carouselCanScrollLeft}
                  className={styles.carouselNavButton}
                  size="large"
                  sx={{
                    boxShadow: 2,
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100', color: 'primary.dark' },
                    '&.Mui-disabled': { opacity: 0.4 }
                  }}
                >
                  <i className="ri-arrow-left-s-line" style={{ fontSize: '1.5rem' }} />
                </IconButton>
              </span>
            </Tooltip>
            <div
              ref={otherCourtsScrollRef}
              className={styles.otherCourtsScroll}
              role="region"
              aria-label="Carrusel de otras canchas"
            >
              {otherCourts.map(c => (
                <CourtCardHorizontal key={c.id} court={c} lang={lang} />
              ))}
            </div>
            <Tooltip title="Siguiente">
              <span className={styles.carouselNavWrap}>
                <IconButton
                  aria-label="Más canchas"
                  onClick={handleCarouselNext}
                  disabled={!carouselCanScrollRight}
                  className={styles.carouselNavButton}
                  size="large"
                  sx={{
                    boxShadow: 2,
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100', color: 'primary.dark' },
                    '&.Mui-disabled': { opacity: 0.4 }
                  }}
                >
                  <i className="ri-arrow-right-s-line" style={{ fontSize: '1.5rem' }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </section>
      )}
    </Box>
  )
}

export default ExploreCourtDetailView
