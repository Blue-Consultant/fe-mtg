// MUI Imports

// Component Imports
import Users from '@/views/users'
import { getDictionary } from '@/utils/getDictionary'

const UsersApp = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <Users dictionary={dictionary} lang={params.lang} />
}

export default UsersApp
