import { i18n } from '@configs/i18n'

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
