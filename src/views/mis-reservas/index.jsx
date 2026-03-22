'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Button
} from '@mui/material'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import themeConfig from '@configs/themeConfig'
import { getMyReservationsSummary } from '@/views/client-reservations/api'
import { courtDetailSlug } from '@/utils/slugify'
import { getLocalizedUrl } from '@/utils/i18n'

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop'

function ReservationRow({ row, lang, labels }) {
  const court = row.cancha
  const href = court?.id
    ? getLocalizedUrl(`/explorar/${court.id}/${courtDetailSlug(court)}`, lang)
    : null
  const img = court?.imagen || DEFAULT_IMG
  const sede = court?.sede?.name || court?.sede?.company_name || '—'
  const estado = (row.estado_reserva || '').toLowerCase()
  const chipColor =
    estado === 'pendiente' ? 'warning' : estado === 'confirmada' ? 'success' : 'default'

  return (
    <Card variant='outlined' sx={{ borderRadius: 2 }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: '100%', sm: 120 },
              height: 80,
              borderRadius: 1,
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            <OptimizedS3Image src={img} alt={court?.nombre || ''} fill className='object-cover' sizes='120px' />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='subtitle1' fontWeight={700} noWrap>
              {court?.nombre || labels.noCourt || 'Cancha'}
            </Typography>
            <Typography variant='body2' color='text.secondary' noWrap>
              {sede}
            </Typography>
            <Typography variant='body2' sx={{ mt: 0.5 }}>
              {row.fecha} · {row.hora_inicio} – {row.hora_fin}
            </Typography>
            <Stack direction='row' spacing={1} alignItems='center' flexWrap='wrap' sx={{ mt: 1 }}>
              <Chip size='small' label={row.estado_reserva || '—'} color={chipColor} variant='outlined' />
              <Typography variant='body2' fontWeight={600}>
                S/ {Number(row.total || 0).toFixed(2)}
              </Typography>
            </Stack>
          </Box>
          {href && (
            <Button component={Link} href={href} size='small' variant='outlined'>
              {labels.viewCourt || 'Ver cancha'}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

const MisReservasIndex = ({ dictionary }) => {
  const { lang } = useParams()
  const t = dictionary?.modules?.clientArea?.reservations ?? {}
  const labels = {
    noCourt: t.noCourt,
    viewCourt: t.viewCourt,
    loadError: t.loadError
  }

  const [tab, setTab] = useState(0)
  const [data, setData] = useState({ pendiente_pago: [], proximas: [], historial: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyReservationsSummary()
      setData(res)
    } catch (e) {
      setError(e?.response?.data?.message || t.loadError || 'No se pudieron cargar tus reservas.')
    } finally {
      setLoading(false)
    }
  }, [t.loadError])

  useEffect(() => {
    load()
  }, [load])

  const sections = [
    { key: 'pendiente_pago', label: t.tabPending || 'Pendiente de pago', rows: data.pendiente_pago },
    { key: 'proximas', label: t.tabUpcoming || 'Próximas', rows: data.proximas },
    { key: 'historial', label: t.tabHistory || 'Historial', rows: data.historial }
  ]

  const currentRows = sections[tab]?.rows ?? []

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: themeConfig.compactContentWidth,
        mx: 'auto',
        py: 4,
        px: { xs: 2, sm: 3 },
        boxSizing: 'border-box'
      }}
    >
      <Typography variant='h4' component='h1' sx={{ fontWeight: 700, mb: 1 }}>
        {t.title || 'Mis reservas'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        {t.subtitle || 'Pagos pendientes, partidos próximos e historial de alquileres.'}
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        centered={false}
        sx={{
          width: '100%',
          mb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTabs-flexContainer': {
            justifyContent: 'flex-start',
            columnGap: 0.5
          },
          '& .MuiTabs-scroller': {
            marginInline: '0 !important'
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            minHeight: 48
          }
        }}
      >
        {sections.map((s, i) => (
          <Tab
            key={s.key}
            label={`${s.label} (${s.rows.length})`}
            id={`res-tab-${i}`}
            aria-controls={`res-panel-${i}`}
          />
        ))}
      </Tabs>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && currentRows.length === 0 && (
        <Typography color='text.secondary' sx={{ py: 4 }}>
          {t.emptySection || 'No hay elementos en esta sección.'}
        </Typography>
      )}

      {!loading && currentRows.length > 0 && (
        <Stack spacing={2} role='tabpanel' id={`res-panel-${tab}`}>
          {currentRows.map(row => (
            <ReservationRow key={row.id} row={row} lang={lang} labels={labels} />
          ))}
        </Stack>
      )}
    </Box>
  )
}

export default MisReservasIndex
