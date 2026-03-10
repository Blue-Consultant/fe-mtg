// MUI Imports
import PriceSchedulesIndex from '@/views/price-schedules/index'
import { getDictionary } from '@/utils/getDictionary'

const PriceSchedulesPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <PriceSchedulesIndex dictionary={dictionary} />
}

export default PriceSchedulesPage
