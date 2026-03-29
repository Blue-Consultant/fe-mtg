// Landing “Marca tu gol”: bajo (menu) para mantener header al navegar desde /explorar (mismo layout).
import HomeIndex from '@/views/home/index'
import { getDictionary } from '@/utils/getDictionary'

const HomeRoute = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)

  return <HomeIndex dictionary={dictionary} lang={params.lang} />
}

export default HomeRoute
