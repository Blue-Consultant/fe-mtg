import { Suspense } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import PaymentReturnView from '@/views/payment-return/PaymentReturnView'

export const metadata = {
  title: 'Pago pendiente',
  description: 'Pago en proceso — Marca tu gol'
}

function LoadingFallback() {
  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight={240}>
      <CircularProgress />
    </Box>
  )
}

export default function PaymentPendingPublicPage({ params }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentReturnView variant='pending' lang={params.lang} />
    </Suspense>
  )
}
