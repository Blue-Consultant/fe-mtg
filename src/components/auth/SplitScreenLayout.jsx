'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

/**
 * SplitScreenLayout - Layout de dos columnas para páginas de auth (login, register)
 * Oculta el panel izquierdo en móvil y muestra solo el formulario
 *
 * @param {React.ReactNode} heroContent - Contenido del panel izquierdo (imagen, testimonios)
 * @param {React.ReactNode} formContent - Contenido del formulario (lado derecho)
 * @param {string} heroPosition - Posición del hero: 'left' | 'right' (default: 'left')
 */
const SplitScreenLayout = ({ heroContent, formContent, heroPosition = 'left' }) => {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const heroPanel = (
    <Box
      sx={{
        display: { xs: 'none', lg: 'flex' },
        width: '50%',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--mui-palette-background-dark, #102216)'
      }}
    >
      {heroContent}
    </Box>
  )

  const formPanel = (
    <Box
      sx={{
        width: { xs: '100%', lg: '50%' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 6, xl: 12 },
        position: 'relative',
        minHeight: '100dvh'
      }}
    >
      {formContent}
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        position: 'relative'
      }}
    >
      {heroPosition === 'left' ? (
        <>
          {heroPanel}
          {formPanel}
        </>
      ) : (
        <>
          {formPanel}
          {heroPanel}
        </>
      )}
    </Box>
  )
}

export default memo(SplitScreenLayout)
