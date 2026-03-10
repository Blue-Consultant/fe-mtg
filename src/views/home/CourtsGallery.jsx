'use client'

// React Imports
import { memo } from 'react'
import Link from 'next/link'

// MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import { useTheme } from '@mui/material/styles'

// Component Imports
import { courtDetailSlug } from '@/utils/slugify'
import OptimizedS3Image from '@components/OptimizedS3Image'

const DEFAULT_COURT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop'
const DAYS_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const CourtsGallery = memo(({ courts = [], lang = 'es', title = 'Canchas Destacadas', showVerTodas = true, alertMessage }) => {
  const theme = useTheme()
  const href = `/${lang}/explorar`

  return (
    <Box
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: 'background.paper'
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 5, lg: 10 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography variant='h4' component='h2' sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {showVerTodas && (
            <Link
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.875rem',
                textDecoration: 'none'
              }}
            >
              Ver todas
              <i className='ri-arrow-right-line' style={{ fontSize: '1rem' }} />
            </Link>
          )}
        </Box>

        {alertMessage && (
          <Alert severity='info' sx={{ mb: 3 }}>
            {alertMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {courts.length === 0 ? (
            <Grid item xs={12}>
              <Typography color='text.secondary'>No hay canchas destacadas aún.</Typography>
            </Grid>
          ) : (
            courts.map(court => {
              const name = court.nombre || court.name
              const location = court.SportsVenue?.name || court.location || '—'
              const img = court.imagen || court.SportsVenue?.logo || court.image || DEFAULT_COURT_IMAGE
              const description = court.descripcion || 'Cancha deportiva disponible para reserva.'
              const schedules = court.PriceSchedules || []
              const pricePerHour = schedules.length > 0 && schedules[0].precio != null
                ? `S/ ${Number(schedules[0].precio).toFixed(0)}/h`
                : 'Consultar'

              return (
                <Grid item xs={12} md={6} key={court.id}>
                  <Card
                    component={Link}
                    href={`/${lang}/explorar/${court.id}/${courtDetailSlug(court)}`}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      textDecoration: 'none',
                      color: 'inherit',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[10],
                        '& .court-image': { transform: 'scale(1.05)' }
                      }
                    }}
                  >
                    {/* Imagen a la izquierda */}
                    <Box
                      className='court-image'
                      sx={{
                        position: 'relative',
                        width: { xs: '100%', sm: 240 },
                        minHeight: { xs: 160, sm: 180 },
                        flexShrink: 0,
                        overflow: 'hidden',
                        bgcolor: 'grey.200'
                      }}
                    >
                      <OptimizedS3Image
                        src={img}
                        alt={name}
                        fill
                        className='object-cover'
                        sizes='(max-width: 600px) 100vw, 280px'
                        style={{ transition: 'transform 0.4s ease' }}
                      />
                      {/* Precio por hora - esquina superior derecha */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1,
                          bgcolor: 'rgba(255,255,255,0.95)',
                          boxShadow: 1,
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          color: 'primary.main'
                        }}
                      >
                        {pricePerHour}
                      </Box>
                    </Box>

                    {/* Contenido a la derecha */}
                    <CardContent
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2.5,
                        '&:last-child': { pb: 2.5 }
                      }}
                    >
                      <Typography variant='h6' component='h3' sx={{ fontWeight: 700, mb: 1 }}>
                        {name}
                      </Typography>

                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{
                          mb: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {description}
                      </Typography>

                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
                          Horarios disponibles
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {schedules.length > 0 ? (
                            schedules.slice(0, 6).map((s, idx) => (
                              <Chip
                                key={idx}
                                label={`${DAYS_LABELS[s.dia_semana] ?? s.dia_semana} ${s.hora_inicio} - ${s.hora_fin}`}
                                size='small'
                                variant='outlined'
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))
                          ) : (
                            <Chip
                              label='Ver horarios en detalle'
                              size='small'
                              color='primary'
                              variant='outlined'
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </Box>

                      <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
                        <i className='ri-map-pin-line' style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        {location}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })
          )}
        </Grid>
      </Box>
    </Box>
  )
})

CourtsGallery.displayName = 'CourtsGallery'

export default CourtsGallery
