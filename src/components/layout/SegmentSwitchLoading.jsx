'use client'

import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import CircularProgress from '@mui/material/CircularProgress'

/**
 * Fallback del slot de contenido bajo el header (misma shell): navegación cliente, AuthGuard async, páginas RSC.
 * minHeight evita “pantalla en blanco” perceptiva.
 */
export function MenuShellLoading() {
  return (
    <Box sx={{ py: 4, px: 2, width: '100%', minHeight: { xs: '50vh', md: 'min(560px, 60vh)' } }}>
      <Skeleton variant='text' width={280} height={40} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant='rectangular' width={280} height={280} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Box>
  )
}

export function BlankShellLoading() {
  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 2
      }}
    >
      <CircularProgress size={40} thickness={4} />
      <Skeleton variant='rounded' width='min(100%, 720px)' height={48} sx={{ borderRadius: 1 }} />
      <Skeleton variant='rounded' width='min(100%, 900px)' height={320} sx={{ borderRadius: 2 }} />
    </Box>
  )
}
