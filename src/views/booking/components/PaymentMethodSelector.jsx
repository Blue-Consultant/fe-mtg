import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Box, Typography } from '@mui/material'

const PaymentMethodSelector = ({ paymentMethod, onChange, dictionary }) => {
  const paymentMethods = [
    {
      value: 'credit',
      label: dictionary?.booking?.payment?.methods?.credit || 'Tarjeta de crédito/débito',
      icon: 'ri-bank-card-line'
    },
    {
      value: 'yape',
      label: dictionary?.booking?.payment?.methods?.yape || 'Yape / Plin',
      icon: 'ri-smartphone-line'
    },
    {
      value: 'cash',
      label: dictionary?.booking?.payment?.methods?.cash || 'Efectivo en el lugar',
      icon: 'ri-money-dollar-circle-line'
    }
  ]

  return (
    <FormControl component='fieldset' fullWidth>
      <FormLabel
        component='legend'
        sx={{
          fontWeight: 600,
          mb: 2,
          color: 'text.primary'
        }}
      >
        {dictionary?.booking?.payment?.methodTitle || 'Método de pago'}
      </FormLabel>
      <RadioGroup value={paymentMethod} onChange={onChange}>
        {paymentMethods.map(method => (
          <FormControlLabel
            key={method.value}
            value={method.value}
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className={method.icon} style={{ fontSize: '1.25rem' }} />
                <Typography variant='body2'>{method.label}</Typography>
              </Box>
            }
            sx={{
              mb: 1.5,
              p: 1.5,
              border: '1px solid',
              borderColor: paymentMethod === method.value ? 'primary.main' : 'divider',
              borderRadius: 1,
              bgcolor: paymentMethod === method.value ? 'action.hover' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

export default PaymentMethodSelector
