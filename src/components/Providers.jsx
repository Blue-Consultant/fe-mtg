// Context Imports
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import { PermissionsProvider } from '@/contexts/permissionsContext'
import ThemeProvider from '@components/theme'
import ReduxProvider from '@/redux-store/ReduxProvider'

// Component Imports
import SessionValidator from '@/components/SessionValidator'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

// Styled Component Imports
import AppReactToastify from '@/libs/styles/AppReactToastify'

const Providers = async props => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()

  return (
    <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
      <VerticalNavProvider>
        <ReduxProvider>
          <PermissionsProvider>
            <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
              <ThemeProvider direction={direction} systemMode={systemMode}>
                  <SessionValidator />
                  {children}
                  <AppReactToastify direction={direction} hideProgressBar />
              </ThemeProvider>
            </SettingsProvider>
          </PermissionsProvider>
        </ReduxProvider>
      </VerticalNavProvider>
    </NextAuthProvider>
  )
}

export default Providers
