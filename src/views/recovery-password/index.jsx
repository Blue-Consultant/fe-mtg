'use client'

// React Imports
import { memo, useMemo, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import Link from '@components/Link'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * RecoveryPasswordView - Vista de recuperación de contraseña
 * Formulario simple centrado con campo de email
 */
const RecoveryPasswordView = ({ dictionary = {}, lang }) => {
  const memoizedDictionary = useMemo(() => dictionary || {}, [JSON.stringify(dictionary)])
  const t = memoizedDictionary?.recoveryPassword || {}

  // States
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: ''
    }
  })

  // Submit handler
  const onSubmit = async data => {
    setLoading(true)
    setErrorMessage('')

    try {
      // TODO: Integrate with actual password recovery API
      // const response = await sendRecoveryEmail(data.email)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccessMessage(
        t.successMessage || 'Te hemos enviado un correo con instrucciones para restablecer tu contraseña.'
      )
      setEmailSent(true)
    } catch (error) {
      console.error('Recovery error:', error)
      setErrorMessage(t.errorServer || 'Error al enviar el correo. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      {/* Logo */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <i className='ri-football-line' style={{ fontSize: '2rem', color: 'var(--mui-palette-primary-main)' }} />
        <Typography variant='h5' fontWeight={700}>
          SportReserva
        </Typography>
      </Box>

      {/* Card */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Icon */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i
              className={emailSent ? 'ri-mail-check-line' : 'ri-lock-unlock-line'}
              style={{ fontSize: '1.75rem', color: 'var(--mui-palette-primary-main)' }}
            />
          </Box>
        </Box>

        {/* Header */}
        <Typography variant='h4' fontWeight={800} textAlign='center' sx={{ mb: 1 }}>
          {emailSent ? t.titleSent || '¡Correo enviado!' : t.title || 'Recupera tu contraseña'}
        </Typography>
        <Typography variant='body1' color='text.secondary' textAlign='center' sx={{ mb: 4 }}>
          {emailSent
            ? t.subtitleSent || 'Revisa tu bandeja de entrada y sigue las instrucciones.'
            : t.subtitle || 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.'}
        </Typography>

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

        {/* Form - Only show if email not sent */}
        {!emailSent && (
          <Box component='form' onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
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
                    placeholder={t.emailPlaceholder || 'ejemplo@correo.com'}
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

            {/* Submit Button */}
            <Button
              type='submit'
              variant='contained'
              fullWidth
              disabled={loading}
              sx={{
                height: 48,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(19, 236, 91, 0.2)'
              }}
            >
              {loading ? (
                <CircularProgress size={24} color='inherit' />
              ) : (
                <>{t.submit || 'Enviar correo de recuperación'}</>
              )}
            </Button>
          </Box>
        )}

        {/* Back to Login Button - Show after email sent */}
        {emailSent && (
          <Button
            component={Link}
            href={getLocalizedUrl('/login-mtg', locale)}
            variant='contained'
            fullWidth
            sx={{
              height: 48,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none'
            }}
          >
            {t.backToLogin || 'Volver a Iniciar Sesión'}
          </Button>
        )}

        {/* Back to Login Link */}
        {!emailSent && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Link
              href={getLocalizedUrl('/login-mtg', locale)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--mui-palette-text-secondary)',
                textDecoration: 'none'
              }}
            >
              <i className='ri-arrow-left-line' />
              <Typography variant='body2' component='span'>
                {t.backLink || 'Volver a Iniciar Sesión'}
              </Typography>
            </Link>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default memo(RecoveryPasswordView)
