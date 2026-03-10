'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'


// Hook Imports
import { useForm, Controller } from 'react-hook-form'

// Third-party Imports
import { MuiTelInput } from 'mui-tel-input';
import { getLocalizedUrl } from '@/utils/i18n'



const CreateUser = ({ addUserNew, locale, userRole, handleOutcomeAction, formErrors, setFormErrors, memoizedDictionary }) => {

  const t = memoizedDictionary;
  const reg = t.modules?.register || {};
  const f = reg.form?.fields || {};

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mapear userRole del sistema anterior al nuevo sistema (si viene del flujo anterior)
  const defaultUserType = userRole === 'HOLDER' || userRole === 'OWNER' ? 'owner' : 'client';

  // Hooks
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      dni: '',
      email: '',
      password: '',
      user_type: defaultUserType,
      privacy_policy: false
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)


  return (
    <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
      <div className='flex justify-center items-center'>
        <Typography variant='h4'>✏️ {t.modules?.register?.messages?.register || 'Registrate'}</Typography>
      </div>

      <form onSubmit={handleSubmit(addUserNew)}>
        <Grid container spacing={5}>

          {/* Mostrar error general si existe */}
          {formErrors?.general && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setFormErrors(null)}>
                {formErrors.general}
              </Alert>
            </Grid>
          )}

          {/* Selección de tipo de usuario */}
          <Grid item xs={12}>
            <Controller
              name='user_type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>¿Cómo quieres registrarte?</InputLabel>
                  <Select
                    {...field}
                    label="¿Cómo quieres registrarte?"
                    error={!!errors.user_type}
                  >
                    <MenuItem value="client">Cliente - Reservar canchas</MenuItem>
                    <MenuItem value="owner">Propietario - Gestionar mis canchas</MenuItem>
                  </Select>
                  {errors.user_type && (
                    <Typography color='error' variant='caption' sx={{ mt: 0.5, ml: 1.75 }}>
                      {reg.rules?.required || 'Este campo es obligatorio.'}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='first_name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={f.name?.label || 'Nombres'}
                  placeholder={f.name?.placeholder || 'John'}
                  {...(errors.first_name && { error: true, helperText: reg.rules?.required || 'Este campo es obligatorio.' })}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='last_name'
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={f.last_name?.label || 'Apellidos (opcional)'}
                  placeholder={f.last_name?.placeholder || 'Doe'}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="phone_number"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <MuiTelInput
                  {...field}
                  label={f.phone_number?.label || 'Teléfono'}
                  defaultCountry="PE"
                  fullWidth
                  MenuProps={{
                    disableScrollLock: true,
                    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                    transformOrigin: { vertical: 'top', horizontal: 'left' }
                  }}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number ? reg.rules?.required || 'Este campo es obligatorio.' : ''}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='dni'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='text'
                  label={f.dni?.label || 'DNI'}
                  placeholder={f.dni.placeholder || '12345678'}
                  error={!!errors.dni || !!formErrors?.ErrorDni}
                  helperText={errors.dni ? reg.rules?.required || 'Este campo es obligatorio.' : formErrors?.ErrorDni}
                  onChange={e => {
                    field.onChange(e)
                    setFormErrors(null)
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='email'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type='email'
                  label={f.email?.label || 'Correo electrónico'}
                  placeholder={f.email.placeholder || 'johndoe@gmail.com'}
                  error={!!errors.email || !!formErrors?.ErrorEmail}
                  helperText={errors.email ? reg.rules?.required || 'Este campo es obligatorio.' : formErrors?.ErrorEmail}
                  onChange={e => {
                    field.onChange(e)
                    setFormErrors(null)
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name='password'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={f.password?.label || 'Contraseña'}
                  id='outlined-password'
                  placeholder={f.password.placeholder || '············'}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  {...(errors.password && { error: true, helperText: reg.rules?.required || 'Este campo es obligatorio.' })}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <div className='flex flex-col'>
              <div className='flex justify-between items-center gap-3'>
                <Controller
                  name='privacy_policy'
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label={
                        <>
                          <span>{reg.messages.privactPolicyInit || 'Acepto la'} </span>
                          <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                            {reg.messages.privactPolicyEnd || 'política de privacidad y términos de uso'}
                          </Link>
                        </>
                      }
                    />
                  )}
                />
              </div>
              {errors.privacy_policy && (
                <Typography color='error' variant='caption' sx={{ ml: 2 }}>
                  {'Debes aceptar la política de privacidad.'}
                </Typography>
              )}
            </div>
          </Grid>

          <Grid item xs={12} className='flex gap-4'>
            <Button fullWidth variant='contained' type='submit'>
              {loading && <CircularProgress size={20} color='inherit' />}
              {reg.actions?.submit || 'Registrar'}
            </Button>
          </Grid>
        </Grid>
        <div className='flex justify-center items-center flex-wrap gap-2'>
          <Typography>{reg.messages?.alreadyRegistered || '¿Ya tienes una cuenta?'}</Typography>
          <Typography component={Link} href={getLocalizedUrl('/login', locale)} color='primary'>
            {t.common.login || 'Iniciar sesión'}
          </Typography>
        </div>
      </form>
    </div>
  )
}

export default CreateUser
