'use client'

import { useEffect } from 'react'

// Next Imports
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * Redirección post-mount para no usar redirect() durante el render del cliente
 * (evita advertencias y comportamientos raros con el árbol de React).
 */
const AuthRedirect = ({ lang }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${pathname}?${queryString}` : pathname
    const redirectUrl = `/${lang}/login?redirectTo=${encodeURIComponent(fullPath)}`
    const login = `/${lang}/login`
    const homePage = getLocalizedUrl(themeConfig.homePageUrl, lang)
    const target = pathname === login ? login : pathname === homePage ? login : redirectUrl

    router.replace(target)
  }, [lang, pathname, router, searchParams])

  return null
}

export default AuthRedirect
