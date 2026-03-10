import { Button, Typography, useTheme } from '@mui/material'

const ConfirmButton = ({ isBookingComplete, onConfirm }) => {
  const theme = useTheme()

  // Guard against missing theme during initial hydration
  if (!theme?.palette?.primary) {
    return null
  }

  return (
    <>
      <Button
        variant='contained'
        color='primary'
        fullWidth
        size='large'
        disabled={!isBookingComplete}
        onClick={onConfirm}
        endIcon={<i className='ri-arrow-right-line' />}
        sx={{
          py: 1.75,
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: 3,
          boxShadow: 3,
          transition: 'all 0.2s',
          '&:active': {
            transform: 'scale(0.98)'
          }
        }}
      >
        Confirmar Reserva
      </Button>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
        Al reservar aceptas nuestros términos y condiciones.
      </Typography>
    </>
  )
}

export default ConfirmButton
