import { Box, Card, CardContent, Divider, Stack, Typography, Chip } from '@mui/material'
import ConfirmButton from './ConfirmButton'

const BookingSummary = ({ controller }) => {
  const { selectedCourt, selectedDate, selectedTimeSlot, totalPrice, isBookingComplete, handleConfirmBooking } =
    controller

  const formatDate = date => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' }
    const formatted = date.toLocaleDateString('es-ES', options)
    const isToday = date.toDateString() === new Date().toDateString()
    return isToday ? `Hoy, ${formatted.split(',')[1]}` : formatted
  }

  return (
    <Box sx={{ position: 'sticky', top: 96 }}>
      <Card
        sx={{
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          boxShadow: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 3 }}>
            <i
              className='ri-file-list-line'
              style={{ fontSize: '1.25rem', color: 'var(--mui-palette-primary-main)' }}
            />
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              Resumen de reserva
            </Typography>
          </Stack>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {/* Court Info */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'text.secondary'
                }}
              >
                <i className='ri-community-line' style={{ fontSize: '1.25rem' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500, textTransform: 'uppercase' }}
                >
                  Cancha
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {selectedCourt ? selectedCourt.name : 'No seleccionada'}
                </Typography>
                {selectedCourt && (
                  <Typography variant='caption' color='text.secondary'>
                    {selectedCourt.surfaceType}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Date Info */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'text.secondary'
                }}
              >
                <i className='ri-calendar-line' style={{ fontSize: '1.25rem' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500, textTransform: 'uppercase' }}
                >
                  Fecha
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {formatDate(selectedDate)}
                </Typography>
              </Box>
            </Box>

            {/* Time Slot Info */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'text.secondary'
                }}
              >
                <i className='ri-time-line' style={{ fontSize: '1.25rem' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 500, textTransform: 'uppercase' }}
                >
                  Horario
                </Typography>
                {selectedTimeSlot ? (
                  <Chip
                    label={`${selectedTimeSlot.time} - ${selectedTimeSlot.endTime}`}
                    size='small'
                    sx={{
                      mt: 0.5,
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                      fontWeight: 700,
                      border: 1,
                      borderColor: 'primary.main'
                    }}
                  />
                ) : (
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    No seleccionado
                  </Typography>
                )}
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3 }}>
            <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 500 }}>
              Total a pagar
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
              S/ {totalPrice.toFixed(2)}
            </Typography>
          </Box>

          <ConfirmButton isBookingComplete={isBookingComplete} onConfirm={handleConfirmBooking} />
        </CardContent>
      </Card>
    </Box>
  )
}

export default BookingSummary
