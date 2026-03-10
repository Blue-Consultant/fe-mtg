'use client'

// React Imports
import { memo } from 'react'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import Link from '@components/Link'

// Utils
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * NavigationHeader - Header de navegación para register
 */
const NavigationHeader = ({ dictionary = {} }) => {
  const { lang: locale } = useParams()
  const t = dictionary?.registerMtg || {}

  return (
    <Box
      component='header'
      sx={{
        width: '100%',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 20,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          px: { xs: 3, lg: 5 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <i className='ri-ping-pong-line' style={{ fontSize: '1.75rem' }} />
          </Box>
          <Typography variant='h6' fontWeight={700} letterSpacing='-0.015em'>
            ReservaCancha
          </Typography>
        </Box>

        {/* Right Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            variant='body2'
            color='text.secondary'
            fontWeight={500}
            sx={{ display: { xs: 'none', sm: 'inline-block' } }}
          >
            {t.hasAccountHeader || '¿Ya tienes cuenta?'}
          </Typography>
          <Button
            component={Link}
            href={getLocalizedUrl('/login-mtg', locale)}
            variant='outlined'
            sx={{
              borderRadius: 3,
              height: 40,
              px: 3,
              fontWeight: 700,
              textTransform: 'none'
            }}
          >
            {t.loginButton || 'Iniciar Sesión'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(NavigationHeader)
