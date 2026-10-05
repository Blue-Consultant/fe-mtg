export async function generateMetadata({ params }) {
  const lang = params?.lang || 'es'

  return {
    title: lang === 'es' ? 'Canchas y horarios · MTG' : 'Courts and schedules · MTG',
    description:
      lang === 'es'
        ? 'Elige una cancha y mira al instante qué horarios están libres o reservados.'
        : 'Pick a court and see which times are free or already booked.'
  }
}

export default function ExplorarSegmentLayout({ children }) {
  return children
}
