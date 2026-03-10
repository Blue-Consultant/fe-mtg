import RatingsIndex from '@/views/ratings/index'
import { getDictionary } from '@/utils/getDictionary'

const RatingsPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <RatingsIndex dictionary={dictionary} />
}

export default RatingsPage
