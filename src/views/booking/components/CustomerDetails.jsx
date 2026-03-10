import { Box, Typography, Avatar, Link } from '@mui/material'

const CustomerDetails = ({ customer, dictionary }) => {
  const getInitials = name => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Box sx={{ mt: 3, p: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
      <Typography variant='subtitle2' fontWeight={600} gutterBottom>
        {dictionary?.booking?.customer?.title || 'Datos del cliente'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 48,
            height: 48,
            fontWeight: 600
          }}
        >
          {getInitials(customer.customerName)}
        </Avatar>

        <Box>
          <Typography variant='body1' fontWeight={600}>
            {customer.customerName}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {customer.customerEmail}
          </Typography>
        </Box>
      </Box>

      <Link
        href='/booking/details'
        underline='hover'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          mt: 2,
          fontSize: '0.875rem',
          fontWeight: 500
        }}
      >
        <i className='ri-arrow-left-line' />
        {dictionary?.booking?.customer?.backLink || 'Volver a detalles'}
      </Link>
    </Box>
  )
}

export default CustomerDetails
