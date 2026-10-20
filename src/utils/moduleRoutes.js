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
  '/login',
  '/login-admin',
  '/login-mtg',
  '/register-mtg',
  '/mis-favoritos',
  '/mis-reservas',
  '/booking'
]

export const MODULE_ROUTE_WHITELIST = [...MODULE_ROUTE_WHITELIST_CORE, ...PUBLIC_MENU_SHELL_PATHS]

/** Tablero operativo de sede (Horario). El menú lo muestra fijo; el empleado no lo tiene en RBAC legado. */
export const BRANCH_STAFF_OPERATIONAL_PATHS = ['/administrar']

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

const roleNameOf = role => String(role?.roleName ?? role?.name ?? role?.slug ?? '').toLowerCase()

const isNamedPlatformOwner = role => {
  const n = roleNameOf(role)

  return n === 'owner' || role?.is_owner === true || role?.isOwner === true
}

/**
 * Owner / propietario: acceso total al área privada (misma idea que permissionsContext).
 */
export const isOwnerRole = roles => {
  if (!Array.isArray(roles)) return false

  return roles.some(role => {
    const n = roleNameOf(role)

    return n === 'owner' || n === 'propietario'
  })
}

/** Owner de plataforma (no el propietario de sede). El módulo /users es solo suyo. */
export const isPlatformOwnerRole = roles => {
  if (!Array.isArray(roles)) return false

  return roles.some(isNamedPlatformOwner)
}

const STAFF_HIDDEN_LINKS = new Set(['/users'])

/** Quita submódulos de administración global (p. ej. Usuarios) para propietario/empleado. */
export const filterStaffHiddenSubmodules = modules =>
  (modules || [])
    .map(mod => ({
      ...mod,
      submodules: (mod.submodules || []).filter(sub => {
        const href = normalizeSubmoduleLink(sub.link)

        return href && !STAFF_HIDDEN_LINKS.has(href)
      })
    }))
    .filter(mod => (mod.submodules || []).length > 0)

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

/** Empleado de sede, sin ser propietario ni Owner. */
export const isEmployeeStaffRole = roles => {
  if (!Array.isArray(roles)) return false

  const names = roles.map(role => String(role.roleName ?? role.name ?? role.slug ?? '').toLowerCase())

  return names.includes('empleado') && !names.includes('propietario') && !names.includes('owner')
}

/** Panel MTG (mismo shell): Owner, propietario o empleado. */
export const isBranchAdminNav = roles => isPanelOperatorNav(roles)
