

// MUI Imports
import HomeIndex from '@/views/home/index'
import { getDictionary } from '@/utils/getDictionary'
// Component Imports
const HomeRoute = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <HomeIndex dictionary={dictionary} lang={params.lang}/>
}

export default HomeRoute
