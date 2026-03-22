import MisFavoritosIndex from '@/views/mis-favoritos'
import { getDictionary } from '@/utils/getDictionary'

const Page = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <MisFavoritosIndex dictionary={dictionary} />
}

export default Page
