import ExploreCourtDetailView from '@/views/explorar/ExploreCourtDetail'

export async function generateMetadata({ params }) {
  const id = params?.id
  const n = parseInt(id, 10)
  const label = !Number.isNaN(n) ? String(n) : ''

  return {
    title: label ? `Cancha ${label} · MTG` : 'Cancha · MTG',
    description: 'Horarios, precios y reserva de cancha deportiva.'
  }
}

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
