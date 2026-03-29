import { PUBLIC_MENU_SHELL_PATHS } from '@/utils/publicRoutes'
import { stripLocaleFromPath } from '@/utils/routePaths'

export { stripLocaleFromPath }

/** Rutas que un usuario autenticado puede abrir sin chequeo de submódulos (cuenta + público producto). */
const MODULE_ROUTE_WHITELIST_CORE = [
  '/profile',
  '/user-profile',
  '/account-settings',
  '/recovery-password',
  '/payment-success',
  '/login-mtg',
  '/register-mtg',
  '/mis-favoritos',
  '/mis-reservas',
  '/booking'
]

export const MODULE_ROUTE_WHITELIST = [...MODULE_ROUTE_WHITELIST_CORE, ...PUBLIC_MENU_SHELL_PATHS]

export const normalizeSubmoduleLink = link => {
  if (link == null || String(link).trim() === '') return null
  const l = String(link).trim()

  return l.startsWith('/') ? l : `/${l}`
}

/**
 * Prefijos permitidos desde la respuesta de user/:id/modules (submódulos con link).
 */
export const collectSubmodulePrefixes = modules => {
  const set = new Set()

  for (const mod of modules || []) {
    for (const sub of mod.submodules || []) {
      const p = normalizeSubmoduleLink(sub.link)

      if (p) set.add(p)
    }
  }

  return [...set].sort((a, b) => b.length - a.length)
}

export const pathMatchesWhitelist = (pathWithoutLocale, whitelist = MODULE_ROUTE_WHITELIST) => {
  if (!pathWithoutLocale || pathWithoutLocale === '/') return false

  return whitelist.some(w => pathWithoutLocale === w || pathWithoutLocale.startsWith(`${w}/`))
}

export const pathMatchesSubmodulePrefixes = (pathWithoutLocale, prefixes) => {
  if (!pathWithoutLocale || pathWithoutLocale === '/') return false

  return prefixes.some(prefix => pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`))
}

/**
 * Owner / propietario: acceso total al área privada (misma idea que permissionsContext).
 */
export const isOwnerRole = roles => {
  if (!Array.isArray(roles)) return false

  return roles.some(role => {
    const raw = role.roleName ?? role.name ?? role.slug ?? ''
    const n = String(raw).toLowerCase()

    return n === 'owner' || n === 'propietario'
  })
}

export const readBusinessRolesFromStorage = () => {
  try {
    const raw = localStorage.getItem('userRoles')

    if (!raw) return []

    return JSON.parse(raw)
  } catch {
    return []
  }
}

/** Propietario, Empleado (panel operativo). Owner se cubre con isOwnerRole en el menú. */
export const isPanelStaffRole = roles => {
  if (!Array.isArray(roles)) return false

  return roles.some(role => {
    const n = String(role.roleName ?? role.name ?? role.slug ?? '').toLowerCase()

    return n === 'propietario' || n === 'empleado'
  })
}

/** Menú superior tipo backoffice: Owner, propietario o empleado. */
export const isPanelOperatorNav = roles => isOwnerRole(roles) || isPanelStaffRole(roles)
