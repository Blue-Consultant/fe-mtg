// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import ViewContent from '@/views/contents/components/ViewContent'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

const ViewContentPage = async () => {
  const direction = 'ltr'
  const systemMode = await getSystemMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <ViewContent />
      </BlankLayout>
    </Providers>
  )
}

export default ViewContentPage


