'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useTheme } from '@mui/material/styles'

const FEATURES_DATA = [
  {
    id: 1,
    icon: 'ri-flashlight-line',
    title: 'Confirmación Inmediata',
    description:
      'Olvídate de las llamadas y los mensajes sin responder. Tu reserva se confirma al instante en tu correo.',
    color: 'primary'
  },
  {
    id: 2,
    icon: 'ri-shield-check-line',
    title: 'Pagos 100% Seguros',
    description: 'Plataforma de pago encriptada. Paga con tarjeta o transferencia con total tranquilidad.',
    color: 'success'
  },
  {
    id: 3,
    icon: 'ri-verified-badge-line',
    title: 'Canchas Verificadas',
    description: 'Solo trabajamos con instalaciones de alta calidad que cumplen nuestros estándares deportivos.',
    color: 'info'
  }
]

const Features = memo(({ features = FEATURES_DATA }) => {
  const theme = useTheme()

  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 5, lg: 10 } }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 2,
            mb: 6
          }}
        >
          <Typography
            variant='h3'
            component='h2'
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.875rem', md: '2.25rem' },
              maxWidth: 600
            }}
          >
            ¿Por qué elegir Reserva Ya?
          </Typography>
          <Typography
            variant='body1'
            sx={{
              color: 'text.secondary',
              fontWeight: 500
            }}
          >
            La forma más inteligente de organizar tu partido.
          </Typography>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3}>
          {features.map(feature => (
            <Grid item xs={12} md={4} key={feature.id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mb: 2,
                      bgcolor: `${feature.color}.light`,
                      color: `${feature.color}.main`
                    }}
                  >
                    <i className={feature.icon} style={{ fontSize: '1.5rem' }} />
                  </Avatar>
                  <Typography variant='h6' component='h3' sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
})

Features.displayName = 'Features'

export default Features
