'use client'

import { useState, memo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

const TIME_OPTIONS = [
  '06:00 - 07:00',
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
  '22:00 - 23:00'
]

const BookingWidget = memo(({ onSearch, courtTypesList = [], loading = false }) => {
  const theme = useTheme()
  const [courtTypeId, setCourtTypeId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [time, setTime] = useState('18:00 - 19:00')

  const handleSearch = () => {
    if (!onSearch || loading) return
    const [hora_inicio, hora_fin] = time.split(' - ')
    onSearch({
      fecha: date,
      hora_inicio: hora_inicio.trim(),
      hora_fin: hora_fin.trim(),
      court_type_id: courtTypeId === '' ? null : Number(courtTypeId)
    })
  }

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 960,
        p: { xs: 2, md: 3 },
        zIndex: 20,
        boxShadow: theme.shadows[10],
        backgroundColor: theme.palette.background.paper
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          alignItems: 'flex-end'
        }}
      >
        <FormControl fullWidth sx={{ flex: { lg: 1 } }}>
          <InputLabel id='sport-select-label'>Deporte</InputLabel>
          <Select
            labelId='sport-select-label'
            id='sport-select'
            value={courtTypeId}
            label='Deporte'
            onChange={e => setCourtTypeId(e.target.value)}
          >
            <MenuItem value=''>
              <em>Todos los tipos</em>
            </MenuItem>
            {Array.isArray(courtTypesList) &&
              courtTypesList.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.nombre}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          type='date'
          label='Fecha'
          value={date}
          onChange={e => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: { lg: 1 } }}
        />

        <FormControl fullWidth sx={{ flex: { lg: 1 } }}>
          <InputLabel id='time-select-label'>Hora</InputLabel>
          <Select
            labelId='time-select-label'
            id='time-select'
            value={time}
            label='Hora'
            onChange={e => setTime(e.target.value)}
          >
            {TIME_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          fullWidth
          variant='contained'
          color='primary'
          size='large'
          onClick={handleSearch}
          disabled={loading}
          endIcon={<i className='ri-search-line' />}
          sx={{ flex: { lg: 1 }, height: 56, fontWeight: 700 }}
        >
          {loading ? 'Buscando...' : 'Buscar Cancha'}
        </Button>
      </Box>
    </Card>
  )
})

BookingWidget.displayName = 'BookingWidget'

export default BookingWidget
