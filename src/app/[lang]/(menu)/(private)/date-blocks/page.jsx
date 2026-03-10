import DateBlocksIndex from '@/views/date-blocks/index'
import { getDictionary } from '@/utils/getDictionary'

const DateBlocksPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <DateBlocksIndex dictionary={dictionary} />
}

export default DateBlocksPage
