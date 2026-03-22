'use client'

import { Suspense } from 'react'

import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

import ExploreCourtsIndex from '@/views/explorar/ExploreCourtsIndex'

function BuscarLoading() {
  return (
    <Box sx={{ py: 4, px: 2 }}>
      <Skeleton variant='text' width={280} height={40} sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} variant='rectangular' width={280} height={280} sx={{ borderRadius: 1 }} />
        ))}
      </Box>
    </Box>
  )
}

export default function ExplorarBuscarPage({ params }) {
  const lang = params?.lang || 'es'
  const pathParams = params?.params || []
  const [fecha, horaInicioEncoded, horaFinEncoded, courtTypeId] = pathParams
  const hora_inicio = horaInicioEncoded ? String(horaInicioEncoded).replace(/-/g, ':') : null
  const hora_fin = horaFinEncoded ? String(horaFinEncoded).replace(/-/g, ':') : null
  const court_type_id = courtTypeId ? Number(courtTypeId) : null

  const hasSearch = fecha && hora_inicio

  return (
    <Suspense fallback={<BuscarLoading />}>
      <ExploreCourtsIndex
        lang={lang}
        fecha={hasSearch ? fecha : undefined}
        hora_inicio={hora_inicio}
        hora_fin={hora_fin}
        court_type_id={court_type_id}
      />
    </Suspense>
  )
}
