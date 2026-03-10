import CourtTypesIndex from '@/views/court-types/index'
import { getDictionary } from '@/utils/getDictionary'

const CourtTypesPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <CourtTypesIndex dictionary={dictionary} />
}

export default CourtTypesPage
