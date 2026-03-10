'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

// Component Imports
import Link from '@components/Link'

/**
 * ProfileSettingItem - Item de configuración para secciones de perfil
 *
 * @param {string} icon - Nombre del icono (remix icons: ri-calendar-line)
 * @param {string} label - Texto del item
 * @param {string} href - URL destino (opcional)
 * @param {function} onClick - Handler click (opcional)
 * @param {string} badge - Texto del badge (opcional, ej: "Activo")
 * @param {string} sublabel - Texto secundario (opcional, ej: "Visa •••• 4242")
 * @param {boolean} isPrimary - Si el icono usa color primario
 * @param {boolean} showChevron - Mostrar flecha derecha
 */
const ProfileSettingItem = ({
  icon,
  label,
  href,
  onClick,
  badge,
  sublabel,
  isPrimary = false,
  showChevron = true,
  isLast = false
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        cursor: href || onClick ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
        '&:hover': {
          bgcolor: href || onClick ? 'action.hover' : 'transparent'
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Icon Container */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isPrimary ? 'primary.lighter' : 'action.hover',
            color: isPrimary ? 'primary.main' : 'text.primary'
          }}
        >
          <i className={icon} style={{ fontSize: '1.25rem' }} />
        </Box>

        {/* Label */}
        <Typography variant='body1' fontWeight={600}>
          {label}
        </Typography>
      </Box>

      {/* Right Side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Badge */}
        {badge && (
          <Chip
            label={badge}
            size='small'
            sx={{
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.75rem',
              height: 24
            }}
          />
        )}

        {/* Sublabel */}
        {sublabel && (
          <Typography variant='body2' color='text.secondary'>
            {sublabel}
          </Typography>
        )}

        {/* Chevron */}
        {showChevron && (
          <i
            className='ri-arrow-right-s-line'
            style={{ fontSize: '1.25rem', color: 'var(--mui-palette-text-secondary)' }}
          />
        )}
      </Box>
    </Box>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {content}
      </Link>
    )
  }

  return content
}

export default memo(ProfileSettingItem)
