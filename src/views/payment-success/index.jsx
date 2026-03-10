'use client'

// React Imports
import { memo, useMemo } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'

// Component Imports
import Link from '@components/Link'
import ReservationDetailsCard from './components/ReservationDetailsCard'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * PaymentSuccessView - Vista de confirmación de pago exitoso
 */
const PaymentSuccessView = ({ dictionary = {}, lang }) => {
  const memoizedDictionary = useMemo(() => dictionary || {}, [JSON.stringify(dictionary)])
  const t = memoizedDictionary?.paymentSuccess || {}

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()

  // Get reservation data from URL params or use defaults
  const reservationData = {
    courtImage: searchParams.get('courtImage') || undefined,
    courtName: searchParams.get('courtName') || 'Loza Deportiva Central',
    courtNumber: searchParams.get('courtNumber') || 'Cancha 1',
    location: searchParams.get('location') || 'Av. Principal 123',
    date: searchParams.get('date') || '12 Oct, 2023',
    time: searchParams.get('time') || '18:00 - 19:00',
    transactionId: searchParams.get('transactionId') || '#TRX-88592',
    total: searchParams.get('total') || '$45.00'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      {/* Header */}
      <Box
        component='header'
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          whiteSpace: 'nowrap',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 3, lg: 5 },
          py: 2
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: 'primary.lighter',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main'
            }}
          >
            <i className='ri-ping-pong-line' style={{ fontSize: '1.25rem' }} />
          </Box>
          <Typography variant='h6' fontWeight={700} letterSpacing='-0.015em'>
            ReservaDeportes
          </Typography>
        </Box>

        {/* User Avatar */}
        <Avatar
          src='https://lh3.googleusercontent.com/aida-public/AB6AXuDCSeRxVKmAgWQ5icHL87qf6z-ODn7xhm37cai6eE4_Pc0QN54T88VQqGNxs6mft7PSxT21G6HpdErHVs87ZwJ62vfZ8PxbxYPfL-tXqi2Z0kc16MW-vqfCG7RiIm0_-ls-J_ZMISPwvnnAwCRUh4dQF-cN-HxSpah-ZSSBqL-FBR199XJ_2V56bGD-dOCXgKj5cx67a-2O82qbXFY_kPcat82tNk8J3oQoutWrC0snC924k-CjSaNwqC30VvRSwuyrey1zC1RTI7kk'
          sx={{
            width: 40,
            height: 40,
            border: '2px solid',
            borderColor: 'primary.main'
          }}
        />
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 5,
          px: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Success Indicator */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Success Icon */}
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                p: 3,
                border: '1px solid',
                borderColor: 'primary.light'
              }}
            >
              <i
                className='ri-checkbox-circle-fill'
                style={{
                  fontSize: '3.5rem',
                  color: 'var(--mui-palette-primary-main)'
                }}
              />
            </Box>

            {/* Title */}
            <Typography variant='h3' fontWeight={700} sx={{ mb: 1, letterSpacing: '-0.02em' }}>
              {t.title || '¡Pago Exitoso!'}
            </Typography>

            {/* Subtitle */}
            <Typography variant='body1' color='text.secondary' sx={{ maxWidth: 360 }}>
              {t.subtitle || 'Tu reserva ha sido confirmada. Hemos enviado un recibo a tu correo electrónico.'}
            </Typography>
          </Box>

          {/* Reservation Details Card */}
          <ReservationDetailsCard {...reservationData} dictionary={memoizedDictionary} />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Primary Button */}
            <Button
              variant='contained'
              fullWidth
              startIcon={<i className='ri-file-list-3-line' />}
              sx={{
                height: 52,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none'
              }}
              onClick={() => router.push(getLocalizedUrl('/booking', locale))}
            >
              {t.viewDetails || 'Ver Detalles de Reserva'}
            </Button>

            {/* Secondary Button */}
            <Button
              variant='outlined'
              fullWidth
              sx={{
                height: 48,
                borderRadius: 3,
                fontWeight: 500,
                fontSize: '1rem',
                textTransform: 'none'
              }}
              onClick={() => router.push(getLocalizedUrl('/home', locale))}
            >
              {t.goHome || 'Volver al Inicio'}
            </Button>
          </Box>

          {/* Help Link */}
          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Link
              href='#'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--mui-palette-text-secondary)',
                textDecoration: 'none',
                fontSize: '0.875rem'
              }}
            >
              <i className='ri-question-line' style={{ fontSize: '1rem' }} />
              {t.helpLink || '¿Necesitas ayuda? Contáctanos'}
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(PaymentSuccessView)
