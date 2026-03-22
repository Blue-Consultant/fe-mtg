import { NextResponse } from 'next/server'

import { i18n } from './configs/i18n'

const DEFAULT_LOCALE = i18n.defaultLocale || 'es'
const DEFAULT_PATH = '/marca-tu-gol'

function stripBasePath(pathname, basePath) {
  if (!basePath) return pathname
  if (pathname === basePath || pathname === `${basePath}/`) return '/'
  if (pathname.startsWith(`${basePath}/`)) {
    const rest = pathname.slice(basePath.length)
    return rest && rest.startsWith('/') ? rest : `/${rest}`
  }
  return pathname
}

export function middleware(request) {
  const { pathname } = request.nextUrl
  const basePath = process.env.BASEPATH || ''
  const logical = stripBasePath(pathname, basePath)

  const isRoot = logical === '/' || logical === ''
  const localeOnly =
    i18n.locales?.some(loc => logical === `/${loc}` || logical === `/${loc}/`) ?? false

  if (isRoot || localeOnly) {
    const url = request.nextUrl.clone()
    let locale = DEFAULT_LOCALE
    if (localeOnly && i18n.locales?.length) {
      const found = i18n.locales.find(loc => logical === `/${loc}` || logical === `/${loc}/`)
      if (found) locale = found
    }

    const suffix = `/${locale}${DEFAULT_PATH}`.replace(/\/{2,}/g, '/')
    url.pathname = basePath ? `${basePath.replace(/\/$/, '')}${suffix}` : suffix

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
