import MisReservasIndex from '@/views/mis-reservas'
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <MisReservasIndex dictionary={dictionary} />
}

export default Page
