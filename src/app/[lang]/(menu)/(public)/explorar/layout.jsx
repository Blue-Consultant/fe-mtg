export async function generateMetadata({ params }) {
  const lang = params?.lang || 'es'

  return {
    title: lang === 'es' ? 'Explorar canchas · MTG' : 'Explore courts · MTG',
    description:
      lang === 'es'
        ? 'Busca canchas deportivas, compara horarios y reserva en pocos pasos.'
        : 'Find sports courts, compare schedules and book in a few steps.'
  }
}

export default function ExplorarSegmentLayout({ children }) {
  return children
}
