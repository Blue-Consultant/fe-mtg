import BookingIndex from '@/views/booking'
import { getDictionary } from '@/utils/getDictionary'

const BookingPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <BookingIndex dictionary={dictionary} lang={params.lang} />
}

export default BookingPage
