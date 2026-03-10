import { Box, Stack } from '@mui/material'

import SportFilter from './SportFilter'
import DateSelector from './DateSelector'

const FiltersBar = ({ controller }) => {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={3}
      sx={{
        mb: 4,
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', lg: 'center' }
      }}
    >
      <Box sx={{ flex: 1 }}>
        <SportFilter
          sports={controller.sports}
          selectedSport={controller.selectedSport}
          onSportChange={controller.handleSportChange}
        />
      </Box>
      <Box sx={{ width: { xs: '100%', lg: 'auto' } }}>
        <DateSelector
          availableDates={controller.availableDates}
          selectedDate={controller.selectedDate}
          onDateChange={controller.handleDateChange}
        />
      </Box>
    </Stack>
  )
}

export default FiltersBar
