'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'

// Third-party Imports
import classnames from 'classnames'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import { getLocalizedUrl } from '@/utils/i18n'
import { singUpAddUser } from './ApiRegister'
import CreateUser from './components/CreateUser'

const RegisterV2 = ({ mode, dictionary }) => {
  const memoizedDictionary = useMemo(() => dictionary || {}, [JSON.stringify(dictionary)])
  const t = memoizedDictionary
  const reg = t.modules?.register || {}
  const f = reg.form?.fields || {}

  // States
  const [loading, setLoading] = useState(false)
  const [formErrors, setFormErrors] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [userRole, setUserRole] = useState(null)

  const { lang: locale } = useParams()
  const { settings } = useSettings()

  /*_____________________________
     │   * METHOD SUBMIT SING UP    │
     ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const addUserNew = async params => {
    setLoading(true)
    setFormErrors(null)

    try {
      // Preparar datos para el nuevo endpoint
      const formData = {
        email: params.email,
        password: params.password,
        first_name: params.first_name,
        last_name: params.last_name || '',
        phone_number: params.phone_number,
        dni: params.dni,
        user_type: params.user_type || 'client',

        // Campos opcionales
        birth_date: params.birth_date || '',
        address: params.address || '',
        city: params.city || '',
        state: params.state || '',
        country: params.country || '',
        zip_code: params.zip_code || '',
        gender: params.gender || ''
      }

      const response = await singUpAddUser(formData)

      // Si hay un error en la respuesta (status >= 400 o no hay data)
      if (response.status && response.status >= 400) {
        // Mostrar el mensaje de error
        setFormErrors({
          general: response.message || 'Error al registrar usuario',
          errors: response.errors || null
        })

        return
      }

      // Si el registro fue exitoso (response.data existe y no hay status de error)
      if (response.data && (!response.status || response.status < 400)) {
        setFormErrors(null)

        // Redirigir al login o mostrar mensaje de éxito
        setOutcome('USER_REGISTERED')

        // Opcional: redirigir al login después de 2 segundos
        setTimeout(() => {
          window.location.href = getLocalizedUrl('/login', locale)
        }, 2000)
      } else {
        // Si no hay data y no hay status de error, algo salió mal
        setFormErrors({
          general: response.message || 'Error al registrar usuario. Por favor intenta de nuevo.'
        })
      }
    } catch (error) {
      // Manejar errores inesperados
      setFormErrors({
        general: error.message || 'Error al registrar usuario. Por favor intenta de nuevo.'
      })
    } finally {
      setLoading(false)
    }
  }

  /*_____________________________________
  │   * METHOD HANDLE OUTCOME ACTION   │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleOutcomeAction = intent => {
    if (!intent || !intent.type) {
      setUserRole(null)
      setOutcome(null)

      return
    }

    setUserRole(intent.role ?? null)
    setOutcome(intent.type)
  }

  return (
    <div className='flex bs-full justify-center'>
      <div className='absolute top-7 left-32 z-10'>
        <div className='flex flex-col items-start'>
          <div className='flex items-center gap-3'>
            <Typography
              variant='h3'
              className='font-bold'
              sx={{
                color: '#3773dd',
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
              <div className='flex items-center justify-center'>
                <Logo />
              </div>
              <Typography
                variant='h6'
                sx={{
                  color: '#3773dd',
                  fontWeight: 500,
                  fontSize: '1rem',
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                  marginTop: '0rem'
                }}
              >
                Institute
              </Typography>
            </div>
          </div>

          <div className='w-full h-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-transparent rounded-full mt-1'></div>

          <Typography
            variant='body2'
            sx={{
              color: '#1d242c',
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
              color: '#2c3e50',
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

      <div>
        <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
          {outcome === 'USER_REGISTERED' ? (
            <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
              <Typography variant='h5' color='success.main' className='text-center'>
                ✅ Usuario registrado exitosamente
              </Typography>
              <Typography variant='body1' className='text-center'>
                Redirigiendo al login...
              </Typography>
            </div>
          ) : (
            <CreateUser
              addUserNew={addUserNew}
              locale={locale}
              userRole={userRole}
              handleOutcomeAction={handleOutcomeAction}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              memoizedDictionary={memoizedDictionary}
            />
          )}
        </div>
      </div>

      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='login-swiper w-full h-full relative overflow-hidden'>
          <div
            className='absolute inset-0 bg-cover bg-center'
            style={{
              backgroundImage: 'url(/images/illustrations/mtgworld.jpg)',
              filter: 'blur(2px)'
            }}
          />

          <div className='absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-primary/45' />

          <div className='absolute inset-0 z-10 flex items-center justify-center'>
            <Swiper
              spaceBetween={30}
              slidesPerView={1}
              effect='fade'
              fadeEffect={{ crossFade: true }}
              modules={[Autoplay, Pagination]}
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
                    Docentes especializados en enseñanza de inglés con metodologías innovadoras y enfoque personalizado
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
    </div>
  )
}

export default RegisterV2
