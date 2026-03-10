'use client'

// React Imports
import { memo, useState, useRef } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import Link from '@components/Link'
import { PasswordField, SocialLoginButton } from '@/components/auth'

// API Imports (using existing register API)
import { singUpAddUser, verifyUserByEmailOrDni } from '@/views/Register/ApiRegister'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * RegisterForm - Formulario de registro de usuario
 */
const RegisterForm = ({ dictionary = {}, onSuccess }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Refs
  const isSubmitting = useRef(false)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  // Translations
  const t = dictionary?.registerMtg || {}

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone_number: ''
    }
  })

  const password = watch('password')

  // Submit handler
  const onSubmit = async data => {
    if (isSubmitting.current) return

    isSubmitting.current = true
    setLoading(true)
    setErrorMessage('')

    try {
      // Verify if email already exists (API espera { email?, dni?, status })
      const verifyResponse = await verifyUserByEmailOrDni({ email: data.email, status: true })

      if (verifyResponse?.userData) {
        setErrorMessage(t.errorEmailExists || 'Este correo ya está registrado')

        return
      }

      // Create user (backend requiere phone_number y user_type; DNI no se pide en frontend)
      const response = await singUpAddUser({
        first_name: data.fullName.split(' ')[0],
        last_name: data.fullName.split(' ').slice(1).join(' ') || '',
        email: data.email,
        password: data.password,
        phone_number: data.phone_number.trim(),
        user_type: 'client'
      })

      if (response.status >= 400) {
        throw new Error(response.message || 'Error al registrar')
      }

      setSuccessMessage(t.successMessage || '¡Cuenta creada! Ya puedes iniciar sesión.')

      if (onSuccess) {
        onSuccess(response.data)
      }

      // Redirigir a login en 2 s (sin servicio de correo, puede entrar de inmediato)
      setTimeout(() => {
        router.push(getLocalizedUrl('/login-mtg', locale))
      }, 2000)
    } catch (error) {
      console.error('Register error:', error)
      setErrorMessage(error.message || t.errorServer || 'Error del servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
      isSubmitting.current = false
    }
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 480 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant='h3'
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.02em',
            mb: 1
          }}
        >
          {t.title || 'Crea tu cuenta'}
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {t.subtitle || 'Reserva tu cancha en segundos y empieza a jugar hoy mismo.'}
        </Typography>
      </Box>

      {/* Success Alert */}
      {successMessage && (
        <Alert severity='success' sx={{ mb: 3, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Social Login */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
        <SocialLoginButton provider='google' fullWidth />
        <SocialLoginButton provider='apple' fullWidth />
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {t.divider || 'o regístrate con email'}
        </Typography>
      </Divider>

      {/* Form */}
      <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Full Name Field */}
        <Box sx={{ mb: 2.5 }}>
          <Controller
            name='fullName'
            control={control}
            rules={{
              required: t.errorNameRequired || 'El nombre es requerido',
              minLength: {
                value: 2,
                message: t.errorNameMin || 'Mínimo 2 caracteres'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t.nameLabel || 'Nombre completo'}
                placeholder={t.namePlaceholder || 'Ej. Juan Pérez'}
                fullWidth
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
                autoComplete='name'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    height: 56
                  }
                }}
              />
            )}
          />
        </Box>

        {/* Phone Field */}
        <Box sx={{ mb: 2.5 }}>
          <Controller
            name='phone_number'
            control={control}
            rules={{
              required: t.errorPhoneRequired || 'El teléfono es requerido',
              minLength: {
                value: 9,
                message: t.errorPhoneMin || 'Teléfono inválido (mín. 9 dígitos)'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={t.phoneLabel || 'Teléfono'}
                placeholder={t.phonePlaceholder || 'Ej. 987 654 321'}
                fullWidth
                error={!!errors.phone_number}
                helperText={errors.phone_number?.message}
                autoComplete='tel'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    height: 56
                  }
                }}
              />
            )}
          />
        </Box>

        {/* Email Field */}
        <Box sx={{ mb: 2.5 }}>
          <Controller
            name='email'
            control={control}
            rules={{
              required: t.errorEmailRequired || 'El correo es requerido',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t.errorEmailInvalid || 'Ingresa un correo válido'
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                type='email'
                label={t.emailLabel || 'Correo electrónico'}
                placeholder={t.emailPlaceholder || 'nombre@ejemplo.com'}
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete='email'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    height: 56
                  }
                }}
              />
            )}
          />
        </Box>

        {/* Password Field */}
        <Box sx={{ mb: 2.5 }}>
          <Controller
            name='password'
            control={control}
            rules={{
              required: t.errorPasswordRequired || 'La contraseña es requerida',
              minLength: {
                value: 8,
                message: t.errorPasswordMin || 'Mínimo 8 caracteres'
              }
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t.passwordLabel || 'Contraseña'}
                placeholder={t.passwordPlaceholder || 'Mínimo 8 caracteres'}
                error={errors.password?.message}
              />
            )}
          />
        </Box>

        {/* Confirm Password Field */}
        <Box sx={{ mb: 3 }}>
          <Controller
            name='confirmPassword'
            control={control}
            rules={{
              required: t.errorConfirmRequired || 'Confirma tu contraseña',
              validate: value => value === password || t.errorPasswordMatch || 'Las contraseñas no coinciden'
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t.confirmPasswordLabel || 'Confirmar contraseña'}
                placeholder={t.confirmPasswordPlaceholder || 'Repite tu contraseña'}
                error={errors.confirmPassword?.message}
              />
            )}
          />
        </Box>

        {/* Submit Button */}
        <Button
          type='submit'
          variant='contained'
          fullWidth
          disabled={loading}
          sx={{
            height: 56,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(19, 236, 91, 0.2)',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(19, 236, 91, 0.3)'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color='inherit' />
          ) : (
            <>
              {t.submit || 'Registrarse'}
              <i className='ri-arrow-right-line' style={{ marginLeft: 8 }} />
            </>
          )}
        </Button>

        {/* Terms */}
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          {t.termsPrefix || 'Al registrarte, aceptas nuestros'}{' '}
          <Link href='#' style={{ textDecoration: 'underline' }}>
            {t.termsLink || 'Términos de Servicio'}
          </Link>{' '}
          {t.termsAnd || 'y'}{' '}
          <Link href='#' style={{ textDecoration: 'underline' }}>
            {t.privacyLink || 'Política de Privacidad'}
          </Link>
          .
        </Typography>
      </Box>

      {/* Login Link - Mobile */}
      <Box sx={{ display: { sm: 'none' }, textAlign: 'center', mt: 4 }}>
        <Typography variant='body2' color='text.secondary'>
          {t.hasAccount || '¿Ya tienes cuenta?'}{' '}
          <Link
            href={getLocalizedUrl('/login-mtg', locale)}
            style={{
              fontWeight: 700,
              textDecoration: 'underline',
              textDecorationColor: 'var(--mui-palette-primary-main)'
            }}
          >
            {t.login || 'Inicia Sesión'}
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default memo(RegisterForm)
