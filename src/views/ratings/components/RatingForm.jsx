'use client'

import React from 'react'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Rating from '@mui/material/Rating'
import { Controller } from 'react-hook-form'

import { useRatingForm } from '../hooks/useRatingForm'

const RatingForm = ({ controller }) => {
  const {
    showform,
    dataProp,
    courtsList,
    addOrUpdateRating,
    handleSetDefautProps,
    usuario,
  } = controller

  const {
    control,
    handleSubmit,
    errors,
    isSubmitting,
    isEditMode,
    onSubmit,
    resetForm,
  } = useRatingForm({
    dataProp,
    addOrUpdateRating,
    handleSetDefautProps,
    courtsList,
    usuario
  })

  if (!showform) return null

  return (
    <Card sx={{ overflow: 'visible' }}>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="medium">
                <InputLabel>Cancha *</InputLabel>
                <Controller
                  name='cancha_id'
                  control={control}
                  rules={{ required: 'La cancha es requerida' }}
                  render={({ field, fieldState: { error } }) => (
                    <Select {...field} label='Cancha *' error={!!error} disabled={!!isEditMode}>
                      {Array.isArray(courtsList) && courtsList.length > 0 ? (
                        courtsList.map(court => (
                          <MenuItem key={court.id} value={court.id}>
                            {court.nombre} — {court.SportsVenue?.name || 'Sin sucursal'}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value='' disabled>No hay canchas disponibles</MenuItem>
                      )}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography component="legend" variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Puntuación (1-5) *
              </Typography>
              <Controller
                name='puntuacion'
                control={control}
                rules={{
                  required: 'La puntuación es requerida',
                  min: { value: 1, message: 'Mínimo 1' },
                  max: { value: 5, message: 'Máximo 5' }
                }}
                render={({ field, fieldState: { error } }) => (
                  <Box>
                    <Rating
                      name='puntuacion'
                      value={Number(field.value) || 0}
                      onChange={(_, value) => field.onChange(value ?? 5)}
                      size='large'
                      max={5}
                    />
                    {error && (
                      <Typography variant='caption' color='error' sx={{ display: 'block', mt: 0.5 }}>
                        {error.message}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='comentario'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label='Comentario (opcional)'
                    placeholder='Escribe tu opinión sobre la cancha...'
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box className='flex gap-4 pt-4 flex-wrap'>
                <Button variant='contained' type='submit' disabled={isSubmitting} startIcon={<i className='ri-save-line' />}>
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

export default RatingForm
