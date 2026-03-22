import OwnerDashboard from '@/views/dashboard/OwnerDashboard'
import { getDictionary } from '@/utils/getDictionary'

const DashboardPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <OwnerDashboard dictionary={dictionary} />
}

export default DashboardPage
