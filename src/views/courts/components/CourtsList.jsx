import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

import CourtCard from './CourtCard'

const CourtsList = ({ controller }) => {
  const { courts, loading, selectedCourt, selectedTimeSlot, handleTimeSlotSelect } = controller

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (courts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <i className='ri-basketball-line' style={{ fontSize: '4rem', color: 'var(--mui-palette-text-disabled)' }} />
        <Typography variant='h6' color='text.secondary' sx={{ mt: 2 }}>
          No hay canchas disponibles para este deporte
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={3}>
      <AnimatePresence mode='wait'>
        {courts.map((court, index) => (
          <motion.div
            key={court.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
          >
            <CourtCard
              court={court}
              selectedCourt={selectedCourt}
              selectedTimeSlot={selectedTimeSlot}
              onTimeSlotSelect={handleTimeSlotSelect}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </Stack>
  )
}

export default CourtsList
