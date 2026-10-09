import { Suspense } from 'react'

import CourtInfo from '@/views/explorar/CourtInfo'
import PlayerRouteFallback from '@/views/explorar/PlayerRouteFallback'

const CourtInfoPage = ({ params }) => {
  const id = parseInt(params?.id, 10)
  const lang = params?.lang || 'es'

  if (Number.isNaN(id)) return null

  return (
    <Suspense fallback={<PlayerRouteFallback />}>
      <CourtInfo courtId={id} lang={lang} />
    </Suspense>
  )
}

export default CourtInfoPage
