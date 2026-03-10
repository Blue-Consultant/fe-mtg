import CourtDetailView from '@/views/courts/CourtDetail'

const CourtDetailPage = ({ params }) => {
  const id = parseInt(params.id, 10)
  const lang = params.lang
  if (Number.isNaN(id)) {
    return null
  }
  return <CourtDetailView courtId={id} lang={lang} />
}

export default CourtDetailPage
