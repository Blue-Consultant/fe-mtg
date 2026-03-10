
// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import ViewClient from '@/views/contents/components/ViewContent';

import { componentKey } from '@/libs/puck/puckConfig';

// Util Imports
import { getSystemMode, getServerMode } from '@core/utils/serverHelpers'

const ViewPage = async () => {

  // Vars
  const direction = 'ltr'
  const systemMode = await getSystemMode()
  const mode = await getServerMode()

  return (
    <Providers direction={direction}>
      <BlankLayout systemMode={systemMode}>
        <ViewClient componentKey={componentKey} />
      </BlankLayout>
    </Providers>
  )
}

export default ViewPage


