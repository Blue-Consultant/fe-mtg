'use client'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import { Controller } from 'react-hook-form'

import PhoneInput from '@/components/fields/PhoneInput'

import { useBranchForm, getAvatarSrcValidator } from '../hooks/useBranchForm'
import styles from '../branches.module.css'

const BranchForm = ({ controller }) => {
  const { showform, dataProp, usuario, branchShortList, addOrUpdateBranch, handleSetDefautProps } = controller

  const {
    control,
    handleSubmit,
    setValue,
    errors,
    imgSrc,
    isSubmitting,
    isUploadingLogo,
    isEditMode,
    isHeadquarters,
    hasParentOptions,
    handleFileInputChange,
    handleFileInputReset,
    onSubmit,
    resetForm
  } = useBranchForm({
    dataProp,
    usuario,
    addOrUpdateBranch,
    handleSetDefautProps,
    branchShortList
  })

  if (!showform) return null

  return (
    <div className={styles.formCard}>
      <form className={styles.formBody} onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Imagen de la sede</h2>
          <p className={styles.formSectionHint}>Usa el logo o una foto del local. Se sube a S3 al elegir el archivo.</p>
          <div className={styles.logoRow}>
            <div className={styles.logoPreview}>
              <img src={getAvatarSrcValidator(imgSrc)} alt='Logo de la sede' />
            </div>
            <div className={styles.logoActions}>
              <div className={styles.logoButtons}>
                <label className={`${styles.btnPrimary} ${styles.btnSm}${isUploadingLogo ? ` ${styles.btnBusy}` : ''}`}>
                  {isUploadingLogo ? 'Subiendo…' : 'Subir imagen'}
                  <input
                    hidden
                    type='file'
                    accept='image/png,image/jpeg,image/webp,image/gif'
                    disabled={isUploadingLogo || isSubmitting}
                    onChange={handleFileInputChange}
                  />
                </label>
                <button
                  type='button'
                  className={`${styles.btnGhost} ${styles.btnSm}`}
                  onClick={handleFileInputReset}
                  disabled={isUploadingLogo || isSubmitting}
                >
                  Quitar
                </button>
              </div>
              <p className={styles.logoHint}>JPG, PNG, WEBP o GIF. Las fotos de celular se comprimen solas.</p>
            </div>
          </div>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Datos de la sede</h2>
          <p className={styles.formSectionHint}>Lo esencial para identificar y contactar tu local.</p>

          <div className={styles.fields}>
            <Controller
              name='name'
              control={control}
              rules={{ required: 'El nombre de la sede es obligatorio' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  className={styles.formField}
                  fullWidth
                  label='Nombre de la sede'
                  placeholder='Ej. MTG San Isidro'
                  error={!!error}
                  helperText={error?.message || ''}
                />
              )}
            />

            <Controller
              name='company_name'
              control={control}
              rules={{ required: 'La razón social es obligatoria' }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  className={styles.formField}
                  fullWidth
                  label='Razón social'
                  placeholder='Nombre legal del negocio'
                  error={!!error}
                  helperText={error?.message || ''}
                />
              )}
            />

            <Controller
              name='email'
              control={control}
              rules={{
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Ingresa un correo válido'
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  className={styles.formField}
                  fullWidth
                  label='Correo de contacto'
                  placeholder='sede@tuemail.com'
                  error={!!error}
                  helperText={error?.message || ''}
                />
              )}
            />

            <Controller
              name='phone_number'
              control={control}
              rules={{
                required: 'El celular es obligatorio',
                pattern: {
                  value: /^\+?\d{6,15}$/,
                  message: 'Ingresa un número válido'
                }
              }}
              render={({ field }) => (
                <div className={styles.formField}>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.phone_number}
                    helperText={errors.phone_number?.message || ''}
                    setValue={setValue}
                    name='phone_number'
                    label='Celular / WhatsApp'
                  />
                </div>
              )}
            />

            <Controller
              name='city'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className={styles.formField}
                  fullWidth
                  label='Ciudad'
                  placeholder='Lima'
                />
              )}
            />

            <Controller
              name='country'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className={styles.formField}
                  fullWidth
                  label='País'
                  placeholder='Perú'
                />
              )}
            />

            <Controller
              name='address'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  className={`${styles.formField} ${styles.fieldFull}`}
                  fullWidth
                  label='Dirección'
                  placeholder='Av. Principal 123, distrito'
                />
              )}
            />
          </div>
        </section>

        <section className={styles.formSection}>
          <h2 className={styles.formSectionTitle}>Tipo de sede</h2>
          <Controller
            name='is_headquarters'
            control={control}
            render={({ field }) => (
              <div
                className={styles.switchRow}
                role='button'
                tabIndex={0}
                onClick={() => field.onChange(!field.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    field.onChange(!field.value)
                  }
                }}
              >
                <div className={styles.switchCopy}>
                  <strong>Sede principal</strong>
                  <span>
                    {field.value
                      ? 'Esta es tu sede principal (local matriz).'
                      : 'Desactívalo si es una sucursal secundaria.'}
                  </span>
                </div>
                <Switch
                  checked={Boolean(field.value)}
                  onClick={event => event.stopPropagation()}
                  onChange={event => field.onChange(event.target.checked)}
                  color='default'
                  inputProps={{ 'aria-label': 'Sede principal' }}
                  sx={{
                    flexShrink: 0,
                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#13b236' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#13b236',
                      opacity: 1
                    },
                    '& .MuiSwitch-track': { backgroundColor: '#c5d0c8', opacity: 1 }
                  }}
                />
              </div>
            )}
          />

          {!isHeadquarters && hasParentOptions ? (
            <FormControl fullWidth className={styles.formField}>
              <InputLabel id='parent-venue-label'>Depende de (sede principal)</InputLabel>
              <Controller
                name='parent_venue_id'
                control={control}
                render={({ field }) => (
                  <Select {...field} labelId='parent-venue-label' label='Depende de (sede principal)'>
                    {branchShortList.map(branchUser => (
                      <MenuItem key={branchUser.Branches.id} value={branchUser.Branches.id}>
                        {branchUser.Branches.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          ) : null}
        </section>

        <div className={styles.formActions}>
          <button type='submit' className={styles.btnPrimary} disabled={isSubmitting || isUploadingLogo}>
            {isSubmitting ? 'Guardando…' : isEditMode ? 'Guardar cambios' : 'Registrar sede'}
          </button>
          <button
            type='button'
            className={styles.btnGhost}
            onClick={resetForm}
            disabled={isSubmitting || isUploadingLogo}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}

export default BranchForm
