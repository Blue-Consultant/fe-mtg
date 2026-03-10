import { NextResponse } from 'next/server'

const DEFAULT_LOCALE = 'es'
const DEFAULT_PATH = '/separa-tu-cancha'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const basePath = process.env.BASEPATH || ''

  // Raíz exacta: / o basePath solo → redirigir a /es/separa-tu-cancha
  const rootMatch = basePath
    ? pathname === basePath || pathname === `${basePath}/`
    : pathname === '/' || pathname === ''

  if (rootMatch) {
    const url = request.nextUrl.clone()

    url.pathname = basePath ? `${basePath}/${DEFAULT_LOCALE}${DEFAULT_PATH}` : `/${DEFAULT_LOCALE}${DEFAULT_PATH}`

    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Solo ejecutar en la raíz para redirigir a /es/separa-tu-cancha
  matcher: ['/']
}
