'use client'

import { Suspense } from 'react'

import PlayerCourtBoard from '@/views/explorar/PlayerCourtBoard'
import PlayerRouteFallback from '@/views/explorar/PlayerRouteFallback'

export default function ReservarPage() {
  return (
    <Suspense fallback={<PlayerRouteFallback />}>
      <PlayerCourtBoard />
    </Suspense>
  )
}
