import { getDictionary } from '@/utils/getDictionary'
import HistoryUser from '@/views/history-user'

const HistoryUserApp = async ({ params }) => {
  const dictionary = await getDictionary(params.lang)
  return <HistoryUser dictionary={dictionary} lang={params.lang} />
}

export default HistoryUserApp
