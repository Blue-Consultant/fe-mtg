'use client'

import { useCallback, useState, forwardRef } from 'react'

import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Collapse from '@mui/material/Collapse'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import styles from '../explorar.module.css'

const toYYYYMMDD = d => (d ? d.toISOString().split('T')[0] : '')

/** Convierte "HH:mm" a Date (hoy a esa hora) */
const timeStringToDate = (timeStr, baseDate = new Date()) => {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return null
  const [h, m] = timeStr.split(':').map(Number)
  const d = new Date(baseDate)

  d.setHours(h, m, 0, 0)

  return d
}

/** Convierte Date a "HH:mm" */
const dateToTimeString = d => {
  if (!d || !(d instanceof Date)) return '06:00'
  const h = d.getHours()
  const m = d.getMinutes()

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Suma 1 hora a "HH:mm" para la URL/API (hora fin derivada). */
const add1Hour = timeStr => {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return '23:00'
  const [h, m] = timeStr.split(':').map(Number)
  let next = h * 60 + m + 60

  if (next >= 24 * 60) return '23:00'
  const h2 = Math.floor(next / 60)
  const m2 = next % 60

  return `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`
}

/** Input personalizado para el DatePicker (compatible con react-datepicker) */
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
    {...rest}
  />
))

DatePickerInput.displayName = 'DatePickerInput'

/** Input personalizado para el TimePicker (label: Inicio / Fin) */
const TimePickerInput = forwardRef(({ value, onClick, onChange, label, ...rest }, ref) => (
  <TextField
    fullWidth
    size='small'
    label={label}
    value={value ?? ''}
    onClick={onClick}
    onChange={onChange}
    inputRef={ref}
    InputLabelProps={{ shrink: true }}
    inputProps={{ readOnly: true }}
    {...rest}
  />
))

TimePickerInput.displayName = 'TimePickerInput'

export default function ExploreFiltersDrawer({
  filters,
  courtTypes = [],
  venues = [],
  onSearch,
  onDaySelect,
  lang,
  router
}) {
  const {
    nombre,
    setNombre,
    courtTypeId,
    setCourtTypeId,
    ubicacionId,
    setUbicacionId,
    minRating,
    setMinRating,
    fecha,
    setFecha,
    horaInicio,
    setHoraInicio,
    clearFilters
  } = filters

  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false)

  const today = new Date()

  const fechaDate = fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? new Date(fecha + 'T12:00:00') : today

  const handleBuscar = useCallback(() => {
    onSearch?.()
    const f = fecha || toYYYYMMDD(today)
    const hi = (horaInicio || '06:00').replace(/:/g, '-')
    const hf = (horaFin || '23:00').replace(/:/g, '-')
    const ct = courtTypeId != null && courtTypeId !== '' ? `/${courtTypeId}` : ''

    if (router && lang) {
      router.push(`/${lang}/explorar/buscar/${f}/${hi}/${hf}${ct}`)
    }
  }, [fecha, horaInicio, courtTypeId, onSearch, router, lang])

  return (
    <>
      {/* <div className={styles.filtersPanelHeader}>
        <Typography variant="subtitle1" fontWeight={700}>
          Filtros
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Nombre, tipo, fecha y horario
        </Typography>
      </div> */}
      <div className={styles.filtersPanelBody}>
        {/* Filtros principales: cuándo y qué */}
        <div className={styles.filtersSectionMain}>
          <Typography component='span' className={styles.filtersSectionMainTitle}>
            FILTROS
          </Typography>
          <FormControl fullWidth size='small'>
            <InputLabel id='filter-tipo-label'>Tipo de cancha</InputLabel>
            <Select
              labelId='filter-tipo-label'
              label='Tipo de cancha'
              value={courtTypeId ?? ''}
              onChange={e => setCourtTypeId(e.target.value === '' ? null : e.target.value)}
            >
              <MenuItem value=''>Todos</MenuItem>
              {courtTypes.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <AppReactDatepicker
            selected={fechaDate}
            onChange={date => {
              if (date) {
                setFecha(toYYYYMMDD(date))
                onDaySelect?.(date)
              }
            }}
            dateFormat='dd/MM/yyyy'
            placeholderText='Elige la fecha'
            customInput={<DatePickerInput />}
            popperPlacement='bottom-start'
            minDate={today}
          />

          <AppReactDatepicker
            selected={timeStringToDate(horaInicio || '06:00', fechaDate)}
            onChange={date => date && setHoraInicio(dateToTimeString(date))}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={30}
            timeCaption='Hora'
            dateFormat='HH:mm'
            customInput={<TimePickerInput label='Horario' />}
            popperPlacement='bottom-start'
          />
        </div>

        {/* Más opciones: colapsable */}
        <div className={styles.filtersSectionSecondary}>
          <Button
            fullWidth
            variant='text'
            size='small'
            onClick={() => setMoreOptionsOpen(open => !open)}
            className={styles.moreOptionsTrigger}
            endIcon={
              <i
                className={moreOptionsOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                style={{ fontSize: '1.25rem' }}
              />
            }
          >
            <Typography component='span' className={styles.filtersSectionSecondaryTitle}>
              FILTROS ADICIONALES
            </Typography>
          </Button>
          <Collapse in={moreOptionsOpen}>
            <div className={styles.moreOptionsContent}>
              <TextField
                fullWidth
                size='small'
                label='Nombre de cancha'
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder='Ej: Cancha principal'
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-search-line' style={{ fontSize: '1.1rem' }} />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl fullWidth size='small'>
                <InputLabel id='filter-ubicacion-label'>Ubicación (sede)</InputLabel>
                <Select
                  labelId='filter-ubicacion-label'
                  label='Ubicación (sede)'
                  value={ubicacionId ?? ''}
                  onChange={e => setUbicacionId(e.target.value === '' ? null : e.target.value)}
                >
                  <MenuItem value=''>Todas</MenuItem>
                  {venues.map(v => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size='small'>
                <InputLabel id='filter-valoracion-label'>Valoración mínima</InputLabel>
                <Select
                  labelId='filter-valoracion-label'
                  label='Valoración mínima'
                  value={minRating ?? ''}
                  onChange={e => setMinRating(e.target.value === '' ? null : e.target.value)}
                >
                  <MenuItem value=''>Todas</MenuItem>
                  <MenuItem value={4}>4+ estrellas</MenuItem>
                  <MenuItem value={3}>3+ estrellas</MenuItem>
                  <MenuItem value={1}>1+ estrellas</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Collapse>
        </div>

        <Button fullWidth variant='contained' onClick={handleBuscar} startIcon={<i className='ri-search-line' />}>
          Buscar
        </Button>
        <Button fullWidth variant='outlined' size='small' onClick={clearFilters}>
          Limpiar filtros
        </Button>
      </div>
    </>
  )
}
