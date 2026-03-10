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
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormHelperText from '@mui/material/FormHelperText'
import { Controller } from 'react-hook-form'

import { useDateBlockForm } from '../hooks/useDateBlockForm'

// Franjas horarias cada hora: 06:00 - 23:00
const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
  const h = 6 + i

  return `${String(h).padStart(2, '0')}:00`
})

const DateBlockForm = ({ controller }) => {
  const { showform, dataProp, courtsList, addOrUpdateDateBlock, handleSetDefautProps } = controller

  const { control, handleSubmit, errors, isSubmitting, isEditMode, onSubmit, resetForm } = useDateBlockForm({
    dataProp,
    addOrUpdateDateBlock,
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

            {/* Motivo */}
            <Grid item xs={12} md={6}>
              <Controller
                name='motivo'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='medium'
                    label='Motivo (opcional)'
                    placeholder='Ej. Mantenimiento, Torneo...'
                  />
                )}
              />
            </Grid>

            {/* Bloque: Inicio del bloqueo (fecha + hora en chips) */}
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
                    <i className='ri-calendar-event-line' style={{ fontSize: 20 }} />
                  </Box>
                  Inicio del bloqueo
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      Fecha de inicio *
                    </Typography>
                    <Controller
                      name='fecha_inicio_date'
                      control={control}
                      rules={{ required: 'La fecha de inicio es requerida' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          type='date'
                          size='small'
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
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
                </Grid>
              </Box>
            </Grid>

            {/* Bloque: Fin del bloqueo (fecha + hora en chips) */}
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
                    <i className='ri-calendar-check-line' style={{ fontSize: 20 }} />
                  </Box>
                  Fin del bloqueo
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                      Fecha de fin *
                    </Typography>
                    <Controller
                      name='fecha_fin_date'
                      control={control}
                      rules={{ required: 'La fecha de fin es requerida' }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          type='date'
                          size='small'
                          fullWidth
                          error={!!error}
                          helperText={error?.message}
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
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

            {/* Estado */}
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller
                name='estado'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label='Bloqueo activo'
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

export default DateBlockForm
