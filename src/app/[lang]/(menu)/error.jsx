'use client'

import { useEffect } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export default function MenuSegmentError({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: 2,
        px: 2,
        py: 4
      }}
    >
      <Typography variant='h6' component='h1'>
        Algo salió mal
      </Typography>
      <Typography variant='body2' color='text.secondary' textAlign='center' sx={{ maxWidth: 420 }}>
        No pudimos cargar esta sección. Puedes reintentar o usar el menú para ir a otra página.
      </Typography>
      <Button variant='contained' onClick={() => reset()}>
        Reintentar
      </Button>
    </Box>
  )
}
