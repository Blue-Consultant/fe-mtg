import { Box, Typography } from '@mui/material'

const SecurityBadge = ({ dictionary }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        mt: 3,
        p: 2,
        bgcolor: 'action.hover',
        borderRadius: 1
      }}
    >
      <i className='ri-shield-check-line' style={{ fontSize: '1.25rem', color: 'var(--mui-palette-success-main)' }} />
      <Typography variant='caption' color='text.secondary'>
        {dictionary?.booking?.payment?.securityText || 'Pago seguro con encriptación SSL'}
      </Typography>
    </Box>
  )
}

export default SecurityBadge
