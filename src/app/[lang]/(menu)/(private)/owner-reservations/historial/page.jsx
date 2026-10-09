import { redirect } from 'next/navigation'

const ReservationHistoryPage = ({ params }) => {
  redirect(`/${params.lang || 'es'}/owner-reservations`)
}

export default ReservationHistoryPage
