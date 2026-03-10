// MUI Imports
import CourtsIndex from '@/views/courts/index'
import { getDictionary } from '@/utils/getDictionary'

const CourtsPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <CourtsIndex dictionary={dictionary} />
}

export default CourtsPage
