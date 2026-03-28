'use client'

import { useEffect, useMemo, useState } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { getLocalizedUrl } from '@/utils/i18n'
import { getPaymentCheckoutStatus } from './api'

const copy = {
  success: {
    title: 'Pago aprobado',
    description:
      'Mercado Pago confirmó el pago. Tu reserva quedará confirmada cuando procesemos la notificación (suele ser en segundos).',
    severity: 'success'
  },
  failure: {
    title: 'No se completó el pago',
    description:
      'El pago fue rechazado o cancelado. Puedes intentar de nuevo desde la cancha o elegir otro medio de pago.',
    severity: 'error'
  },
  pending: {
    title: 'Pago pendiente',
    description:
      'Mercado Pago está procesando el pago. Te avisaremos o podrás revisar el estado de tu reserva en unos minutos.',
    severity: 'info'
  }
}

const POLL_MS = 2500
const POLL_MAX = 24

function parsePaymentId(searchParams) {
  const raw = searchParams.get('external_reference')

  if (raw == null || raw === '') return null
  const n = parseInt(String(raw), 10)

  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Pantallas públicas post-checkout (Mercado Pago). Prioriza componentes MUI.
 */
export default function PaymentReturnView({ variant = 'success', lang }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const staticText = copy[variant] || copy.success

  const paymentId = useMemo(() => parsePaymentId(searchParams), [searchParams])

  const [statusPayload, setStatusPayload] = useState(null)
  const [loadingStatus, setLoadingStatus] = useState(() => paymentId != null)
  const [pollExhausted, setPollExhausted] = useState(false)

  useEffect(() => {
    if (paymentId == null) {
      setLoadingStatus(false)

      return undefined
    }

    let cancelled = false
    let iterations = 0

    const tick = async () => {
      try {
        const data = await getPaymentCheckoutStatus(paymentId)

        if (cancelled) return
        setStatusPayload(data)
        setLoadingStatus(false)

        const terminal = data.estado_pago === 'confirmada' || data.estado_pago === 'cancelada'

        if (terminal) return 'stop'
      } catch {
        if (!cancelled) setLoadingStatus(false)
      }

      iterations += 1

      if (iterations >= POLL_MAX) {
        if (!cancelled) setPollExhausted(true)

        return 'stop'
      }

      return 'continue'
    }

    ;(async () => {
      let decision = await tick()

      while (!cancelled && decision === 'continue') {
        await new Promise(r => setTimeout(r, POLL_MS))
        if (cancelled) break
        decision = await tick()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [paymentId])

  const liveAlert = useMemo(() => {
    if (!statusPayload) return null
    const ep = statusPayload.estado_pago
    const er = statusPayload.estado_reserva

    if (ep === 'confirmada' && er === 'confirmada') {
      return {
        title: 'Reserva confirmada',
        description: 'Tu pago se registró y la reserva quedó confirmada en el sistema.',
        severity: 'success'
      }
    }

    if (ep === 'confirmada') {
      return {
        title: 'Pago confirmado',
        description:
          'El pago ya consta como confirmado; la reserva debería actualizarse en segundos. Si no cambia, recarga esta página.',
        severity: 'success'
      }
    }

    if (ep === 'cancelada' || er === 'cancelada') {
      return {
        title: 'Reserva no confirmada',
        description:
          'El pago no se completó, fue anulado o hubo un reembolso. Puedes intentar de nuevo desde la cancha.',
        severity: 'error'
      }
    }

    let description =
      'Estamos sincronizando con el servidor. Suele tardar unos segundos; esta página se actualiza sola.'

    if (pollExhausted) {
      description =
        'La confirmación está tardando. Puedes cerrar esta página y revisar tus reservas más tarde en tu cuenta.'
    }

    return {
      title: 'Procesando tu pago',
      description,
      severity: 'info'
    }
  }, [statusPayload, pollExhausted])

  const headline = liveAlert?.title ?? staticText.title
  const alertBody = liveAlert?.description ?? staticText.description
  const alertSeverity = liveAlert?.severity ?? staticText.severity

  const querySummary = useMemo(() => {
    const keys = ['payment_id', 'collection_id', 'collection_status', 'status', 'external_reference', 'preference_id']

    return keys
      .map(key => {
        const v = searchParams.get(key)

        return v ? { key, v } : null
      })
      .filter(Boolean)
  }, [searchParams])

  return (
    <Container maxWidth='sm' sx={{ py: { xs: 4, sm: 8 } }}>
      <Paper elevation={0} variant='outlined' sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant='overline' color='text.secondary' display='block' gutterBottom>
              Resultado del pago
            </Typography>
            <Typography variant='h4' component='h1' fontWeight={700} gutterBottom>
              {headline}
            </Typography>
            <Alert severity={alertSeverity} variant='outlined' sx={{ mt: 2 }}>
              {paymentId != null && loadingStatus && !statusPayload ? (
                <Stack direction='row' alignItems='center' spacing={2}>
                  <CircularProgress size={22} />
                  <span>Consultando estado en el servidor…</span>
                </Stack>
              ) : (
                alertBody
              )}
            </Alert>
          </Box>

          {statusPayload && (
            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                Estado en sistema
              </Typography>
              <Stack direction='row' flexWrap='wrap' gap={1} useFlexGap>
                <Chip size='small' variant='outlined' label={`Pago: ${statusPayload.estado_pago}`} />
                <Chip size='small' variant='outlined' label={`Reserva: ${statusPayload.estado_reserva}`} />
              </Stack>
            </Box>
          )}

          {querySummary.length > 0 && (
            <Box>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                Referencia (Mercado Pago)
              </Typography>
              <Stack direction='row' flexWrap='wrap' gap={1} useFlexGap>
                {querySummary.map(({ key, v }) => (
                  <Chip key={key} size='small' variant='outlined' label={`${key}: ${v}`} />
                ))}
              </Stack>
            </Box>
          )}

          <Divider />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant='contained'
              color='primary'
              fullWidth
              size='large'
              onClick={() => router.push(getLocalizedUrl('/explorar', lang))}
            >
              Volver a explorar canchas
            </Button>
            <Button
              variant='outlined'
              color='inherit'
              fullWidth
              size='large'
              onClick={() => router.push(getLocalizedUrl('/', lang))}
            >
              Inicio
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
