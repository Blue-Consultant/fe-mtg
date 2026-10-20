'use client'

import { useMemo } from 'react'

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
import { Controller, useWatch } from 'react-hook-form'

import { useCourtForm } from '../hooks/useCourtForm'
import styles from '../courts.module.css'

const CourtForm = ({ controller }) => {
  const {
    dataProp,
    branchesList,
    courtTypesList,
    ownerEmployees,
    memoizedDictionary,
    addOrUpdateCourt,
    handleSetDefautProps
  } = controller

  const vt = memoizedDictionary?.modules?.venuesTabs ?? {}

  const {
    control,
    handleSubmit,
    isSubmitting,
    isUploadingImage,
    isEditMode,
    imagePreview,
    handleImageInputChange,
    handleImageReset,
    onSubmit
  } = useCourtForm({
    dataProp,
    addOrUpdateCourt,
    handleSetDefautProps,
    branchesList,
    courtTypesList
  })

  const sedeIdW = useWatch({ control, name: 'sede_id' })

  const encargadoOptions = useMemo(() => {
    if (!Array.isArray(ownerEmployees) || ownerEmployees.length === 0) return []

    const sid = Number(sedeIdW)

    if (!sedeIdW || Number.isNaN(sid)) return ownerEmployees

    const matching = ownerEmployees.filter(emp => (emp.venues || []).some(venue => Number(venue.id) === sid))

    return matching.length > 0 ? matching : ownerEmployees
  }, [ownerEmployees, sedeIdW])

  return (
    <Card className={styles.formCard}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <div className={styles.formSection}>
          <Typography variant='subtitle1' className={styles.formSectionTitle}>
            Imagen de la cancha
          </Typography>
          <div className={styles.imageUpload}>
            <div className={styles.imagePreview}>
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt='Vista previa de la cancha' />
              ) : (
                <span className={styles.imageEmpty}>
                  <i className='ri-image-add-line' aria-hidden />
                  Sin foto
                </span>
              )}
            </div>
            <div className={styles.imageActions}>
              <label
                className={`${styles.imageBtn}${isUploadingImage || isSubmitting ? ` ${styles.imageBtnBusy}` : ''}`}
              >
                {isUploadingImage ? 'Subiendo…' : 'Subir imagen'}
                <input
                  hidden
                  type='file'
                  accept='image/png,image/jpeg,image/webp,image/gif'
                  disabled={isUploadingImage || isSubmitting}
                  onChange={handleImageInputChange}
                />
              </label>
              {imagePreview ? (
                <button
                  type='button'
                  className={styles.imageBtnGhost}
                  onClick={handleImageReset}
                  disabled={isUploadingImage || isSubmitting}
                >
                  Quitar
                </button>
              ) : null}
              <Typography variant='caption' color='text.secondary'>
                JPG, PNG o WEBP. Máx. 800 KB.
              </Typography>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <Typography variant='subtitle1' className={styles.formSectionTitle}>
            Ubicación y datos básicos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Sucursal *</InputLabel>
                <Controller
                  name='sede_id'
                  control={control}
                  rules={{ required: 'La sucursal es requerida' }}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      {...field}
                      label='Sucursal *'
                      error={!!error}
                      value={
                        field.value === null || field.value === undefined || field.value === ''
                          ? ''
                          : Number(field.value)
                      }
                      onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    >
                      {Array.isArray(branchesList) && branchesList.length > 0 ? (
                        branchesList.map(branch => (
                          <MenuItem key={branch.id} value={Number(branch.id)}>
                            {branch.name} — {branch.company_name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value='' disabled>
                          No hay sucursales disponibles
                        </MenuItem>
                      )}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='nombre'
                control={control}
                rules={{ required: 'El nombre es requerido' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    label='Nombre de la cancha *'
                    placeholder='Ej: Cancha principal'
                    error={!!error}
                    helperText={error ? error.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>Tipo de cancha</InputLabel>
                <Controller
                  name='court_type_id'
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      {...field}
                      label='Tipo de cancha'
                      value={field.value === null || field.value === undefined ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                      error={!!error}
                    >
                      <MenuItem value=''>
                        <em>Sin tipo</em>
                      </MenuItem>
                      {Array.isArray(courtTypesList) && courtTypesList.length > 0 ? (
                        courtTypesList.map(type => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.nombre}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value='' disabled>
                          No hay tipos disponibles
                        </MenuItem>
                      )}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='capacidad'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type='number'
                    fullWidth
                    size='small'
                    label='Capacidad (personas)'
                    placeholder='Ej: 10'
                    inputProps={{ min: 0 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name='estado'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label='Cancha activa (visible para reservas)'
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size='small'>
                <InputLabel>{vt.encargadoCourt ?? 'Encargado (empleado)'}</InputLabel>
                <Controller
                  name='encargado_usuario_id'
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label={vt.encargadoCourt ?? 'Encargado (empleado)'}
                      value={
                        field.value === null || field.value === undefined || field.value === ''
                          ? ''
                          : Number(field.value)
                      }
                      onChange={e => {
                        const v = e.target.value

                        field.onChange(v === '' ? '' : Number(v))
                      }}
                    >
                      <MenuItem value=''>
                        <em>{vt.encargadoNone ?? 'Sin encargado'}</em>
                      </MenuItem>
                      {encargadoOptions.length === 0 ? (
                        <MenuItem value='__none' disabled>
                          {vt.encargadoEmpty ?? 'No hay empleados. Créalos en Empleados.'}
                        </MenuItem>
                      ) : (
                        encargadoOptions.map(emp => (
                          <MenuItem key={emp.id} value={Number(emp.id)}>
                            {[emp.first_name, emp.last_name].filter(Boolean).join(' ')} ({emp.email})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                />
              </FormControl>
              {vt.encargadoHelp ? (
                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                  {vt.encargadoHelp}
                </Typography>
              ) : null}
            </Grid>
          </Grid>
        </div>

        <div className={styles.formSection}>
          <Typography variant='subtitle1' className={styles.formSectionTitle}>
            Descripción
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name='descripcion'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size='small'
                    multiline
                    rows={4}
                    label='Descripción'
                    placeholder='Describe la cancha, superficie, medidas, servicios...'
                  />
                )}
              />
            </Grid>
          </Grid>
        </div>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            className={styles.btnPrimary}
            variant='contained'
            disabled={isSubmitting || isUploadingImage}
            onClick={handleSubmit(onSubmit)}
            startIcon={isSubmitting ? null : <i className={isEditMode ? 'ri-save-line' : 'ri-check-line'} />}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            {isSubmitting ? (isEditMode ? 'Guardando...' : 'Creando...') : isEditMode ? 'Actualizar' : 'Crear cancha'}
          </Button>
          <Button
            className={styles.btnGhost}
            variant='outlined'
            onClick={handleSetDefautProps}
            disabled={isSubmitting}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Cancelar
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CourtForm
