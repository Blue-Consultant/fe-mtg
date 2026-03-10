import { getDictionary } from '@/utils/getDictionary'
import RolesModulesSubmodules from '@/views/roles-modules-submodules'

// Component Imports
const RolesModulesSubmodulesApp = async ({ params }) => {
  // Vars
  const dictionary = await getDictionary(params.lang)
  return <RolesModulesSubmodules dictionary={dictionary} lang={params.lang} />
}

export default RolesModulesSubmodulesApp
