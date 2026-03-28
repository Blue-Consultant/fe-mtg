'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

import {
  Alert,
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { getOwnerDashboardStats } from './api'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

/**
 * ApexCharts falla con #RRGGBBAA, `hsl(var(...))`, etc. Solo dejamos hex 6, #rgb o rgb/rgba/hsl literales.
 */
function sanitizeForApexChartColor(maybe, fallback) {
  const fb = fallback

  if (maybe == null || typeof maybe !== 'string') return fb
  const s = maybe.trim()

  if (!s || s.includes('var(')) return fb
  if (/^#[0-9a-f]{8}$/i.test(s)) return s.slice(0, 7)
  if (/^#[0-9a-f]{6}$/i.test(s)) return s

  if (/^#[0-9a-f]{3}$/i.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
  }

  if (/^rgba?\(/i.test(s)) return s
  if (/^hsla?\(/i.test(s)) return s

  return fb
}

function readCssVarToken(token) {
  if (typeof window === 'undefined') return ''
  const t = token.trim()
  let r = getComputedStyle(document.documentElement).getPropertyValue(t).trim()

  if (!r && document.body) {
    r = getComputedStyle(document.body).getPropertyValue(t).trim()
  }

  return r
}

/**
 * Resuelve `var(--mui-palette-*)` y normaliza a un color que ApexCharts pueda parsear.
 */
function resolveApexColor(value, fallback) {
  const fb = fallback

  if (value == null || value === '') return sanitizeForApexChartColor(null, fb)
  if (typeof value !== 'string') return sanitizeForApexChartColor(null, fb)
  const v = value.trim()

  if (v.startsWith('var(') && typeof window !== 'undefined') {
    const token = v
      .replace(/^var\(/, '')
      .replace(/\)$/, '')
      .split(',')[0]
      .trim()

    const resolved = readCssVarToken(token)

    if (resolved) return resolveApexColor(resolved, fb)

    return sanitizeForApexChartColor(null, fb)
  }

  return sanitizeForApexChartColor(v, fb)
}

function apexChartFontFamily(theme) {
  const ff = theme.typography?.fontFamily

  if (typeof ff === 'string' && ff.trim() && !ff.trim().startsWith('var(')) return ff

  return 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
}

function formatPen(value) {
  const n = Number(value) || 0

  return `S/ ${n.toFixed(2)}`
}

function shortDayLabel(ymd, locale) {
  if (!ymd) return '—'
  const d = new Date(`${ymd}T12:00:00.000Z`)

  if (Number.isNaN(d.getTime())) return ymd

  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function StatCard({ title, value, subtitle, iconClass }) {
  return (
    <Grid item xs={6} sm={6} md={3}>
      <Card variant='outlined' sx={{ height: '100%', borderRadius: 2 }}>
        <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack direction='row' spacing={2} alignItems='flex-start'>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: theme => alpha(theme.palette.primary.main, 0.14),
                color: 'primary.main'
              }}
            >
              <i className={`${iconClass} text-[22px]`} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant='caption' color='text.secondary' display='block' fontWeight={500}>
                {title}
              </Typography>
              <Typography variant='h5' fontWeight={700} sx={{ lineHeight: 1.2, mt: 0.25 }}>
                {value}
              </Typography>
              {subtitle ? (
                <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}

function ChartEmpty({ message }) {
  return (
    <Box
      sx={{
        minHeight: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2
      }}
    >
      <Typography variant='body2' color='text.secondary' textAlign='center'>
        {message}
      </Typography>
    </Box>
  )
}

const emptyStats = () => ({
  currency: 'PEN',
  collections: {
    currency: 'PEN',
    today: 0,
    yesterday: 0,
    last_7_days: 0,
    month_to_date: 0,
    last_month_total: 0,
    daily_history: []
  },
  venues_count: 0,
  courts: { total: 0, active: 0 },
  clients: {
    distinct_today: 0,
    distinct_month_to_date: 0,
    distinct_last_month: 0,
    distinct_all_time: 0
  },
  reservations: { today: 0, month_to_date: 0, last_month: 0 },
  daily_distinct_clients: []
})

const OwnerDashboard = ({ dictionary = {} }) => {
  const d = dictionary?.modules?.dashboard?.owner ?? {}
  const params = useParams()
  const locale = params?.lang === 'en' ? 'en' : 'es'
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [data, setData] = useState(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const raw = await getOwnerDashboardStats()
      const c = raw?.collections ?? {}

      setData({
        currency: raw?.currency ?? 'PEN',
        collections: {
          currency: c.currency ?? 'PEN',
          today: Number(c.today) || 0,
          yesterday: Number(c.yesterday) || 0,
          last_7_days: Number(c.last_7_days) || 0,
          month_to_date: Number(c.month_to_date) || 0,
          last_month_total: Number(c.last_month_total) || 0,
          daily_history: Array.isArray(c.daily_history) ? c.daily_history : []
        },
        venues_count: Number(raw?.venues_count) || 0,
        courts: {
          total: Number(raw?.courts?.total) || 0,
          active: Number(raw?.courts?.active) || 0
        },
        clients: {
          distinct_today: Number(raw?.clients?.distinct_today) || 0,
          distinct_month_to_date: Number(raw?.clients?.distinct_month_to_date) || 0,
          distinct_last_month: Number(raw?.clients?.distinct_last_month) || 0,
          distinct_all_time: Number(raw?.clients?.distinct_all_time) || 0
        },
        reservations: {
          today: Number(raw?.reservations?.today) || 0,
          month_to_date: Number(raw?.reservations?.month_to_date) || 0,
          last_month: Number(raw?.reservations?.last_month) || 0
        },
        daily_distinct_clients: Array.isArray(raw?.daily_distinct_clients) ? raw.daily_distinct_clients : []
      })
    } catch (e) {
      console.error(e)
      setError(d.loadError ?? 'No se pudieron cargar las métricas.')
      setData(emptyStats())
    } finally {
      setLoading(false)
    }
  }, [d.loadError])

  useEffect(() => {
    load()
  }, [load])

  const c = data.collections

  const revSorted = useMemo(() => {
    const arr = [...(c.daily_history || [])].sort((a, b) => a.date.localeCompare(b.date))

    if (arr.length > 30) return arr.slice(-30)

    return arr
  }, [c.daily_history])

  const cliSorted = useMemo(
    () => [...(data.daily_distinct_clients || [])].sort((a, b) => a.date.localeCompare(b.date)),
    [data.daily_distinct_clients]
  )

  const chartFont = useMemo(() => apexChartFontFamily(theme), [theme])

  const chartPrimary = useMemo(
    () => resolveApexColor(theme.palette.primary.main, '#2196f3'),
    [theme.palette.primary.main, theme.palette.mode]
  )

  const chartSuccess = useMemo(
    () => resolveApexColor(theme.palette.success.main, '#2e7d32'),
    [theme.palette.success.main, theme.palette.mode]
  )

  const chartWarning = useMemo(
    () => resolveApexColor(theme.palette.warning?.main, '#ed6c02'),
    [theme.palette.warning?.main, theme.palette.mode]
  )

  const chartInfo = useMemo(
    () => resolveApexColor(theme.palette.info?.main, chartPrimary),
    [theme.palette.info?.main, chartPrimary, theme.palette.mode]
  )

  const chartTextMuted = useMemo(
    () => resolveApexColor(theme.palette.text.secondary, isDark ? '#b0b0b0' : '#757575'),
    [theme.palette.text.secondary, isDark, theme.palette.mode]
  )

  const chartTextPrimary = useMemo(
    () => resolveApexColor(theme.palette.text.primary, isDark ? '#f5f5f5' : '#1a1a1a'),
    [theme.palette.text.primary, isDark, theme.palette.mode]
  )

  const chartGreyInactive = useMemo(
    () => resolveApexColor(isDark ? theme.palette.grey[600] : theme.palette.grey[400], isDark ? '#757575' : '#bdbdbd'),
    [isDark, theme.palette.grey[400], theme.palette.grey[600], theme.palette.mode]
  )

  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const revenueChart = useMemo(() => {
    const categories = revSorted.map(r => shortDayLabel(r.date, locale))
    const values = revSorted.map(r => Number(r.total) || 0)
    const hasData = values.some(v => v > 0)

    const options = {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: chartFont
      },
      colors: [chartPrimary],
      stroke: { width: 3, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      dataLabels: { enabled: false },
      markers: { size: 0, hover: { size: 6 } },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: chartTextMuted, fontSize: '11px' },
          rotate: -45,
          rotateAlways: categories.length > 10
        }
      },
      yaxis: {
        labels: {
          style: { colors: chartTextMuted, fontSize: '12px' },
          formatter: val => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(Math.round(val)))
        }
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        padding: { top: 8, right: 8, bottom: 0, left: 8 }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: val => formatPen(val)
        }
      }
    }

    const series = [{ name: d.chartRevenueTitle ?? 'Recaudación', data: values }]

    return { options, series, hasData }
  }, [revSorted, locale, chartPrimary, chartTextMuted, gridColor, isDark, chartFont, d.chartRevenueTitle])

  const clientsChart = useMemo(() => {
    const categories = cliSorted.map(r => shortDayLabel(r.date, locale))
    const values = cliSorted.map(r => Number(r.count) || 0)
    const hasData = values.some(v => v > 0)

    const options = {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
        fontFamily: chartFont
      },
      colors: [chartInfo],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '62%',
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: values.length <= 14,
        offsetY: -18,
        style: { fontSize: '11px', colors: [chartTextMuted] },
        formatter: val => (val > 0 ? String(val) : '')
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: chartTextMuted, fontSize: '11px' },
          rotate: -45,
          rotateAlways: categories.length > 8
        }
      },
      yaxis: {
        labels: { style: { colors: chartTextMuted, fontSize: '12px' } },
        min: 0,
        tickAmount: 4,
        forceNiceScale: true
      },
      grid: {
        borderColor: gridColor,
        strokeDashArray: 4,
        padding: { top: 24, right: 8, bottom: 0, left: 8 }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: { formatter: val => String(Math.round(val)) }
      }
    }

    const series = [{ name: d.chartClientsTitle ?? 'Clientes', data: values }]

    return { options, series, hasData }
  }, [cliSorted, locale, chartInfo, chartTextMuted, gridColor, isDark, chartFont, d.chartClientsTitle])

  const courtsChart = useMemo(() => {
    const active = data.courts.active
    const total = data.courts.total
    const inactive = Math.max(0, total - active)
    const hasData = total > 0

    const options = {
      chart: { fontFamily: chartFont },
      labels: [d.legendActive ?? 'Activas', d.legendInactive ?? 'Inactivas'],
      colors: [chartSuccess, chartGreyInactive],
      stroke: { width: 0 },
      legend: {
        position: 'bottom',
        fontSize: '13px',
        labels: { colors: chartTextMuted }
      },
      dataLabels: {
        enabled: true,
        formatter: (val, opts) => {
          const amount = opts.w.config.series[opts.seriesIndex]

          return `${Math.round(val)}% · ${amount}`
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: { show: true, color: chartTextMuted },
              value: {
                fontSize: '22px',
                fontWeight: 700,
                color: chartTextPrimary,
                formatter: () => String(total)
              },
              total: {
                show: true,
                showAlways: true,
                label: d.courtsTotal ?? 'Canchas',
                color: chartTextMuted,
                formatter: () => String(total)
              }
            }
          }
        }
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: { formatter: val => String(val) }
      }
    }

    const series = [active, inactive]

    return { options, series, hasData }
  }, [
    data.courts,
    chartSuccess,
    chartGreyInactive,
    chartTextMuted,
    chartTextPrimary,
    chartFont,
    d.legendActive,
    d.legendInactive,
    d.courtsTotal
  ])

  const bookingsChart = useMemo(() => {
    const categories = [
      d.bookingsBarToday ?? 'Hoy',
      d.bookingsBarMonth ?? 'Este mes',
      d.bookingsBarLastMonth ?? 'Mes ant.'
    ]

    const values = [data.reservations.today, data.reservations.month_to_date, data.reservations.last_month]
    const hasData = values.some(v => v > 0)

    const options = {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
        fontFamily: chartFont
      },
      colors: [chartPrimary, chartInfo, chartWarning],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 6,
          barHeight: '52%',
          distributed: true,
          dataLabels: { position: 'center' }
        }
      },
      dataLabels: {
        enabled: true,
        style: { colors: ['#fff'], fontSize: '13px', fontWeight: 600 },
        formatter: val => String(val)
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: chartTextMuted, fontSize: '12px' } }
      },
      yaxis: { labels: { style: { colors: chartTextMuted, fontSize: '12px' } } },
      grid: { borderColor: gridColor, strokeDashArray: 4, padding: { left: 8, right: 16 } },
      legend: { show: false },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: { formatter: val => String(val) }
      }
    }

    const series = [{ name: d.chartBookingsTitle ?? 'Reservas', data: values }]

    return { options, series, hasData }
  }, [
    data.reservations,
    chartPrimary,
    chartInfo,
    chartWarning,
    chartTextMuted,
    gridColor,
    isDark,
    chartFont,
    d.bookingsBarToday,
    d.bookingsBarMonth,
    d.bookingsBarLastMonth,
    d.chartBookingsTitle
  ])

  return (
    <Box>
      <Stack direction='row' alignItems='flex-start' justifyContent='space-between' gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant='h4' className='mbe-1' fontWeight={700}>
            {d.title ?? 'Panel'}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 720 }}>
            {d.subtitle ?? 'Resumen de recaudación, clientes y operación de tus sedes.'}
          </Typography>
          <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.75 }}>
            {d.utcNote ?? 'Recaudación por fecha de pago; clientes y reservas por fecha de reserva (días en UTC).'}
          </Typography>
        </Box>
        <Tooltip title={d.refresh ?? 'Actualizar'}>
          <Box component='span' sx={{ display: 'inline-flex' }}>
            <IconButton color='primary' onClick={() => load()} disabled={loading} size='small' aria-label='refresh'>
              <i className='ri-refresh-line text-2xl' />
            </IconButton>
          </Box>
        </Tooltip>
      </Stack>

      {error ? (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant='overline' color='text.secondary' sx={{ letterSpacing: 1, mb: 1.5, display: 'block' }}>
            {d.kpiStripHint ?? 'Indicadores rápidos'}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <StatCard
              title={d.revToday ?? 'Recaudado hoy'}
              value={formatPen(c.today)}
              subtitle={`${d.revYesterday ?? 'Ayer'}: ${formatPen(c.yesterday)}`}
              iconClass='ri-calendar-todo-line'
            />
            <StatCard
              title={d.revMonth ?? 'Mes en curso'}
              value={formatPen(c.month_to_date)}
              subtitle={`${d.revLast7 ?? '7 días'}: ${formatPen(c.last_7_days)}`}
              iconClass='ri-funds-line'
            />
            <StatCard
              title={d.clientsMonth ?? 'Clientes este mes'}
              value={String(data.clients.distinct_month_to_date)}
              subtitle={`${d.clientsToday ?? 'Hoy'}: ${data.clients.distinct_today}`}
              iconClass='ri-team-line'
            />
            <StatCard
              title={d.bookingsMonth ?? 'Reservas este mes'}
              value={String(data.reservations.month_to_date)}
              subtitle={`${d.venues ?? 'Sedes'}: ${data.venues_count}`}
              iconClass='ri-calendar-event-line'
            />
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant='outlined' sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <CardHeader
                  title={
                    <Typography variant='h6' fontWeight={600}>
                      {d.chartRevenueTitle ?? 'Recaudación diaria'}
                    </Typography>
                  }
                  subheader={d.chartRevenueSubtitle ?? 'Pagos confirmados por día'}
                  sx={{ pb: 0, '& .MuiCardHeader-subheader': { mt: 0.5 } }}
                />
                <CardContent sx={{ pt: 1 }}>
                  {revenueChart.hasData ? (
                    <AppReactApexCharts
                      key={revSorted.map(r => r.date).join(',')}
                      type='area'
                      height={320}
                      width='100%'
                      options={revenueChart.options}
                      series={revenueChart.series}
                    />
                  ) : (
                    <ChartEmpty message={d.emptySeries ?? 'Sin datos'} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={7}>
              <Card variant='outlined' sx={{ borderRadius: 2, height: '100%' }}>
                <CardHeader
                  title={
                    <Typography variant='h6' fontWeight={600}>
                      {d.chartClientsTitle ?? 'Clientes por día'}
                    </Typography>
                  }
                  subheader={d.chartClientsSubtitle}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  {clientsChart.hasData ? (
                    <AppReactApexCharts
                      key={cliSorted.map(r => r.date).join(',')}
                      type='bar'
                      height={300}
                      width='100%'
                      options={clientsChart.options}
                      series={clientsChart.series}
                    />
                  ) : (
                    <ChartEmpty message={d.emptySeries ?? 'Sin datos'} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card variant='outlined' sx={{ borderRadius: 2, height: '100%' }}>
                <CardHeader
                  title={
                    <Typography variant='h6' fontWeight={600}>
                      {d.chartCourtsTitle ?? 'Canchas'}
                    </Typography>
                  }
                  subheader={d.chartCourtsSubtitle}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {courtsChart.hasData ? (
                    <AppReactApexCharts
                      key={`${data.courts.total}-${data.courts.active}`}
                      type='donut'
                      height={300}
                      width='100%'
                      options={courtsChart.options}
                      series={courtsChart.series}
                    />
                  ) : (
                    <ChartEmpty message={d.emptySeries ?? 'Sin datos'} />
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant='outlined' sx={{ borderRadius: 2 }}>
                <CardHeader
                  title={
                    <Typography variant='h6' fontWeight={600}>
                      {d.chartBookingsTitle ?? 'Reservas por periodo'}
                    </Typography>
                  }
                  subheader={d.chartBookingsSubtitle}
                  sx={{ pb: 0 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  {bookingsChart.hasData ? (
                    <AppReactApexCharts
                      key={`${data.reservations.today}-${data.reservations.month_to_date}-${data.reservations.last_month}`}
                      type='bar'
                      height={220}
                      width='100%'
                      options={bookingsChart.options}
                      series={bookingsChart.series}
                    />
                  ) : (
                    <ChartEmpty message={d.emptySeries ?? 'Sin datos'} />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default OwnerDashboard
