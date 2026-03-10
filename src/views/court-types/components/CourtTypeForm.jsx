'use client'

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import { Controller } from 'react-hook-form'

import { useCourtTypeForm } from '../hooks/useCourtTypeForm'

const CourtTypeForm = ({ controller }) => {
  const { showform, dataProp, addOrUpdateCourtType, handleSetDefautProps } = controller

  const { control, handleSubmit, register, errors, isSubmitting, isEditMode, onSubmit } = useCourtTypeForm({
    dataProp,
    addOrUpdateCourtType,
    handleSetDefautProps
  })

  if (!showform) return null

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Nombre *'
                {...register('nombre', { required: 'El nombre es requerido' })}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='Descripción' {...register('descripcion')} multiline rows={2} />
            </Grid>
            {isEditMode && (
              <Grid item xs={12}>
                <Controller
                  name='estado'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={!!field.value} />}
                      label={<Typography variant='body2'>Activo</Typography>}
                    />
                  )}
                />
              </Grid>
            )}
            <Grid item xs={12} className='flex gap-2'>
              <Button type='submit' variant='contained' disabled={isSubmitting}>
                {isEditMode ? 'Guardar cambios' : 'Crear tipo'}
              </Button>
              <Button type='button' variant='outlined' onClick={handleSetDefautProps}>
                Cancelar
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default CourtTypeForm
