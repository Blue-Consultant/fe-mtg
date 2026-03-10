'use client'

import { useState, useMemo, useEffect, forwardRef } from 'react'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import GlobalStyles from '@mui/material/GlobalStyles'
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Controller } from 'react-hook-form'
import { startOfWeek, addDays, setHours, setMinutes, startOfDay, parseISO } from 'date-fns'
import FullCalendar from '@fullcalendar/react'
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'
import { useCourtForm } from '../hooks/useCourtForm'
import { createPriceSchedulesBulk } from '@/views/price-schedules/api'
import { createDateBlock } from '@/views/date-blocks/api'
import { getCourtDetail } from '../api'
import styles from '../courts.module.css'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
]

const TIME_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const h = 6 + i
  return `${String(h).padStart(2, '0')}:00`
})

const defaultScheduleRow = () => ({
  dia_semana: [],
  hora_inicio: '08:00',
  hora_fin: '09:00',
  precio: '',
  repeatUntil: null,
})

const formatTimeFromDate = (d) => {
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const timeStringToDate = (timeStr, baseDate = new Date()) => {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(String(timeStr).trim())) return new Date(baseDate)
  const [h, m] = String(timeStr).trim().split(':').map(Number)
  const d = new Date(baseDate)
  d.setHours(h, m ?? 0, 0, 0)
  return d
}

const dateToTimeString = (d) => {
  if (!d || !(d instanceof Date)) return '08:00'
  return formatTimeFromDate(d)
}

const formatDateToYYYYMMDD = (d) => {
  if (!d || !(d instanceof Date)) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const DatePickerInput = forwardRef(({ value, onClick, onChange, label, ...rest }, ref) => (
  <TextField
    fullWidth
    size="small"
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
DatePickerInput.displayName = 'DatePickerInput'

const TimePickerInput = forwardRef(({ value, onClick, onChange, label, ...rest }, ref) => (
  <TextField
    fullWidth
    size="small"
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

const DATE_PICKER_POPPER_CLASS = 'court-form-datepicker-popper'

const defaultDateBlockRow = () => ({
  fecha_inicio_date: '',
  fecha_fin_date: '',
  motivo: '',
})

function toHHmm(t) {
  if (!t) return '08:00'
  const s = String(t).trim()
  if (s.length >= 5) return s.slice(0, 5)
  return s || '08:00'
}

function priceSchedulesToRows(priceSchedules) {
  if (!Array.isArray(priceSchedules) || priceSchedules.length === 0) return []
  const byKey = {}
  priceSchedules.forEach(ps => {
    const hora_inicio = toHHmm(ps.hora_inicio)
    const hora_fin = toHHmm(ps.hora_fin)
    const precio = String(ps.precio ?? '')
    const key = `${hora_inicio}-${hora_fin}-${precio}`
    if (!byKey[key]) {
      byKey[key] = { dia_semana: [], hora_inicio, hora_fin, precio, repeatUntil: null }
    }
    const dia = ps.dia_semana
    if (typeof dia === 'number' && !byKey[key].dia_semana.includes(dia)) {
      byKey[key].dia_semana.push(dia)
    }
  })
  return Object.values(byKey).map(r => ({ ...r, dia_semana: r.dia_semana.sort((a, b) => a - b) }))
}

function dateBlocksToRows(dateBlocks) {
  if (!Array.isArray(dateBlocks) || dateBlocks.length === 0) return []
  const pad = n => String(n).padStart(2, '0')
  return dateBlocks.map(b => {
    const start = b.fecha_inicio ? new Date(b.fecha_inicio) : null
    const end = b.fecha_fin ? new Date(b.fecha_fin) : null
    return {
      fecha_inicio_date: start ? `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}` : '',
      fecha_fin_date: end ? `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}` : '',
      motivo: b.motivo ?? '',
    }
  })
}

const CourtForm = ({ controller }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const {
    showform,
    dataProp,
    branchesList,
    courtTypesList,
    addOrUpdateCourt,
    handleSetDefautProps,
  } = controller

  const {
    control,
    handleSubmit,
    setValue,
    register,
    getValues,
    trigger,
    errors,
    reset,
    isSubmitting,
    isEditMode,
    onSubmit,
    resetForm,
    buildJsonData,
  } = useCourtForm({
    dataProp,
    addOrUpdateCourt,
    handleSetDefautProps,
    branchesList,
    courtTypesList,
  })

  const [activeStep, setActiveStep] = useState(0)
  const [scheduleRows, setScheduleRows] = useState([])
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [dateBlockRows, setDateBlockRows] = useState([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleModalEditIndex, setScheduleModalEditIndex] = useState(null)
  const [modalRow, setModalRow] = useState(() => defaultScheduleRow())
  const [schedulesLoaded, setSchedulesLoaded] = useState(false)
  const [selectTypeModalOpen, setSelectTypeModalOpen] = useState(false)
  const [pendingSelectInfo, setPendingSelectInfo] = useState(null)
  const [blockModalOpen, setBlockModalOpen] = useState(false)
  const [blockModalEditIndex, setBlockModalEditIndex] = useState(null)
  const [modalBlock, setModalBlock] = useState(() => defaultDateBlockRow())

  useEffect(() => {
    if (!isEditMode || !dataProp?.data?.id) {
      setSchedulesLoaded(false)
      return
    }
    setSchedulesLoaded(false)
    getCourtDetail(dataProp.data.id)
      .then(court => {
        if (!court) return
        setScheduleRows(priceSchedulesToRows(court.PriceSchedules || []))
        setDateBlockRows(dateBlocksToRows(court.DateBlocks || []))
      })
      .catch(() => {})
      .finally(() => setSchedulesLoaded(true))
  }, [isEditMode, dataProp?.data?.id])

  if (!showform) return null

  const isWizard = !isEditMode
  const steps = isWizard ? ['Datos básicos', 'Horarios de precio', 'Resumen'] : []

  const handleNext = () => setActiveStep(s => s + 1)
  const handleBack = () => setActiveStep(s => s - 1)

  const addScheduleRow = () => {
    setScheduleRows(prev => [...prev, defaultScheduleRow()])
  }

  const removeScheduleRow = (index) => {
    setScheduleRows(prev => prev.filter((_, i) => i !== index))
  }

  const updateScheduleRow = (index, field, value) => {
    setScheduleRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const toggleDay = (rowIndex, dayValue) => {
    setScheduleRows(prev =>
      prev.map((row, i) => {
        if (i !== rowIndex) return row
        const arr = row.dia_semana || []
        const has = arr.includes(dayValue)
        return { ...row, dia_semana: has ? arr.filter(d => d !== dayValue) : [...arr, dayValue] }
      })
    )
  }

  const openScheduleModalFromSelect = (info) => {
    const start = info.start
    const end = info.end
    const dayOfWeek = start.getDay()
    setModalRow({
      dia_semana: [dayOfWeek],
      hora_inicio: formatTimeFromDate(start),
      hora_fin: formatTimeFromDate(end),
      precio: '',
      repeatUntil: null,
    })
    setScheduleModalEditIndex(null)
    setScheduleModalOpen(true)
  }

  const openScheduleModalFromAdd = () => {
    setModalRow(defaultScheduleRow())
    setScheduleModalEditIndex(null)
    setScheduleModalOpen(true)
  }

  const handleCalendarSelect = (info) => {
    setPendingSelectInfo(info)
    setSelectTypeModalOpen(true)
  }

  const handleSelectTypeHorario = () => {
    if (pendingSelectInfo) openScheduleModalFromSelect(pendingSelectInfo)
    setPendingSelectInfo(null)
    setSelectTypeModalOpen(false)
  }

  const handleSelectTypeBlock = () => {
    if (pendingSelectInfo) {
      const start = pendingSelectInfo.start
      const end = pendingSelectInfo.end
      const today = startOfDay(new Date())
      const startDate = start < today ? today : start
      const endDate = end <= startDate ? startDate : end
      setModalBlock({
        fecha_inicio_date: formatDateToYYYYMMDD(startDate),
        fecha_fin_date: formatDateToYYYYMMDD(endDate),
        motivo: '',
      })
      setBlockModalEditIndex(null)
      setBlockModalOpen(true)
    }
    setPendingSelectInfo(null)
    setSelectTypeModalOpen(false)
  }

  const openScheduleModalFromEvent = (info) => {
    const props = info.event.extendedProps || {}
    if (props.type === 'block') {
      const idx = props.blockIdx
      if (idx == null) return
      const block = dateBlockRows[idx]
      if (!block) return
      setModalBlock({ ...block })
      setBlockModalEditIndex(idx)
      setBlockModalOpen(true)
      return
    }
    const rowIdx = props.rowIdx
    if (rowIdx == null) return
    const row = scheduleRows[rowIdx]
    if (!row) return
    setModalRow({ ...row })
    setScheduleModalEditIndex(rowIdx)
    setScheduleModalOpen(true)
  }

  const closeScheduleModal = () => {
    setScheduleModalOpen(false)
    setScheduleModalEditIndex(null)
  }

  const saveScheduleModal = () => {
    const dias = modalRow.dia_semana || []
    if (dias.length === 0) return
    if (!modalRow.hora_inicio || !modalRow.hora_fin) return
    if (scheduleModalEditIndex !== null) {
      setScheduleRows(prev =>
        prev.map((row, i) => (i === scheduleModalEditIndex ? { ...modalRow } : row))
      )
    } else {
      setScheduleRows(prev => [...prev, { ...modalRow }])
    }
    closeScheduleModal()
  }

  const deleteScheduleModalRow = () => {
    if (scheduleModalEditIndex !== null) {
      removeScheduleRow(scheduleModalEditIndex)
    }
    closeScheduleModal()
  }

  const toggleModalDay = (dayValue) => {
    const arr = modalRow.dia_semana || []
    const has = arr.includes(dayValue)
    setModalRow(prev => ({
      ...prev,
      dia_semana: has ? arr.filter(d => d !== dayValue) : [...arr, dayValue],
    }))
  }

  const closeBlockModal = () => {
    setBlockModalOpen(false)
    setBlockModalEditIndex(null)
  }

  const saveBlockModal = () => {
    if (!modalBlock.fecha_inicio_date || !modalBlock.fecha_fin_date) return
    if (blockModalEditIndex !== null) {
      setDateBlockRows(prev =>
        prev.map((row, i) => (i === blockModalEditIndex ? { ...modalBlock } : row))
      )
    } else {
      setDateBlockRows(prev => [...prev, { ...modalBlock }])
    }
    closeBlockModal()
  }

  const deleteBlockModalRow = () => {
    if (blockModalEditIndex !== null) removeDateBlockRow(blockModalEditIndex)
    closeBlockModal()
  }

  const addDateBlockRow = () => setDateBlockRows(prev => [...prev, defaultDateBlockRow()])
  const removeDateBlockRow = (index) => setDateBlockRows(prev => prev.filter((_, i) => i !== index))
  const updateDateBlockRow = (index, field, value) => {
    setDateBlockRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
  }

  const parseTime = (timeStr) => {
    if (!timeStr) return { h: 8, m: 0 }
    const [h, m] = String(timeStr).split(':').map(Number)
    return { h: h || 0, m: m || 0 }
  }

  const calendarEvents = useMemo(() => {
    const weekStart = startOfWeek(calendarDate, { weekStartsOn: 1 })
    const today = startOfDay(new Date())
    const repeatUntilCutoff = (row) => {
      if (!row.repeatUntil) return null
      const d = typeof row.repeatUntil === 'string' ? parseISO(row.repeatUntil) : new Date(row.repeatUntil)
      return startOfDay(d)
    }
    const events = []
    scheduleRows.forEach((row, rowIdx) => {
      const days = row.dia_semana || []
      if (days.length === 0 || !row.hora_inicio || !row.hora_fin) return
      const cutoff = repeatUntilCutoff(row)
      const { h: hStart, m: mStart } = parseTime(row.hora_inicio)
      const { h: hEnd, m: mEnd } = parseTime(row.hora_fin)
      const price = row.precio ? `S/ ${row.precio}` : '—'
      days.forEach(dia_semana => {
        const dayOffset = dia_semana === 0 ? 6 : dia_semana - 1
        const dayDate = addDays(weekStart, dayOffset)
        if (startOfDay(dayDate) < today) return
        if (cutoff && startOfDay(dayDate) > cutoff) return
        const start = setMinutes(setHours(dayDate, hStart), mStart)
        const end = setMinutes(setHours(dayDate, hEnd), mEnd)
        events.push({
          id: `row-${rowIdx}-${dia_semana}`,
          title: price,
          start: start.toISOString(),
          end: end.toISOString(),
          extendedProps: { rowIdx, dia_semana },
        })
      })
    })
    dateBlockRows.forEach((block, idx) => {
      if (!block.fecha_inicio_date || !block.fecha_fin_date) return
      const startStr = block.fecha_inicio_date
      const endDate = parseISO(block.fecha_fin_date)
      const endNext = addDays(endDate, 1)
      const pad = n => String(n).padStart(2, '0')
      const endStr = `${endNext.getFullYear()}-${pad(endNext.getMonth() + 1)}-${pad(endNext.getDate())}`
      const title = block.motivo ? `No laborable: ${block.motivo}` : 'Día no laborable'
      events.push({
        id: `block-${idx}`,
        title,
        start: startStr,
        end: endStr,
        allDay: true,
        extendedProps: { type: 'block', blockIdx: idx },
        backgroundColor: 'var(--mui-palette-error-main)',
        borderColor: 'var(--mui-palette-error-dark)',
      })
    })
    return events
  }, [scheduleRows, dateBlockRows, calendarDate])

  const onSubmitWizard = async () => {
    const formData = buildJsonData(getValues())
    const created = await addOrUpdateCourt({ formData, isEditMode: false, courtId: null })
    if (!created?.id) return

    const validRows = scheduleRows.filter(
      r => Array.isArray(r.dia_semana) && r.dia_semana.length > 0 && r.hora_inicio && r.hora_fin && r.precio !== '' && Number(r.precio) > 0
    )
    for (const row of validRows) {
      try {
        await createPriceSchedulesBulk({
          cancha_id: created.id,
          dia_semana: row.dia_semana,
          hora_inicio: row.hora_inicio,
          hora_fin: row.hora_fin,
          precio: Number(row.precio),
          estado: true,
        })
      } catch (e) {
        console.error('Error creando horarios', e)
      }
    }

    const validBlocks = dateBlockRows.filter(b => b.fecha_inicio_date && b.fecha_fin_date)
    for (const block of validBlocks) {
      try {
        const fecha_inicio = new Date(`${block.fecha_inicio_date}T00:00:00`).toISOString()
        const fecha_fin = new Date(`${block.fecha_fin_date}T23:59:59`).toISOString()
        await createDateBlock({
          cancha_id: created.id,
          fecha_inicio,
          fecha_fin,
          motivo: block.motivo || null,
          estado: true,
        })
      } catch (e) {
        console.error('Error creando bloqueo de fecha', e)
      }
    }
    handleSetDefautProps()
  }

  const renderStepDatosBasicos = () => (
    <>
      <div className={styles.formSection}>
        <Typography variant="subtitle1" className={styles.formSectionTitle}>
          Ubicación y datos básicos
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Sucursal *</InputLabel>
              <Controller
                name="sede_id"
                control={control}
                rules={{ required: 'La sucursal es requerida' }}
                render={({ field, fieldState: { error } }) => (
                  <Select {...field} label="Sucursal *" error={!!error}>
                    {Array.isArray(branchesList) && branchesList.length > 0 ? (
                      branchesList.map(branch => (
                        <MenuItem key={branch.id} value={branch.id}>
                          {branch.name} — {branch.company_name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>No hay sucursales disponibles</MenuItem>
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: 'El nombre es requerido' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  label="Nombre de la cancha *"
                  placeholder="Ej: Cancha principal"
                  error={!!error}
                  helperText={error ? error.message : ''}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de cancha</InputLabel>
              <Controller
                name="court_type_id"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Select
                    {...field}
                    label="Tipo de cancha"
                    value={field.value === null || field.value === undefined ? '' : field.value}
                    onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                    error={!!error}
                  >
                    <MenuItem value=""><em>Sin tipo</em></MenuItem>
                    {Array.isArray(courtTypesList) && courtTypesList.length > 0 ? (
                      courtTypesList.map(type => (
                        <MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>No hay tipos disponibles</MenuItem>
                    )}
                  </Select>
                )}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="capacidad"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  fullWidth
                  size="small"
                  label="Capacidad (personas)"
                  placeholder="Ej: 10"
                  inputProps={{ min: 0 }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  label="Cancha activa (visible para reservas)"
                  control={
                    <Switch
                      {...field}
                      checked={field.value}
                      onChange={e => field.onChange(e.target.checked)}
                      color="primary"
                    />
                  }
                />
              )}
            />
          </Grid>
        </Grid>
      </div>
      <div className={styles.formSection}>
        <Typography variant="subtitle1" className={styles.formSectionTitle}>
          Descripción
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="descripcion"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  label="Descripción"
                  placeholder="Describe la cancha, superficie, medidas, servicios..."
                />
              )}
            />
          </Grid>
        </Grid>
      </div>
    </>
  )

  const renderStepHorarios = () => (
    <div className={styles.formSection}>
      {isEditMode && !schedulesLoaded && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">Cargando horarios registrados...</Typography>
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.8125rem', sm: '0.875rem' } }}>
        {isMobile ? (
          <>Toca un rango para agregar <strong>horario</strong> o <strong>día no laborable</strong> (rojo). Toca un evento para editarlo.</>
        ) : (
          <>Selecciona un rango para agregar un <strong>horario de precio</strong> o un <strong>día no laborable</strong>. Los bloques rojos son días no laborables. Haz clic en cualquier evento para editarlo.</>
        )}
      </Typography>
      <Box
        sx={{
          mb: 2,
          overflowX: 'auto',
          minHeight: isMobile ? 300 : 420,
          '& .fc': { minWidth: isMobile ? 260 : 0 },
          '& .fc-view-harness': { margin: 0 },
          '& .fc-day-today': {
            backgroundColor: 'var(--mui-palette-primary-main)',
            opacity: 0.08,
          },
          '& .fc-toolbar': {
            flexWrap: 'wrap',
            gap: 0.5,
            rowGap: 0.75,
          },
          '& .fc-toolbar-title': {
            fontSize: isMobile ? '0.875rem' : '1.25rem',
            lineHeight: 1.3,
          },
          '& .fc-button': {
            padding: isMobile ? '4px 8px' : undefined,
            fontSize: isMobile ? '0.75rem' : undefined,
          },
          '& .fc-col-header-cell-cushion': {
            fontSize: isMobile ? '0.7rem' : undefined,
            padding: isMobile ? '2px 4px' : undefined,
          },
          '& .fc-timegrid-slot-label': {
            fontSize: isMobile ? '0.7rem' : undefined,
          },
          '& .fc-event-title': {
            fontSize: isMobile ? '0.7rem' : undefined,
          },
        }}
      >
        <AppFullCalendar sx={{ minHeight: isMobile ? 300 : 420, overflow: 'visible', '& .fc-view-harness': { margin: 0 } }}>
          <FullCalendar
            plugins={[timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: isMobile ? 'timeGridDay,listWeek' : 'timeGridWeek,timeGridDay,listWeek',
            }}
            views={{
              timeGridWeek: { buttonText: 'Semana' },
              timeGridDay: { buttonText: 'Día' },
              listWeek: { buttonText: 'Lista' },
            }}
            locale={esLocale}
            firstDay={1}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:30:00"
            allDaySlot
            selectable
            nowIndicator
            selectAllow={selectInfo => selectInfo.start >= startOfDay(new Date())}
            select={handleCalendarSelect}
            eventClick={openScheduleModalFromEvent}
            events={calendarEvents}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            datesSet={({ start }) => setCalendarDate(start)}
            initialDate={calendarDate}
            height={isMobile ? 320 : 'auto'}
            contentHeight={isMobile ? 280 : undefined}
          />
        </AppFullCalendar>
      </Box>

      {(scheduleRows.length > 0 || dateBlockRows.filter(b => b.fecha_inicio_date && b.fecha_fin_date).length > 0) && (
        <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }} color="text.secondary">
          {scheduleRows.length} horario(s) · {dateBlockRows.filter(b => b.fecha_inicio_date && b.fecha_fin_date).length} no laborable(s)
        </Typography>
      )}

      <Dialog open={selectTypeModalOpen} onClose={() => { setSelectTypeModalOpen(false); setPendingSelectInfo(null) }} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, py: { xs: 1.5, sm: 2 } }}>¿Qué deseas agregar?</DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button variant="outlined" startIcon={<i className="ri-time-line" />} onClick={handleSelectTypeHorario} fullWidth sx={{ justifyContent: 'flex-start', py: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {isMobile ? 'Horario de precio' : 'Horario de precio (con días y precio)'}
            </Button>
            <Button variant="outlined" color="error" startIcon={<i className="ri-calendar-close-line" />} onClick={handleSelectTypeBlock} fullWidth sx={{ justifyContent: 'flex-start', py: 1.5, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              {isMobile ? 'Día no laborable' : 'Día no laborable (bloquear fechas)'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={blockModalOpen}
        onClose={closeBlockModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{ sx: { overflow: 'visible' } }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, py: { xs: 1.5, sm: 2 } }}>
          {blockModalEditIndex !== null ? 'Editar día no laborable' : 'Nuevo día no laborable'}
        </DialogTitle>
        <DialogContent sx={{ pt: 0, overflow: 'visible' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AppReactDatepicker
                selected={
                  modalBlock.fecha_inicio_date && /^\d{4}-\d{2}-\d{2}$/.test(modalBlock.fecha_inicio_date)
                    ? parseISO(modalBlock.fecha_inicio_date)
                    : startOfDay(new Date())
                }
                onChange={date => date && setModalBlock(prev => ({ ...prev, fecha_inicio_date: formatDateToYYYYMMDD(date) }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Desde"
                customInput={<DatePickerInput label="Desde" />}
                popperPlacement="bottom-start"
                popperClassName={DATE_PICKER_POPPER_CLASS}
                minDate={startOfDay(new Date())}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppReactDatepicker
                selected={
                  modalBlock.fecha_fin_date && /^\d{4}-\d{2}-\d{2}$/.test(modalBlock.fecha_fin_date)
                    ? parseISO(modalBlock.fecha_fin_date)
                    : modalBlock.fecha_inicio_date && /^\d{4}-\d{2}-\d{2}$/.test(modalBlock.fecha_inicio_date)
                      ? parseISO(modalBlock.fecha_inicio_date)
                      : startOfDay(new Date())
                }
                onChange={date => date && setModalBlock(prev => ({ ...prev, fecha_fin_date: formatDateToYYYYMMDD(date) }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Hasta"
                customInput={<DatePickerInput label="Hasta" />}
                popperPlacement="bottom-start"
                popperClassName={DATE_PICKER_POPPER_CLASS}
                minDate={
                  modalBlock.fecha_inicio_date && /^\d{4}-\d{2}-\d{2}$/.test(modalBlock.fecha_inicio_date)
                    ? parseISO(modalBlock.fecha_inicio_date)
                    : startOfDay(new Date())
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Motivo (opcional)"
                placeholder="Ej: Mantenimiento, Festivo"
                value={modalBlock.motivo}
                onChange={e => setModalBlock(prev => ({ ...prev, motivo: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          {blockModalEditIndex !== null && (
            <Button color="error" onClick={deleteBlockModalRow} startIcon={<i className="ri-delete-bin-line" />} fullWidth={isMobile}>
              Eliminar
            </Button>
          )}
          <Box sx={{ flex: isMobile ? 'none' : 1, width: isMobile ? '100%' : 'auto' }} />
          <Button onClick={closeBlockModal} fullWidth={isMobile} sx={{ order: isMobile ? 2 : 0 }}>Cancelar</Button>
          <Button variant="contained" onClick={saveBlockModal} startIcon={<i className="ri-check-line" />} fullWidth={isMobile} sx={{ order: isMobile ? 1 : 0 }}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
          open={scheduleModalOpen}
          onClose={closeScheduleModal}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{ sx: { overflow: 'visible' } }}
        >
            <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, py: { xs: 1.5, sm: 2 } }}>
              {scheduleModalEditIndex !== null ? 'Editar horario' : 'Nuevo horario'}
            </DialogTitle>
            <DialogContent sx={{ pt: 0, overflow: 'visible' }}>
              <Box sx={{ pt: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontSize: { xs: '0.75rem', sm: '0.75rem' } }}>
                  Días (repetir cada semana)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {DAYS_OF_WEEK.map(day => (
                    <Chip
                      key={day.value}
                      label={day.label}
                      size="small"
                      variant={(modalRow.dia_semana || []).includes(day.value) ? 'filled' : 'outlined'}
                      color="primary"
                      onClick={() => toggleModalDay(day.value)}
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
                    />
                  ))}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={6}>
                    <AppReactDatepicker
                      selected={timeStringToDate(modalRow.hora_inicio || '08:00')}
                      onChange={date => date && setModalRow(prev => ({ ...prev, hora_inicio: dateToTimeString(date) }))}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Hora"
                      dateFormat="HH:mm"
                      customInput={<TimePickerInput label="Hora inicio" />}
                      popperPlacement="bottom-start"
                      popperClassName={DATE_PICKER_POPPER_CLASS}
                      minTime={timeStringToDate('06:00')}
                      maxTime={timeStringToDate('23:30')}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <AppReactDatepicker
                      selected={timeStringToDate(modalRow.hora_fin || '09:00')}
                      onChange={date => date && setModalRow(prev => ({ ...prev, hora_fin: dateToTimeString(date) }))}
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      timeCaption="Hora"
                      dateFormat="HH:mm"
                      customInput={<TimePickerInput label="Hora fin" />}
                      popperPlacement="bottom-start"
                      popperClassName={DATE_PICKER_POPPER_CLASS}
                      minTime={timeStringToDate(modalRow.hora_inicio || '06:00')}
                      maxTime={timeStringToDate('23:30')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Precio (S/)"
                      placeholder="Ej: 50"
                      value={modalRow.precio}
                      onChange={e => setModalRow(prev => ({ ...prev, precio: e.target.value }))}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <AppReactDatepicker
                      selected={
                        modalRow.repeatUntil && /^\d{4}-\d{2}-\d{2}$/.test(modalRow.repeatUntil)
                          ? parseISO(modalRow.repeatUntil)
                          : null
                      }
                      onChange={date => setModalRow(prev => ({ ...prev, repeatUntil: date ? formatDateToYYYYMMDD(date) : null }))}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Repetir hasta (opcional)"
                      customInput={<DatePickerInput label="Repetir hasta (opcional)" />}
                      popperPlacement="bottom-start"
                      popperClassName={DATE_PICKER_POPPER_CLASS}
                      minDate={startOfDay(new Date())}
                      isClearable
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2, flexWrap: 'wrap', gap: 1 }}>
              {scheduleModalEditIndex !== null && (
                <Button color="error" onClick={deleteScheduleModalRow} startIcon={<i className="ri-delete-bin-line" />} fullWidth={isMobile}>
                  Eliminar
                </Button>
              )}
              <Box sx={{ flex: isMobile ? 'none' : 1, width: isMobile ? '100%' : 'auto' }} />
              <Button onClick={closeScheduleModal} fullWidth={isMobile} sx={{ order: isMobile ? 2 : 0 }}>Cancelar</Button>
              <Button variant="contained" onClick={saveScheduleModal} startIcon={<i className="ri-check-line" />} fullWidth={isMobile} sx={{ order: isMobile ? 1 : 0 }}>
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
    </div>
  )

  const renderStepResumen = () => {
    const v = getValues()
    const branch = branchesList?.find(b => b.id === Number(v.sede_id))
    const type = courtTypesList?.find(t => t.id === Number(v.court_type_id))
    const validRows = scheduleRows.filter(
      r => Array.isArray(r.dia_semana) && r.dia_semana.length > 0 && r.hora_inicio && r.hora_fin && r.precio !== '' && Number(r.precio) > 0
    )
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Cancha</Typography>
        <Typography variant="body1"><strong>{v.nombre || '—'}</strong></Typography>
        <Typography variant="body2">Sucursal: {branch ? `${branch.name}` : '—'}</Typography>
        <Typography variant="body2">Tipo: {type ? type.nombre : 'Sin tipo'}</Typography>
        {v.descripcion && (
          <Typography variant="body2" sx={{ mt: 1 }}>{v.descripcion}</Typography>
        )}
        {validRows.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>Horarios</Typography>
            {validRows.map((r, i) => (
              <Typography key={i} variant="body2">
                {r.hora_inicio}–{r.hora_fin} · S/ {r.precio} · {(r.dia_semana || []).map(d => DAYS_OF_WEEK.find(x => x.value === d)?.label).filter(Boolean).join(', ')}
                {r.repeatUntil && ` (hasta ${r.repeatUntil})`}
              </Typography>
            ))}
          </>
        )}
        {dateBlockRows.filter(b => b.fecha_inicio_date && b.fecha_fin_date).length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }} gutterBottom>Días no laborables</Typography>
            {dateBlockRows.filter(b => b.fecha_inicio_date && b.fecha_fin_date).map((b, i) => (
              <Typography key={i} variant="body2">
                {b.fecha_inicio_date} – {b.fecha_fin_date}{b.motivo ? ` · ${b.motivo}` : ''}
              </Typography>
            ))}
          </>
        )}
      </Box>
    )
  }

  return (
    <Card className={styles.formCard}>
      <GlobalStyles styles={{ [`.${DATE_PICKER_POPPER_CLASS}`]: { zIndex: '9999 !important' } }} />
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stepper
          activeStep={activeStep}
          orientation="horizontal"
          sx={{
            mb: { xs: 2, sm: 3 },
            '& .MuiStepLabel-label': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
            '& .MuiStepIcon-root': { width: { xs: 28, sm: 32 }, height: { xs: 28, sm: 32 } },
          }}
        >
          <Step>
            <StepLabel>Datos</StepLabel>
          </Step>
          <Step>
            <StepLabel>Horarios</StepLabel>
          </Step>
          <Step>
            <StepLabel>Resumen</StepLabel>
          </Step>
        </Stepper>

        <Box sx={{ pt: 1 }}>
          {activeStep === 0 && (
            <>
              {renderStepDatosBasicos()}
              <Box sx={{ mb: 2, mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={async () => {
                    const valid = await trigger(['sede_id', 'nombre'])
                    if (valid) handleNext()
                  }}
                  sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                >
                  Siguiente
                </Button>
                <Button variant="outlined" onClick={handleSetDefautProps} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>Cancelar</Button>
              </Box>
            </>
          )}
          {activeStep === 1 && (
            <>
              {renderStepHorarios()}
              <Box sx={{ mb: 2, mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button variant="contained" onClick={handleNext} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>Siguiente</Button>
                <Button variant="outlined" onClick={handleBack} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>Atrás</Button>
              </Box>
            </>
          )}
          {activeStep === 2 && (
            <>
              {renderStepResumen()}
              <Box sx={{ mb: 2, mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {isEditMode ? (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmit)}
                    startIcon={isSubmitting ? null : <i className="ri-save-line" />}
                    sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                  >
                    {isSubmitting ? 'Guardando...' : 'Actualizar'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={handleSubmit(onSubmitWizard)}
                    startIcon={isSubmitting ? null : <i className="ri-check-line" />}
                    sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                  >
                    {isSubmitting ? 'Creando...' : 'Crear cancha'}
                  </Button>
                )}
                <Button variant="outlined" onClick={handleBack} sx={{ minWidth: { xs: '100%', sm: 'auto' } }}>Atrás</Button>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default CourtForm
