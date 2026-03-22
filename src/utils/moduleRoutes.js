import { i18n } from '@configs/i18n'

/** Rutas privadas que cualquier usuario autenticado puede abrir (cuenta / flujos propios). */
export const MODULE_ROUTE_WHITELIST = [
  '/profile',
  '/user-profile',
  '/account-settings',
  '/recovery-password',
  '/payment-success',
  '/login-mtg',
  '/register-mtg',
  '/mis-favoritos',
  '/mis-reservas',
  '/booking',
  '/explorar'
]

/**
 * Quita el segmento de idioma inicial si existe (p. ej. /es/courts/1 → /courts/1).
 */
export const stripLocaleFromPath = pathname => {
  if (!pathname) return '/'
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return '/'
  if (i18n.locales.includes(parts[0])) {
    const rest = parts.slice(1)
    return rest.length ? `/${rest.join('/')}` : '/'
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`
}

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
  return prefixes.some(
    prefix => pathWithoutLocale === prefix || pathWithoutLocale.startsWith(`${prefix}/`)
  )
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
export const isPanelOperatorNav = roles =>
  isOwnerRole(roles) || isPanelStaffRole(roles)
