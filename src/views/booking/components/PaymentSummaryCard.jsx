import { Card, CardContent, Box, Typography, Divider } from '@mui/material'
import PaymentMethodSelector from './PaymentMethodSelector'

const PaymentSummaryCard = ({ payment, paymentMethod, onPaymentMethodChange, dictionary }) => {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant='h6' fontWeight={600} gutterBottom>
          {dictionary?.booking?.payment?.title || 'Resumen de pago'}
        </Typography>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              {dictionary?.booking?.payment?.hourlyRate || 'Tarifa por hora'}
            </Typography>
            <Typography variant='body2' fontWeight={500}>
              {payment.currency}
              {payment.hourlyRate.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              {dictionary?.booking?.payment?.serviceFee || 'Tarifa de servicio'}
            </Typography>
            <Typography variant='body2' fontWeight={500}>
              {payment.currency}
              {payment.serviceFee.toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant='h6' fontWeight={700}>
              {dictionary?.booking?.payment?.total || 'Total'}
            </Typography>
            <Typography variant='h6' fontWeight={700} color='primary'>
              {payment.currency}
              {payment.total.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <PaymentMethodSelector paymentMethod={paymentMethod} onChange={onPaymentMethodChange} dictionary={dictionary} />
      </CardContent>
    </Card>
  )
}

export default PaymentSummaryCard
