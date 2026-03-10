import ExploreCourtDetailView from '@/views/explorar/ExploreCourtDetail'

/**
 * Ruta con slug opcional para SEO (ej: /explorar/1/cancha-futbol-sede-norte).
 * /explorar/1 y /explorar/1/cualquier-slug muestran el mismo detalle (id es la fuente de verdad).
 */
const ExplorarCourtDetailPage = ({ params }) => {
  const id = parseInt(params?.id, 10)
  const lang = params?.lang || 'es'

  if (Number.isNaN(id)) {
    return null
  }

  return <ExploreCourtDetailView courtId={id} lang={lang} />
}

export default ExplorarCourtDetailPage
