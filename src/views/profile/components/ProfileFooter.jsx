'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// Component Imports
import Link from '@components/Link'

/**
 * ProfileFooter - Footer del perfil con logout y links
 */
const ProfileFooter = ({ 
  onLogout,
  appVersion = 'v2.4.0',
  dictionary = {}
}) => {
  const t = dictionary?.profile || {}

  return (
    <Box sx={{ pt: 2 }}>
      {/* Logout Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={onLogout}
        startIcon={<i className="ri-logout-box-r-line" />}
        sx={{
          height: 56,
          borderRadius: 4,
          fontWeight: 700,
          fontSize: '1.125rem',
          textTransform: 'none',
          boxShadow: '0 4px 16px rgba(19, 236, 91, 0.15)'
        }}
      >
        {t.logout || 'Cerrar Sesión'}
      </Button>

      {/* App Info */}
      <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
        <Typography variant="caption">
          SportReserve {appVersion} • {new Date().getFullYear()}
        </Typography>
        
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Link
            href="#"
            style={{
              fontSize: '0.75rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            {t.terms || 'Términos'}
          </Link>
          <Link
            href="#"
            style={{
              fontSize: '0.75rem',
              color: 'inherit',
              textDecoration: 'none'
            }}
          >
            {t.privacy || 'Privacidad'}
          </Link>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(ProfileFooter)
