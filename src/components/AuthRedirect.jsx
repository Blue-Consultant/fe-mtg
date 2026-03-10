'use client'

// Next Imports
import { redirect, usePathname, useSearchParams } from 'next/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const AuthRedirect = ({ lang }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const fullPath = queryString ? `${pathname}?${queryString}` : pathname

  const redirectUrl = `/${lang}/login?redirectTo=${encodeURIComponent(fullPath)}`
  const login = `/${lang}/login`
  const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)

  return redirect(pathname === login ? login : pathname === homePage ? login : redirectUrl)
}

export default AuthRedirect

