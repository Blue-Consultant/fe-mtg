// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Lib Imports
import { authOptions } from '@/libs/auth'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * HOC de ejemplo para rutas “solo invitado”. /login y /register están en (blank-layout-pages)
 * sin este wrapper para no redirigir al home cuando aún hay cookie de sesión.
 */
const GuestOnlyRoute = async ({ children, lang }) => {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(getLocalizedUrl(themeConfig.homePageUrl, lang))
  }

  return <>{children}</>
}

export default GuestOnlyRoute
