// Component Imports
import Providers from '@components/Providers'
import HorizontalLayout from '@layouts/HorizontalLayout'
import Header from '@components/layout/horizontal/Header'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'

const Layout = async ({ children, params }) => {
  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params?.lang)

  return (
    <Providers direction={direction}>
      <HorizontalLayout header={<Header dictionary={dictionary} />}>{children}</HorizontalLayout>
    </Providers>
  )
}

export default Layout
