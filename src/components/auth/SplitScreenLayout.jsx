'use client'

// React Imports
import { memo } from 'react'

// MUI Imports
import Box from '@mui/material/Box'

// Util Imports
import { commonLayoutClasses } from '@layouts/utils/layoutClasses'

/**
 * SplitScreenLayout - Layout de dos columnas para páginas de auth (login, register)
 * Oculta el panel izquierdo en móvil y muestra solo el formulario
 *
 * @param {React.ReactNode} heroContent - Contenido del panel izquierdo (imagen, testimonios)
 * @param {React.ReactNode} formContent - Contenido del formulario (lado derecho)
 * @param {string} heroPosition - Posición del hero: 'left' | 'right' (default: 'left')
 */
const SplitScreenLayout = ({ heroContent, formContent, heroPosition = 'left' }) => {
  const heroPanel = (
    <Box
      sx={{
        display: { xs: 'none', lg: 'flex' },
        width: { lg: '50%' },
        flex: { xs: '0 0 0', lg: '0 0 50%' },
        maxWidth: { lg: '50%' },
        minWidth: 0,
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
        flex: { xs: '1 1 auto', lg: '0 0 50%' },
        maxWidth: { xs: '100%', lg: '50%' },
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 3, sm: 6, xl: 12 },
        position: 'relative',
        minHeight: 0,
        boxSizing: 'border-box'
      }}
    >
      {formContent}
    </Box>
  )

  return (
    <Box
      className={commonLayoutClasses.contentFullBleedRoot}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        flex: '1 1 0%',
        minHeight: 0,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        position: 'relative',
        boxSizing: 'border-box'
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
