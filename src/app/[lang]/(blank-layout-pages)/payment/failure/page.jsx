import { Suspense } from 'react'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import PaymentReturnView from '@/views/payment-return/PaymentReturnView'

export const metadata = {
  title: 'Pago no completado',
  description: 'El pago no se completó — Marca tu gol'
}

function LoadingFallback() {
  return (
    <Box display='flex' justifyContent='center' alignItems='center' minHeight={240}>
      <CircularProgress />
    </Box>
  )
}

export default function PaymentFailurePublicPage({ params }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentReturnView variant='failure' lang={params.lang} />
    </Suspense>
  )
}
