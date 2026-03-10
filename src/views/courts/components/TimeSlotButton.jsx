import { Button, useTheme } from '@mui/material'

const TimeSlotButton = ({ slot, isSelected, onSelect, courtId }) => {
  const theme = useTheme()
  const { time, isAvailable } = slot

  // Guard against missing theme during initial hydration
  if (!theme?.palette?.primary) {
    return null
  }

  return (
    <Button
      variant={isSelected ? 'contained' : 'outlined'}
      color={isSelected ? 'primary' : 'secondary'}
      onClick={() => isAvailable && onSelect(courtId, slot)}
      disabled={!isAvailable}
      sx={{
        px: 2,
        py: 1,
        fontSize: '0.875rem',
        fontWeight: isSelected ? 700 : 500,
        borderRadius: 2,
        minWidth: 'auto',
        textDecoration: !isAvailable ? 'line-through' : 'none',
        color: !isAvailable ? 'text.disabled' : undefined,
        bgcolor: isSelected ? 'primary.main' : undefined,
        boxShadow: isSelected ? 2 : 0,
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: isAvailable ? 'primary.main' : undefined,
          color: isAvailable && !isSelected ? 'primary.main' : undefined
        },
        '&:disabled': {
          cursor: 'not-allowed',
          bgcolor: 'action.disabledBackground',
          color: 'text.disabled'
        }
      }}
    >
      {time}
    </Button>
  )
}

export default TimeSlotButton
