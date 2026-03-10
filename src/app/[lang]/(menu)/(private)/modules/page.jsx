import { getDictionary } from '@/utils/getDictionary'
import Module from '@/views/modules'

// Component Imports
const ModuleApp = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params.lang)

  return <Module dictionary={dictionary} lang={params.lang} />
}

export default ModuleApp
