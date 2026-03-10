// Component Imports
import PermissionsIndex from '@/views/permissions'
import { getDictionary } from '@/utils/getDictionary'

const PermissionsRoute = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <PermissionsIndex dictionary={dictionary} />
}

export default PermissionsRoute
