import { Card, CardMedia, CardContent, Box, Typography, Chip, Rating } from '@mui/material'

const CourtSummaryCard = ({ court, booking }) => {
  return (
    <Card>
      <Box sx={{ position: 'relative', height: 240, overflow: 'hidden' }}>
        <CardMedia
          component='img'
          image={court.imageUrl}
          alt={court.name}
          sx={{
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Chip
          icon={<i className='ri-star-fill' style={{ fontSize: '1rem' }} />}
          label={`${court.rating} (${court.reviewCount})`}
          size='small'
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            fontWeight: 600
          }}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        <Typography variant='h6' fontWeight={600} gutterBottom>
          {court.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <i className='ri-map-pin-line' style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }} />
          <Typography variant='body2' color='text.secondary'>
            {court.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <i className='ri-calendar-line' style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }} />
          <Typography variant='body2' color='text.secondary'>
            {booking.date}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-time-line' style={{ fontSize: '1.1rem', color: 'var(--mui-palette-text-secondary)' }} />
          <Typography variant='body2' color='text.secondary'>
            {booking.timeSlot}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default CourtSummaryCard
