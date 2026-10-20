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
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { getOwnerDashboardStats } from './api'
import styles from './dashboard.module.css'

const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'), { ssr: false })

/** Paleta MTG fija para gráficas (evita amarillo/azul del theme). */
const MTG = {
  green: '#13b236',
  greenDeep: '#0d8c2a',
  greenMid: '#3d9b56',
  greenSoft: '#7bc48a',
  soft: '#e8f7ec',
  muted: '#5c6560',
  ink: '#1c1c1c',
  line: '#d7eee0',
  inactive: '#b8c4bc'
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
      <Card className={styles.statCard} elevation={0}>
        <CardContent>
          <Stack direction='row' spacing={1.75} alignItems='flex-start'>
            <Box className={styles.statIcon}>
              <i className={iconClass} aria-hidden />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <span className={styles.statTitle}>{title}</span>
              <div className={styles.statValue}>{value}</div>
              {subtitle ? <span className={styles.statSub}>{subtitle}</span> : null}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}

function ChartEmpty({ message }) {
  return <div className={styles.chartEmpty}>{message}</div>
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
  const chartTextMuted = isDark ? '#a8b5ad' : MTG.muted
  const chartTextPrimary = isDark ? '#f5f5f5' : MTG.ink
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,140,42,0.12)'

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
      colors: [MTG.green],
      stroke: { width: 3, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.04,
          stops: [0, 90, 100],
          colorStops: [
            { offset: 0, color: MTG.green, opacity: 0.35 },
            { offset: 100, color: MTG.green, opacity: 0.02 }
          ]
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
        y: { formatter: val => formatPen(val) }
      }
    }

    const series = [{ name: d.chartRevenueTitle ?? 'Recaudación', data: values }]

    return { options, series, hasData }
  }, [revSorted, locale, chartTextMuted, gridColor, isDark, chartFont, d.chartRevenueTitle])

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
      colors: [MTG.greenDeep],
      plotOptions: {
        bar: {
          borderRadius: 8,
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
  }, [cliSorted, locale, chartTextMuted, gridColor, isDark, chartFont, d.chartClientsTitle])

  const courtsChart = useMemo(() => {
    const active = data.courts.active
    const total = data.courts.total
    const inactive = Math.max(0, total - active)
    const hasData = total > 0

    const options = {
      chart: { fontFamily: chartFont },
      labels: [d.legendActive ?? 'Activas', d.legendInactive ?? 'Inactivas'],
      colors: [MTG.green, MTG.inactive],
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
    chartTextMuted,
    chartTextPrimary,
    chartFont,
    isDark,
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
      colors: [MTG.green, MTG.greenDeep, MTG.greenMid],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 8,
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
    <div className={styles.pageWrap}>
      <header className={styles.header}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <h1 className={styles.headerTitle}>{d.title ?? 'Resumen'}</h1>
          <p className={styles.headerSubtitle}>{d.subtitle ?? 'Vista rápida de recaudación, clientes y reservas.'}</p>
        </Box>
        <Tooltip title={d.refresh ?? 'Actualizar'}>
          <button
            type='button'
            className={styles.refreshBtn}
            onClick={() => load()}
            disabled={loading}
            aria-label={d.refresh ?? 'Actualizar'}
          >
            <i className='ri-refresh-line' aria-hidden />
          </button>
        </Tooltip>
      </header>

      {error ? (
        <Alert severity='error' className={styles.alertError}>
          {error}
        </Alert>
      ) : null}

      {loading ? (
        <div className={styles.loadingWrap}>
          <CircularProgress size={36} thickness={4} />
        </div>
      ) : (
        <>
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

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Card className={styles.chartCard} elevation={0}>
                <CardHeader title={d.chartRevenueTitle ?? 'Recaudación diaria'} />
                <CardContent>
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
              <Card className={styles.chartCard} elevation={0}>
                <CardHeader title={d.chartClientsTitle ?? 'Clientes por día'} />
                <CardContent>
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
              <Card className={styles.chartCard} elevation={0}>
                <CardHeader title={d.chartCourtsTitle ?? 'Canchas'} />
                <CardContent>
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
              <Card className={styles.chartCard} elevation={0}>
                <CardHeader title={d.chartBookingsTitle ?? 'Reservas por periodo'} />
                <CardContent>
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
    </div>
  )
}

export default OwnerDashboard
