'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Alert,
  Rating,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'

import Skeleton from '@mui/material/Skeleton'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import { getCourtDetail } from './api'

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const formatDate = d => {
  if (!d) return '—'
  const date = new Date(d)

  return (
    date.toLocaleDateString('es-PE', { dateStyle: 'short' }) +
    ' ' +
    date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  )
}

const CourtDetailView = ({ courtId, lang }) => {
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!courtId) return
    setLoading(true)
    setError(null)
    getCourtDetail(courtId)
      .then(data => {
        setCourt(data)
      })
      .catch(() => setError('No se pudo cargar la cancha'))
      .finally(() => setLoading(false))
  }, [courtId])

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant='rectangular' height={280} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant='text' width='60%' height={40} />
        <Skeleton variant='text' width='40%' />
        <Skeleton variant='text' width='80%' />
      </Box>
    )
  }

  if (error || !court) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error || 'Cancha no encontrada'}
        </Alert>
        <Link href={`/${lang}/courts`} passHref legacyBehavior>
          <Button component='a' variant='contained'>
            Volver a canchas
          </Button>
        </Link>
      </Box>
    )
  }

  const typeName = court.court_types?.nombre || 'Sin tipo'
  const venue = court.SportsVenue
  const schedules = court.PriceSchedules || []
  const blocks = court.DateBlocks || []
  const ratingAvg = court.rating_avg != null ? Number(court.rating_avg) : null
  const ratingCount = court.rating_count ?? 0

  return (
    <Box sx={{ pb: 4 }}>
      <Link href={`/${lang}/courts`} passHref legacyBehavior>
        <Button component='a' startIcon={<i className='ri-arrow-left-line' />} sx={{ mb: 2 }}>
          Volver a canchas
        </Button>
      </Link>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ position: 'relative', width: '100%', height: 280, overflow: 'hidden', bgcolor: 'grey.100' }}>
          <OptimizedS3Image
            src={court.imagen || venue?.logo}
            alt={court.nombre}
            fill
            className='object-cover'
            sizes='100vw'
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Chip label={typeName} sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 700 }} />
            <Chip
              label={court.estado ? 'Activa' : 'Inactiva'}
              color={court.estado ? 'success' : 'default'}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
            />
          </Box>
        </Box>
        <CardContent>
          <Typography variant='h4' gutterBottom>
            {court.nombre}
          </Typography>
          {venue && (
            <Typography color='text.secondary' sx={{ mb: 1 }}>
              <i className='ri-building-line' style={{ marginRight: 6 }} />
              {venue.name} {venue.city ? ` · ${venue.city}` : ''}
            </Typography>
          )}
          {ratingAvg != null && ratingCount > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={ratingAvg} precision={0.1} size='small' readOnly />
              <Typography variant='body2' color='text.secondary'>
                ({ratingCount} valoraciones)
              </Typography>
            </Box>
          )}
          {court.capacidad != null && (
            <Typography variant='body2' color='text.secondary'>
              Capacidad: {court.capacidad} personas
            </Typography>
          )}
          {court.descripcion && (
            <Typography variant='body2' sx={{ mt: 2 }}>
              {court.descripcion}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                <i className='ri-time-line' style={{ marginRight: 8 }} />
                Horarios y precios
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {schedules.length === 0 ? (
                <Typography color='text.secondary'>No hay horarios de precio definidos.</Typography>
              ) : (
                <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 1 }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Día</TableCell>
                        <TableCell>Horario</TableCell>
                        <TableCell align='right'>Precio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {schedules.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{DAYS_OF_WEEK[row.dia_semana] ?? `Día ${row.dia_semana}`}</TableCell>
                          <TableCell>
                            {row.hora_inicio} – {row.hora_fin}
                          </TableCell>
                          <TableCell align='right'>S/ {Number(row.precio).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                <i className='ri-calendar-close-line' style={{ marginRight: 8 }} />
                Fechas bloqueadas
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {blocks.length === 0 ? (
                <Typography color='text.secondary'>No hay fechas bloqueadas.</Typography>
              ) : (
                <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 1 }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Inicio</TableCell>
                        <TableCell>Fin</TableCell>
                        <TableCell>Motivo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {blocks.map(row => (
                        <TableRow key={row.id}>
                          <TableCell>{formatDate(row.fecha_inicio)}</TableCell>
                          <TableCell>{formatDate(row.fecha_fin)}</TableCell>
                          <TableCell>{row.motivo || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default CourtDetailView
