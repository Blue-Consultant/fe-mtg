import { Box, Typography } from '@mui/material'

const CourtsHeader = ({ dictionary }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.033em' }}>
        Selecciona tu cancha ideal
      </Typography>
      <Typography variant='body1' color='text.secondary'>
        Encuentra el espacio perfecto para tu próximo partido.
      </Typography>
    </Box>
  )
}

export default CourtsHeader
