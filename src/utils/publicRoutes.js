import { stripLocaleFromPath } from '@/utils/routePaths'

/**
 * Rutas del shell (menu) accesibles sin usuario en Redux (producto público).
 * Debe alinearse con MODULE_ROUTE_WHITELIST (explorar + landing) para ModuleAccessGuard.
 */
export const PUBLIC_MENU_SHELL_PATHS = ['/marca-tu-gol', '/explorar']

/**
 * ¿La URL actual es landing o exploración pública (incluye subrutas)?
 */
export function isPublicMenuShellPath(pathname) {
  const rest = stripLocaleFromPath(pathname || '')

  return PUBLIC_MENU_SHELL_PATHS.some(base => rest === base || rest.startsWith(`${base}/`))
}

/**
 * Nota de auth (server vs cliente):
 * - AuthGuard acepta sesión NextAuth o cookies httpOnly del API (accessToken/refreshToken).
 * - Esas cookies solo llegan al servidor de Next si comparten dominio (o proxy) con el front.
 * - En local con API en otro puerto, el RSC puede no ver accessToken; cuenta NextAuth + flujo cliente.
 */
