// Segmento async separado para que el layout sync pueda envolver Suspense (evita flash en blanco).
import Providers from '@components/Providers'
import HorizontalLayout from '@layouts/HorizontalLayout'
import Header from '@components/layout/horizontal/Header'

import { i18n } from '@configs/i18n'

import { getDictionary } from '@/utils/getDictionary'

const BlankLayoutContent = async ({ children, params }) => {
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params?.lang)

  return (
    <Providers direction={direction}>
      <HorizontalLayout header={<Header dictionary={dictionary} forceFullWidthNavbar />}>{children}</HorizontalLayout>
    </Providers>
  )
}

export default BlankLayoutContent
