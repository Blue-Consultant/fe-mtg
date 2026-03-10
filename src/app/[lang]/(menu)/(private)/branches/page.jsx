// MUI Imports
import BranchesIndex from '@/views/branches/index'
import { getDictionary } from '@/utils/getDictionary'

const BranchesPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <BranchesIndex dictionary={dictionary} />
}

export default BranchesPage
