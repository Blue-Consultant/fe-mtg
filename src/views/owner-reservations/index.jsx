'use client'

import { useParams } from 'next/navigation'

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Button
} from '@mui/material'

import { AnimatePresence, motion } from 'framer-motion'

import { useOwnerReservations } from './hooks/useOwnerReservations'

function formatCollectedAmount(value) {
  const n = Number(value) || 0

  return `S/ ${n.toFixed(2)}`
}

function formatHistoryDay(ymd, locale) {
  if (!ymd || typeof ymd !== 'string') return '—'
  const d = new Date(`${ymd}T12:00:00.000Z`)

  if (Number.isNaN(d.getTime())) return ymd

  return d.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function CollectionStatCard({ label, amount, loading, iconClass }) {
  return (
    <Grid item xs={12} sm={6} md={2.4}>
      <Card variant='outlined' sx={{ height: '100%' }}>
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            py: 2.5,
            '&:last-child': { pb: 2.5 }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              width: 44,
              height: 44,
              flexShrink: 0,
              bgcolor: theme => theme.palette.primary.main + '18',
              color: 'primary.main'
            }}
          >
            <i className={`${iconClass} text-[22px]`} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton variant='text' width='70%' height={36} sx={{ maxWidth: 120 }} />
            ) : (
              <Typography variant='h6' fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {formatCollectedAmount(amount)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}

function statusChipColor(value) {
  const v = String(value || '').toLowerCase()

  if (v === 'confirmada') return 'success'
  if (v === 'pendiente') return 'warning'
  if (v === 'cancelada') return 'default'

  return 'default'
}

const OwnerReservationsIndex = ({ dictionary = {} }) => {
  const d = dictionary?.modules?.ownerReservations ?? {}
  const common = dictionary?.common ?? {}
  const params = useParams()
  const locale = params?.lang === 'en' ? 'en' : 'es'

  const {
    loading,
    loadingCollections,
    collections,
    list,
    courtsList,
    fecha,
    setFecha,
    estadoReserva,
    setEstadoReserva,
    estadoPago,
    setEstadoPago,
    canchaId,
    setCanchaId,
    searchInput,
    setSearchInput,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    handleResetFilters,
    refetch
  } = useOwnerReservations()

  const rows = list.rows || []
  const totalPages = Math.max(1, list.totalPages || 1)

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key='owner-reservations'
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardContent className='flex flex-col gap-5'>
            <Box className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
              <Box>
                <Typography variant='h4' className='mbe-1'>
                  {d.title ?? 'Reservas de clientes'}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {d.subtitle ??
                    'Historial por día, estado de reserva y pago. Horarios de cada cliente en tus canchas.'}
                </Typography>
              </Box>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Tooltip title={d.refresh ?? 'Actualizar'}>
                  <IconButton color='primary' onClick={() => refetch()} size='small' aria-label='refresh'>
                    <i className='ri-refresh-line text-2xl' />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            <Box>
              <Typography variant='h6' className='mbe-1'>
                {d.collectionsSection ?? 'Recaudación'}
              </Typography>
              <Typography variant='caption' color='text.secondary' display='block' sx={{ mb: 2 }}>
                {d.collectionsHint ?? 'Solo pagos confirmados con fecha de pago. Los días se agrupan en UTC.'}
              </Typography>
              <Grid container spacing={2}>
                <CollectionStatCard
                  label={d.cardToday ?? 'Hoy'}
                  amount={collections.today}
                  loading={loadingCollections}
                  iconClass='ri-calendar-todo-line'
                />
                <CollectionStatCard
                  label={d.cardYesterday ?? 'Ayer'}
                  amount={collections.yesterday}
                  loading={loadingCollections}
                  iconClass='ri-calendar-line'
                />
                <CollectionStatCard
                  label={d.cardLast7 ?? 'Últimos 7 días'}
                  amount={collections.last_7_days}
                  loading={loadingCollections}
                  iconClass='ri-bar-chart-line'
                />
                <CollectionStatCard
                  label={d.cardMonth ?? 'Mes en curso'}
                  amount={collections.month_to_date}
                  loading={loadingCollections}
                  iconClass='ri-funds-line'
                />
                <CollectionStatCard
                  label={d.cardLastMonth ?? 'Mes anterior'}
                  amount={collections.last_month_total}
                  loading={loadingCollections}
                  iconClass='ri-calendar-check-line'
                />
              </Grid>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 1 }}>
                {d.historyTitle ?? 'Historial diario'}
              </Typography>
              {loadingCollections ? (
                <Box sx={{ py: 2 }}>
                  <Skeleton variant='rounded' height={200} />
                </Box>
              ) : (collections.daily_history?.length ?? 0) === 0 ? (
                <Alert severity='info' sx={{ py: 0.5 }}>
                  {d.historyEmpty ?? 'Sin movimientos en el periodo mostrado.'}
                </Alert>
              ) : (
                <TableContainer sx={{ borderRadius: 1, border: theme => `1px solid ${theme.palette.divider}` }}>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>{d.historyColDate ?? 'Día'}</TableCell>
                        <TableCell align='right'>{d.historyColAmount ?? 'Recaudado'}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {collections.daily_history.map(row => (
                        <TableRow key={row.date} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight={500}>
                              {formatHistoryDay(row.date, locale)}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {row.date}
                            </Typography>
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' fontWeight={600}>
                              {formatCollectedAmount(row.total)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Grid container spacing={2} alignItems='flex-end' sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  label={d.filterDate ?? 'Día'}
                  type='date'
                  size='small'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl size='small' fullWidth>
                  <InputLabel id='or-estado-reserva'>{d.reservationStatus ?? 'Estado reserva'}</InputLabel>
                  <Select
                    labelId='or-estado-reserva'
                    label={d.reservationStatus ?? 'Estado reserva'}
                    value={estadoReserva}
                    onChange={e => setEstadoReserva(e.target.value)}
                  >
                    <MenuItem value=''>{common.all ?? 'Todas'}</MenuItem>
                    <MenuItem value='pendiente'>Pendiente</MenuItem>
                    <MenuItem value='confirmada'>Confirmada</MenuItem>
                    <MenuItem value='cancelada'>Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl size='small' fullWidth>
                  <InputLabel id='or-estado-pago'>{d.paymentStatus ?? 'Estado pago'}</InputLabel>
                  <Select
                    labelId='or-estado-pago'
                    label={d.paymentStatus ?? 'Estado pago'}
                    value={estadoPago}
                    onChange={e => setEstadoPago(e.target.value)}
                  >
                    <MenuItem value=''>{common.all ?? 'Todas'}</MenuItem>
                    <MenuItem value='pendiente'>Pendiente</MenuItem>
                    <MenuItem value='confirmada'>Confirmada</MenuItem>
                    <MenuItem value='cancelada'>Cancelada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl size='small' fullWidth>
                  <InputLabel id='or-cancha'>{d.court ?? 'Cancha'}</InputLabel>
                  <Select
                    labelId='or-cancha'
                    label={d.court ?? 'Cancha'}
                    value={canchaId}
                    onChange={e => setCanchaId(e.target.value)}
                  >
                    <MenuItem value=''>{common.all ?? 'Todas'}</MenuItem>
                    {courtsList.map(c => (
                      <MenuItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2.4}>
                <TextField
                  label={d.searchClient ?? 'Cliente (nombre o email)'}
                  size='small'
                  fullWidth
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder='email@…'
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
                  <Typography variant='caption' color='text.secondary' sx={{ alignSelf: 'center', mr: 1 }}>
                    {d.pageSize ?? 'Por página'}:
                  </Typography>
                  <Select
                    size='small'
                    value={pagination.pageSize}
                    onChange={e => handlePageSizeChange(Number(e.target.value))}
                    sx={{ minWidth: 72 }}
                  >
                    {[5, 10, 25, 50].map(n => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button size='small' variant='text' color='secondary' onClick={handleResetFilters}>
                    {common.reset ?? 'Limpiar'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {loading ? (
              <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={32} />
              </Box>
            ) : rows.length === 0 ? (
              <Alert severity='info'>
                <Typography variant='subtitle1'>
                  {d.empty ?? 'No hay reservas para los filtros seleccionados.'}
                </Typography>
              </Alert>
            ) : (
              <TableContainer sx={{ borderRadius: 1, border: theme => `1px solid ${theme.palette.divider}` }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>{d.colTime ?? 'Horario'}</TableCell>
                      <TableCell>{d.colCourt ?? 'Cancha / Sede'}</TableCell>
                      <TableCell>{d.colClient ?? 'Cliente'}</TableCell>
                      <TableCell>{d.colReservation ?? 'Reserva'}</TableCell>
                      <TableCell>{d.colPayment ?? 'Pago'}</TableCell>
                      <TableCell align='right'>{d.colTotal ?? 'Total'}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => {
                      const cliente = row.cliente
                      const nombreCliente = [cliente?.first_name, cliente?.last_name].filter(Boolean).join(' ') || '—'
                      const pago = row.pagos?.[0]

                      return (
                        <TableRow key={row.id} hover>
                          <TableCell>
                            <Typography variant='body2' fontWeight={600}>
                              {row.hora_inicio} – {row.hora_fin}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {row.fecha}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>{row.cancha?.nombre ?? '—'}</Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {row.cancha?.sede?.name ?? ''}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant='body2'>{nombreCliente}</Typography>
                            <Typography variant='caption' color='text.secondary' display='block'>
                              {cliente?.email}
                            </Typography>
                            {cliente?.phone_number ? (
                              <Typography variant='caption' color='text.secondary'>
                                {cliente.phone_number}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size='small'
                              label={row.estado_reserva ?? '—'}
                              color={statusChipColor(row.estado_reserva)}
                              variant='tonal'
                            />
                            {row.notas ? (
                              <Typography variant='caption' color='text.secondary' display='block' sx={{ mt: 0.5 }}>
                                {row.notas}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            {pago ? (
                              <Stack spacing={0.5} alignItems='flex-start'>
                                <Chip
                                  size='small'
                                  label={pago.estado}
                                  color={statusChipColor(pago.estado)}
                                  variant='tonal'
                                />
                                <Typography variant='caption' color='text.secondary'>
                                  {pago.metodo_pago ?? '—'}
                                  {pago.fecha_pago
                                    ? ` · ${new Date(pago.fecha_pago).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}`
                                    : ''}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography variant='caption' color='text.secondary'>
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align='right'>
                            <Typography variant='body2' fontWeight={600}>
                              S/ {Number(row.total).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && rows.length > 0 ? (
              <Box className='flex justify-center pt-2'>
                <Pagination
                  count={totalPages}
                  page={pagination.currentPage}
                  showFirstButton
                  showLastButton
                  color='primary'
                  onChange={(_, p) => handlePageChange(p)}
                />
              </Box>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default OwnerReservationsIndex
