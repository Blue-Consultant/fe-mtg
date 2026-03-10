import { Box, Button, Typography } from '@mui/material'

const PaymentActionButton = ({ onConfirm, dictionary }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Button
        variant='contained'
        color='primary'
        fullWidth
        size='large'
        onClick={onConfirm}
        endIcon={<i className='ri-arrow-right-line' />}
        sx={{
          py: 1.5,
          fontWeight: 600,
          fontSize: '1rem'
        }}
      >
        {dictionary?.booking?.payment?.confirmButton || 'Pagar ahora'}
      </Button>

      <Typography
        variant='caption'
        color='text.secondary'
        sx={{
          display: 'block',
          mt: 2,
          textAlign: 'center',
          fontSize: '0.75rem'
        }}
      >
        {dictionary?.booking?.payment?.termsText || 'Al confirmar, aceptas nuestros términos y condiciones de servicio'}
      </Typography>
    </Box>
  )
}

export default PaymentActionButton
