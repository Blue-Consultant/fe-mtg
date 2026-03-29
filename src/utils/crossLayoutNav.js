import { stripLocaleFromPath } from '@/utils/routePaths'

/**
 * Rutas que usan (blank-layout-pages): la navegación cliente hacia (menu) rompe el LayoutRouter
 * (parallelRouterKey null). Desde aquí, enlaces al shell menú deben ser navegación completa.
 */
const BLANK_LAYOUT_PREFIXES = ['/login', '/register', '/separa-tu-cancha', '/payment']

export function isBlankLayoutPath(pathname) {
  const p = stripLocaleFromPath(pathname || '')

  return BLANK_LAYOUT_PREFIXES.some(prefix => p === prefix || p.startsWith(`${prefix}/`))
}
