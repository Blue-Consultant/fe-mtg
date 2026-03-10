'use client'

// React Imports
import { memo, useState, useRef } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { signIn } from 'next-auth/react'

// Redux Imports
import { useDispatch } from 'react-redux'
import { setUser } from '@/redux-store/slices/login'
import { persistor } from '@/redux-store'

// Component Imports
import Link from '@components/Link'
import { PasswordField, SocialLoginButton } from '@/components/auth'

// API Imports
import { LoginUser } from '@/views/Login/ApiLogin'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * LoginForm - Formulario de inicio de sesión
 */
const LoginForm = ({ dictionary = {} }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)

  // Refs
  const isSubmitting = useRef(false)

  // Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  // Translations
  const t = dictionary?.loginMtg || {}

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  // Email validation
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Submit handler
  const onSubmit = async (data) => {
    if (isSubmitting.current) return

    isSubmitting.current = true
    setLoading(true)
    setErrorMessage('')

    try {
      const { msg, user, permissions, roles } = await LoginUser(data)

      if (!user) {
        setErrorMessage(msg || t.errorInvalidCredentials || 'Credenciales inválidas')
        return
      }

      if (user.status === false) {
        setErrorMessage(msg || t.errorAccountInactive || 'Tu cuenta no está activa')
        return
      }

      // Store permissions and roles in localStorage
      if (permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(permissions))
      }
      if (roles) {
        localStorage.setItem('userRoles', JSON.stringify(roles))
      }

      // Sign in with next-auth
      const res = await signIn('credentials', {
        id: user.id,
        name: user.first_name,
        email: user.email,
        image: null,
        redirect: false
      })

      if (res?.ok && !res.error) {
        dispatch(setUser({ user }))
        // Volver a la página solicitada (ej. booking). Full reload para que el servidor vea la sesión.
        const isInternalRedirect = redirectTo?.startsWith('/') && !redirectTo.startsWith('//')
        const targetPath = isInternalRedirect ? redirectTo : getLocalizedUrl('/courts', locale)
        window.location.href = targetPath
      } else {
        setErrorMessage(res?.error || t.errorUnknown || 'Error desconocido')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage(t.errorServer || 'Error del servidor. Intenta de nuevo.')
    } finally {
      setLoading(false)
      isSubmitting.current = false
    }
  }

  // Forgot password handler
  const handleForgotPassword = () => {
    router.push(getLocalizedUrl('/recovery-password', locale))
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.02em',
            mb: 1
          }}
        >
          {t.title || 'Bienvenido de nuevo'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t.subtitle || 'Ingresa tus datos para acceder a tu cuenta.'}
        </Typography>
      </Box>

      {/* Error Alert */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Email Field */}
        <Box sx={{ mb: 3 }}>
          <Controller
            name="email"
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
                type="email"
                label={t.emailLabel || 'Correo electrónico'}
                placeholder={t.emailPlaceholder || 'ejemplo@correo.com'}
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <i className="ri-mail-line" style={{ color: 'var(--mui-palette-text-secondary)' }} />
                    </InputAdornment>
                  )
                }}
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
        <Box sx={{ mb: 1 }}>
          <Controller
            name="password"
            control={control}
            rules={{
              required: t.errorPasswordRequired || 'La contraseña es requerida'
            }}
            render={({ field }) => (
              <PasswordField
                {...field}
                label={t.passwordLabel || 'Contraseña'}
                placeholder="••••••••"
                error={errors.password?.message}
              />
            )}
          />
        </Box>

        {/* Forgot Password Link */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Typography
            component="span"
            variant="body2"
            sx={{
              color: 'text.secondary',
              cursor: 'pointer',
              textDecoration: 'underline',
              '&:hover': { color: 'primary.main' }
            }}
            onClick={handleForgotPassword}
          >
            {t.forgotPassword || '¿Olvidaste tu contraseña?'}
          </Typography>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            height: 48,
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
            <CircularProgress size={24} color="inherit" />
          ) : (
            <>
              {t.submit || 'Iniciar Sesión'}
              <i className="ri-arrow-right-line" style={{ marginLeft: 8 }} />
            </>
          )}
        </Button>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 4 }}>
        <Typography variant="body2" color="text.secondary">
          {t.divider || 'O continúa con'}
        </Typography>
      </Divider>

      {/* Social Login */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4 }}>
        <SocialLoginButton provider="google" fullWidth />
        <SocialLoginButton provider="facebook" fullWidth />
      </Box>

      {/* Register Link */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1">
          {t.noAccount || '¿No tienes una cuenta?'}{' '}
          <Link
            href={getLocalizedUrl('/register', locale)}
            style={{
              fontWeight: 700,
              textDecoration: 'underline',
              textDecorationColor: 'var(--mui-palette-primary-main)',
              textUnderlineOffset: '4px'
            }}
          >
            {t.register || 'Registrarse'}
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default memo(LoginForm)
