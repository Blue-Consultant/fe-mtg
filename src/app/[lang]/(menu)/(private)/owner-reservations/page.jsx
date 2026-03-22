import OwnerReservationsIndex from '@/views/owner-reservations'
import { getDictionary } from '@/utils/getDictionary'

const OwnerReservationsPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <OwnerReservationsIndex dictionary={dictionary} />
}

export default OwnerReservationsPage
