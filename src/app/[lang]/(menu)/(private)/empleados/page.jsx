import OwnerEmployeesView from '@/views/employees/OwnerEmployeesView'
import { getDictionary } from '@/utils/getDictionary'

const EmpleadosPage = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <OwnerEmployeesView dictionary={dictionary} />
}

export default EmpleadosPage
