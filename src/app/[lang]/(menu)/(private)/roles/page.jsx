// Component Imports
import RolesIndex from '@/views/roles'
import { getDictionary } from '@/utils/getDictionary'

const RolesRoute = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <RolesIndex dictionary={dictionary} />
}

export default RolesRoute
