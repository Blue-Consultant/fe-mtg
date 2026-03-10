import { Box, Chip, Stack } from '@mui/material'

const SportFilter = ({ sports, selectedSport, onSportChange }) => {
  return (
    <Stack
      direction='row'
      spacing={1.5}
      sx={{
        overflowX: 'auto',
        pb: { xs: 1, lg: 0 },
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {sports.map(sport => (
        <Chip
          key={sport.id}
          label={sport.label}
          icon={<i className={sport.icon} style={{ fontSize: '1.25rem' }} />}
          onClick={() => onSportChange(sport.id)}
          color={selectedSport === sport.id ? 'primary' : 'default'}
          variant={selectedSport === sport.id ? 'filled' : 'outlined'}
          sx={{
            height: 40,
            px: 1.5,
            fontWeight: selectedSport === sport.id ? 700 : 500,
            fontSize: '0.875rem',
            flexShrink: 0,
            transition: 'all 0.2s',
            '&:active': {
              transform: 'scale(0.95)'
            }
          }}
        />
      ))}
    </Stack>
  )
}

export default SportFilter
