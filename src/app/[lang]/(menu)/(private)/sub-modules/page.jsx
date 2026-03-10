import { getDictionary } from '@/utils/getDictionary'
import SubModule from '@/views/sub-modules'

// Component Imports
const SubModuleApp = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params.lang)

  return <SubModule dictionary={dictionary} lang={params.lang} />
}

export default SubModuleApp
