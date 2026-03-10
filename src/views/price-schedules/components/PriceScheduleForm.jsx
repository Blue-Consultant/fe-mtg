'use client'

import React, { useState } from 'react'

import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import FormHelperText from '@mui/material/FormHelperText'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import { Controller } from 'react-hook-form'

import { usePriceScheduleForm } from '../hooks/usePriceScheduleForm'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
]

// Franjas horarias cada hora: 06:00 - 23:00
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 6 + i

  return `${String(h).padStart(2, '0')}:00`
})

const PriceScheduleForm = ({ controller }) => {
  const { showform, dataProp, courtsList, addOrUpdatePriceSchedule, handleSetDefautProps } = controller

  const { control, handleSubmit, setValue, errors, isSubmitting, isEditMode, onSubmit, resetForm } =
    usePriceScheduleForm({
      dataProp,
      addOrUpdatePriceSchedule,
      handleSetDefautProps,
      courtsList
    })

  const [customStartOpen, setCustomStartOpen] = useState(false)
  const [customEndOpen, setCustomEndOpen] = useState(false)

  if (!showform) return null

  return (
    <Card sx={{ overflow: 'visible' }}>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            {/* Cancha */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size='medium'>
                <InputLabel>Cancha *</InputLabel>
                <Controller
                  name='cancha_id'
                  control={control}
                  rules={{ required: 'La cancha es requerida' }}
                  render={({ field, fieldState: { error } }) => (
                    <Select {...field} label='Cancha *' error={!!error}>
                      {Array.isArray(courtsList) && courtsList.length > 0 ? (
                        courtsList.map(court => (
                          <MenuItem key={court.id} value={court.id}>
                            {court.nombre} — {court.SportsVenue?.name || 'Sin sucursal'}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value='' disabled>
                          No hay canchas disponibles
                        </MenuItem>
                      )}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            {/* Días de la semana */}
            <Grid item xs={12} md={6}>
              {isEditMode ? (
                <FormControl fullWidth size='medium'>
                  <InputLabel>Día de la semana *</InputLabel>
                  <Controller
                    name='dia_semana'
                    control={control}
                    rules={{ required: 'El día es requerido' }}
                    render={({ field, fieldState: { error } }) => (
                      <Select {...field} label='Día de la semana *' error={!!error}>
                        {DAYS_OF_WEEK.map(day => (
                          <MenuItem key={day.value} value={day.value}>
                            {day.label}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>
              ) : (
                <FormControl error={!!errors.dias_semana} component='fieldset' fullWidth>
                  <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1.5 }}>
                    <Box component='span' sx={{ mr: 0.5, verticalAlign: 'middle' }}>
                      <i className='ri-calendar-line' style={{ fontSize: 18 }} />
                    </Box>
                    Días de la semana *
                  </Typography>
                  <Controller
                    name='dias_semana'
                    control={control}
                    rules={{
                      validate: v => (Array.isArray(v) && v.length > 0) || 'Selecciona al menos un día'
                    }}
                    render={({ field }) => (
                      <FormGroup row sx={{ gap: 0.5, flexWrap: 'wrap' }}>
                        {DAYS_OF_WEEK.map(day => (
                          <Chip
                            key={day.value}
                            label={day.label}
                            onClick={() => {
                              const arr = field.value || []
                              const has = arr.includes(day.value)

                              field.onChange(has ? arr.filter(d => d !== day.value) : [...arr, day.value])
                            }}
                            variant={
                              Array.isArray(field.value) && field.value.includes(day.value) ? 'filled' : 'outlined'
                            }
                            color='primary'
                            size='small'
                            sx={{ mb: 0.5 }}
                          />
                        ))}
                      </FormGroup>
                    )}
                  />
                  {errors.dias_semana && <FormHelperText>{errors.dias_semana.message}</FormHelperText>}
                </FormControl>
              )}
            </Grid>

            {/* Bloque: Rango de horario (más interactivo) */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 2 }}>
                  <Box component='span' sx={{ mr: 1, verticalAlign: 'middle' }}>
                    <i className='ri-time-line' style={{ fontSize: 20 }} />
                  </Box>
                  Rango de horario
                </Typography>

                <Grid container spacing={3}>
                  {/* Hora de inicio */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      Hora de inicio *
                    </Typography>
                    <Controller
                      name='hora_inicio'
                      control={control}
                      rules={{ required: 'Selecciona hora de inicio' }}
                      render={({ field }) => (
                        <>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {TIME_SLOTS.map(slot => (
                              <Chip
                                key={`start-${slot}`}
                                label={slot}
                                size='small'
                                variant={field.value === slot ? 'filled' : 'outlined'}
                                color='primary'
                                onClick={() => {
                                  field.onChange(slot)
                                  setCustomStartOpen(false)
                                }}
                                sx={{ fontWeight: field.value === slot ? 600 : 400 }}
                              />
                            ))}
                            <Chip
                              label='Otro'
                              size='small'
                              variant={customStartOpen ? 'filled' : 'outlined'}
                              color='default'
                              onClick={() => setCustomStartOpen(!customStartOpen)}
                            />
                          </Box>
                          {customStartOpen && (
                            <Box sx={{ mt: 1.5 }}>
                              <TextField
                                {...field}
                                type='time'
                                size='small'
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{ maxWidth: 140 }}
                              />
                            </Box>
                          )}
                        </>
                      )}
                    />
                    {errors.hora_inicio && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        {errors.hora_inicio.message}
                      </FormHelperText>
                    )}
                  </Grid>

                  {/* Hora de fin */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      Hora de fin *
                    </Typography>
                    <Controller
                      name='hora_fin'
                      control={control}
                      rules={{ required: 'Selecciona hora de fin' }}
                      render={({ field }) => (
                        <>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {TIME_SLOTS.map(slot => (
                              <Chip
                                key={`end-${slot}`}
                                label={slot}
                                size='small'
                                variant={field.value === slot ? 'filled' : 'outlined'}
                                color='primary'
                                onClick={() => {
                                  field.onChange(slot)
                                  setCustomEndOpen(false)
                                }}
                                sx={{ fontWeight: field.value === slot ? 600 : 400 }}
                              />
                            ))}
                            <Chip
                              label='Otro'
                              size='small'
                              variant={customEndOpen ? 'filled' : 'outlined'}
                              color='default'
                              onClick={() => setCustomEndOpen(!customEndOpen)}
                            />
                          </Box>
                          {customEndOpen && (
                            <Box sx={{ mt: 1.5 }}>
                              <TextField
                                {...field}
                                type='time'
                                size='small'
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                sx={{ maxWidth: 140 }}
                              />
                            </Box>
                          )}
                        </>
                      )}
                    />
                    {errors.hora_fin && (
                      <FormHelperText error sx={{ mt: 0.5 }}>
                        {errors.hora_fin.message}
                      </FormHelperText>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Precio con S/ (soles) */}
            <Grid item xs={12} sm={6}>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                Precio por hora *
              </Typography>
              <Controller
                name='precio'
                control={control}
                rules={{
                  required: 'El precio es requerido',
                  min: { value: 0, message: 'El precio debe ser mayor o igual a 0' }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    placeholder='0.00'
                    inputProps={{ min: 0, step: 0.01 }}
                    error={!!error}
                    helperText={error?.message}
                    size='medium'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 36,
                              height: 28,
                              borderRadius: 1,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              fontWeight: 700,
                              fontSize: '0.9rem'
                            }}
                          >
                            S/
                          </Box>
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </Grid>

            {/* Estado */}
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller
                name='estado'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label='Horario activo'
                    control={
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        color='primary'
                      />
                    }
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box className='flex gap-4 pt-4 flex-wrap'>
                <Button
                  variant='contained'
                  type='submit'
                  disabled={isSubmitting}
                  startIcon={<i className='ri-save-line' />}
                >
                  {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
                </Button>
                <Button variant='outlined' type='reset' color='secondary' onClick={resetForm}>
                  Reset
                </Button>
                <Button variant='outlined' color='secondary' onClick={handleSetDefautProps}>
                  Cancelar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default PriceScheduleForm
