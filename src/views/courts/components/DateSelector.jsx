import { Box, Button, Stack, IconButton } from '@mui/material'

const DateSelector = ({ availableDates, selectedDate, onDateChange }) => {
  const formatDate = date => {
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']

    return {
      day: days[date.getDay()],
      date: date.getDate(),
      isToday: date.toDateString() === new Date().toDateString()
    }
  }

  const isSelected = date => {
    return date.toDateString() === selectedDate.toDateString()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'background.paper',
        p: 0.5,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {availableDates.map((date, index) => {
        const formatted = formatDate(date)
        const selected = isSelected(date)

        return (
          <Button
            key={index}
            onClick={() => onDateChange(date)}
            sx={{
              minWidth: 56,
              height: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              flexShrink: 0,
              bgcolor: selected ? 'primary.main' : 'transparent',
              color: selected ? 'primary.contrastText' : 'text.secondary',
              '&:hover': {
                bgcolor: selected ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            <Box sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{formatted.isToday ? 'HOY' : formatted.day}</Box>
            <Box sx={{ fontSize: '1.125rem', fontWeight: 700 }}>{formatted.date}</Box>
          </Button>
        )
      })}
      <IconButton size='small' sx={{ ml: 0.5, color: 'text.secondary' }}>
        <i className='ri-calendar-line' />
      </IconButton>
    </Box>
  )
}

export default DateSelector
