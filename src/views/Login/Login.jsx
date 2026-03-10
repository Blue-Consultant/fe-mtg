'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// Redux Imports
import { useDispatch } from 'react-redux'

import {
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Grid,
  Checkbox,
  Button,
  FormControlLabel,
  CircularProgress,
  Chip
} from '@mui/material'

import { signIn } from 'next-auth/react'

import { useForm, Controller } from 'react-hook-form'

import classnames from 'classnames'

import { Swiper, SwiperSlide } from 'swiper/react'

import { Autoplay, Pagination, EffectCoverflow, EffectFade } from 'swiper/modules'

import { persistor } from '@/redux-store'

// MUI Imports

// Third-party Imports

import { LoginUser } from './ApiLogin'
import { setUser } from '@/redux-store/slices/login'
import VerifyAccount from '../Register/VerifyAccount'
import { notificationErrorMessage } from '@/components/ToastNotification'

// import { startSession } from '@/views/analytics/api'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Swiper Imports
import 'swiper/css'
import 'swiper/css/effect-fade'

const Login = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [postErrorMessage, setPostErrorMessage] = useState('')
  const [emailUserVerify, setUserEmailVerify] = useState(null)
  const [showRegisterVerify, setToggleRegisterVerify] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [mailMessage, setMailMessage] = useState('')

  // Refs
  const isSubmitting = useRef(false)

  // Hooks
  const dispatch = useDispatch()
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()

  // Verificar si hay mensaje de sesión expirada
  useEffect(() => {
    const sessionExpiredMessage = sessionStorage.getItem('sessionExpiredMessage')

    if (sessionExpiredMessage) {
      setPostErrorMessage(sessionExpiredMessage)
      sessionStorage.removeItem('sessionExpiredMessage')

      // Limpiar el mensaje después de 10 segundos
      const timer = setTimeout(() => {
        setPostErrorMessage('')
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [])

  const {
    control,
    reset,
    setError,
    getValues,
    setValue,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  useEffect(() => {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim()

      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    persistor.purge()
    localStorage.clear()
  }, [])

  /*_____________________________________
  │   *        VERIFY EMAIL            │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }

  /*_____________________________________
  │   * METHOD SHOW VERIFY COMPONENT     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleVerifyComp = flag => {
    setToggleRegisterVerify(flag)
    setMailMessage('.')
  }

  /*_______________________________
  │   * METHOD OPEN PASS FORGOT    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleforgotPassword = async () => {
    const emailExist = getValues('email')

    setUserEmailVerify(emailExist)

    if (!isValidEmail(emailExist)) {
      setError('email', { type: 'manual', message: 'Este campo es requerido.' })

      return
    }

    setToggleRegisterVerify(true)
    setIsForgotPassword(true)
    setMailMessage('Mensaje de confirmación.')
  }

  /*______________________________
  │   * METHOD SHOW PASSSWORD     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleClickShowPassword = async () => setIsPasswordShown(show => !show)

  /*_______________________________
  │   * METHOD FORM SIGNUP OPEN    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const singIn = async params => {
    if (isSubmitting.current) return

    isSubmitting.current = true
    setLoading(true)

    try {
      const { msg, user, permissions, roles } = await LoginUser(params)

      if (!user) {
        setPostErrorMessage(msg)

        return
      }

      if (user.status === false) {
        setPostErrorMessage(msg)
        setUserEmailVerify(user.email)

        return
      }

      // Guardar permisos y roles en localStorage (datos no sensibles)
      if (permissions) {
        localStorage.setItem('userPermissions', JSON.stringify(permissions))
      }

      if (roles) {
        localStorage.setItem('userRoles', JSON.stringify(roles))
      }

      // El token ya está en cookies httpOnly enviadas por el servidor
      const res = await signIn('credentials', {
        id: user.id,
        name: user.first_name,
        email: user.email,
        image: null,
        redirect: false
      })

      if (res?.ok && !res.error) {
        dispatch(setUser({ user }))

        // const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : ''
        // startSession({
        //   userId: user.id,
        //   userAgent
        // }).catch (err =>
        //   console.warn('[Analytics] Error al iniciar sesión de analytics:', err)
        // )

        router.replace(getLocalizedUrl('/home', locale))

        // router.refresh()
      } else {
        notificationErrorMessage(res.error || 'Unknown error occurred.')
      }
    } catch (error) {
      console.log('ERROR en el proceso:', error.message)
    } finally {
      setLoading(false)
      isSubmitting.current = false
    }
  }

  return (
    <>
      <div className='flex bs-full justify-center'>
        <div
          className={classnames(
            'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative max-md:hidden',
            {
              'border-ie': settings.skin === 'bordered'
            }
          )}
        >
          {/* AQUI DISEÑO NOVEDOSO */}
          <div className='login-swiper w-full h-full relative overflow-hidden'>
            <div className='absolute top-8 left-8 z-10'>
              <div className='flex flex-col items-start'>
                <div className='flex items-center gap-3'>
                  <Typography
                    variant='h3'
                    className='font-bold'
                    sx={{
                      color: '#b8b8b8',
                      fontWeight: 900,
                      fontSize: '4.5rem',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    MTG
                  </Typography>
                  <div className='relative'>
                    <div className='flex items-center justify-center mr-[-10px]'>
                      <Logo />
                    </div>
                    <Typography
                      variant='h6'
                      sx={{
                        color: '#acacac',
                        fontWeight: 500,
                        fontSize: '1rem',
                        letterSpacing: '0.02em',
                        textAlign: 'center',
                        marginTop: '1px'
                      }}
                    >
                      Institute
                    </Typography>
                  </div>
                </div>

                <div className='w-full h-0.5 bg-gradient-to-r from-orange-600 via-orange-500 to-transparent rounded-full mt-1'></div>

                <Typography
                  variant='body2'
                  sx={{
                    color: '#b6b6b6',
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    marginTop: '0.25rem',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  International Bilingual Certificatión
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#cacaca',
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    textAlign: 'center',
                    width: '100%'
                  }}
                >
                  Institute
                </Typography>
              </div>
            </div>

            {/* FONDO FIJO con CSS - NO SE MUEVE */}
            <div
              className='absolute inset-0 bg-cover bg-center'
              style={{
                backgroundImage: 'url(/images/illustrations/mtgworld.jpg)',
                filter: 'blur(2px)'
              }}
            />

            {/* Overlay gradiente sobre la imagen */}
            <div className='absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-primary/45' />

            {/* TEXTOS con Swiper - SOLO ESTO SE MUEVE */}
            <div className='absolute inset-0 z-10 flex items-center justify-center'>
              <Swiper
                spaceBetween={30}
                slidesPerView={1}
                effect='fade'
                fadeEffect={{ crossFade: true }}
                modules={[Autoplay, Pagination, EffectFade]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop
                style={{ width: '100%', height: '100%' }}
              >
                <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className='text-center text-white max-w-3xl px-8'>
                    <div className='mb-8 flex justify-center'>
                      <div className='w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20'>
                        <i className='ri-team-line text-4xl text-white/90'></i>
                      </div>
                    </div>
                    <h2 className='text-5xl font-bold mb-6' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                      Equipo de Profesores
                    </h2>
                    <p className='text-xl opacity-95' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                      Docentes especializados en enseñanza de inglés con metodologías innovadoras y enfoque
                      personalizado
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className='text-center text-white max-w-3xl px-8'>
                    <div className='mb-8 flex justify-center'>
                      <div className='w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20'>
                        <i className='ri-article-line text-4xl text-white/90'></i>
                      </div>
                    </div>
                    <h2 className='text-5xl font-bold mb-6' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                      Sesiones Interactivas
                    </h2>
                    <p className='text-xl opacity-95' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                      Metodología personalizada que se adapta a tu ritmo de aprendizaje con tecnología avanzada
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className='text-center text-white max-w-3xl px-8'>
                    <div className='mb-8 flex justify-center'>
                      <div className='w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20'>
                        <i className='ri-calendar-line text-4xl text-white/90'></i>
                      </div>
                    </div>
                    <h2 className='text-5xl font-bold mb-6' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                      Coordinación Estratégica
                    </h2>
                    <p className='text-xl opacity-95' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                      Planificación cuidadosa para garantizar tu progreso continuo y resultados excepcionales
                    </p>
                  </div>
                </SwiperSlide>

                <SwiperSlide style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className='text-center text-white max-w-3xl px-8'>
                    <div className='mb-8 flex justify-center'>
                      <div className='w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20'>
                        <i className='ri-user-star-line text-4xl text-white/90'></i>
                      </div>
                    </div>
                    <h2 className='text-5xl font-bold mb-6' style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                      Equipo Completo
                    </h2>
                    <p className='text-xl opacity-95' style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                      Profesionales comprometidos con tu éxito en el aprendizaje del inglés y tu desarrollo integral
                    </p>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
        <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
          {!showRegisterVerify ? (
            <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
              <div className='text-center'>
                <div className='flex items-center justify-center gap-3 mb-3'>
                  <div className='w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md'>
                    <Logo />
                  </div>
                  <Typography
                    variant='h3'
                    className='font-bold text-primary'
                    sx={{
                      fontWeight: 700,
                      letterSpacing: '-0.02em'
                    }}
                  >
                    <span style={{ color: '#3773dd' }}>Bienvenido a </span>
                    MTG
                  </Typography>
                </div>

                {/* Descripción de bienvenida con icono */}
                <div className='flex items-center justify-center gap-2'>
                  <Typography
                    variant='body1'
                    className='text-muted-foreground'
                    sx={{
                      opacity: 0.7,
                      maxWidth: '320px'
                    }}
                  >
                    Inicia sesión en tu cuenta para acceder a todas las funcionalidades
                  </Typography>
                </div>
              </div>

              <form onSubmit={handleSubmit(singIn)} className='flex flex-col gap-5'>
                <Grid container spacing={5}>
                  <Grid item xs={12}>
                    <Controller
                      name='email'
                      control={control}
                      rules={{
                        required: 'Este campo es requerido.',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Por favor ingresa un correo electrónico válido.'
                        }
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type='email'
                          label='Correo Electrónico'
                          placeholder='johndoe@gmail.com'
                          error={!!errors.email}
                          helperText={errors.email?.message}

                          // {...(errors.email && { error: true, helperText: 'This field is required.' })}
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
                          label='Contraseña'
                          id='outlined-password'
                          placeholder='············'
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
                          {...(errors.password && { error: true, helperText: 'Este campo es requerido' })}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography component='div' className='text-center mt-0' color='error'>
                      {postErrorMessage != '' ? (
                        !emailUserVerify ? (
                          <Chip label={postErrorMessage} color='error' variant='tonal' />
                        ) : (
                          <Typography
                            component={Link}
                            color='error'
                            onClick={() => {
                              handleVerifyComp(true)
                            }}
                          >
                            {postErrorMessage}
                          </Typography>
                        )
                      ) : (
                        ''
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
                      <FormControlLabel control={<Checkbox />} label='Recordarme' />
                      <Typography className='text-end' color='primary' component={Link} onClick={handleforgotPassword}>
                        ¿Olvidaste tu contraseña?
                      </Typography>
                    </div>
                  </Grid>

                  <Grid item xs={12} className='flex gap-4'>
                    <Button fullWidth variant='contained' type='submit' className='gap-2' disabled={loading}>
                      {loading ? (
                        <>
                          <CircularProgress size={20} color='inherit' />
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </Button>
                  </Grid>
                </Grid>
                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>¿Nuevo en nuestra plataforma?</Typography>
                  <Typography component={Link} href={getLocalizedUrl('/register', locale)} color='primary'>
                    Crear una cuenta
                  </Typography>
                </div>
              </form>
            </div>
          ) : (
            <VerifyAccount isForgotPassword={isForgotPassword} userdata={emailUserVerify} mailMessage={mailMessage} />
          )}
        </div>
      </div>
    </>
  )
}

export default Login
