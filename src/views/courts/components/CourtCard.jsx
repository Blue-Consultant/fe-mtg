import { Box, Card, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material'

import TimeSlotButton from './TimeSlotButton'

const CourtCard = ({ court, selectedCourt, selectedTimeSlot, onTimeSlotSelect }) => {
  const isSlotSelected = slot => {
    return selectedCourt?.id === court.id && selectedTimeSlot && selectedTimeSlot.time === slot.time
  }

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        borderRadius: 4,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 3
        }
      }}
    >
      <Box
        sx={{ position: 'relative', width: { xs: '100%', md: 256 }, height: { xs: 192, md: 'auto' }, flexShrink: 0 }}
      >
        <CardMedia
          component='img'
          image={court.imageUrl}
          alt={court.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {court.isPopular && (
          <Chip
            label='Popular'
            size='small'
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>
              {court.name}
            </Typography>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ color: 'text.secondary', fontSize: '0.875rem' }}
            >
              <i className='ri-plant-line' style={{ fontSize: '1rem' }} />
              <Typography variant='body2' color='text.secondary'>
                {court.surfaceType} • {court.capacity}
              </Typography>
            </Stack>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              S/ {court.pricePerHour.toFixed(2)}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              por hora
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1.5 }}>
            <i className='ri-time-line' style={{ fontSize: '1.125rem', color: 'var(--mui-palette-primary-main)' }} />
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              Horarios disponibles
            </Typography>
          </Stack>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {court.availableSlots.map((slot, index) => (
              <TimeSlotButton
                key={index}
                slot={slot}
                courtId={court.id}
                isSelected={isSlotSelected(slot)}
                onSelect={onTimeSlotSelect}
              />
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CourtCard
