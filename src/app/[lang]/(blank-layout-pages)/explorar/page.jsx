'use client'

import { Suspense } from 'react'
import ExploreCourtsIndex from '@/views/explorar/ExploreCourtsIndex'
import Skeleton from '@mui/material/Skeleton'
import Box from '@mui/material/Box'

function ExplorarPageContent({ params }) {
  const lang = params.lang || 'es'
  return <ExploreCourtsIndex lang={lang} />
}

function ExplorarLoading() {
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

export default function ExplorarPage({ params }) {
  return (
    <Suspense fallback={<ExplorarLoading />}>
      <ExplorarPageContent params={params} />
    </Suspense>
  )
}
