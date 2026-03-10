import { Box, Typography } from '@mui/material'

const BookingHeader = ({ dictionary }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant='h4' component='h1' fontWeight={600} gutterBottom>
        {dictionary?.booking?.header?.title || 'Confirma tu reserva'}
      </Typography>
      <Typography variant='body1' color='text.secondary'>
        {dictionary?.booking?.header?.subtitle || 'Revisa los detalles de tu reserva antes de confirmar el pago'}
      </Typography>
    </Box>
  )
}

export default BookingHeader
