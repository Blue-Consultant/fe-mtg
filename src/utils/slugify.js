/**
 * Genera un slug SEO-friendly para URLs (ej: "Cancha Fútbol Sede Norte" -> "cancha-futbol-sede-norte")
 */
export function slugify(text) {
  if (!text || typeof text !== 'string') return ''

  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Slug para enlace a detalle de cancha (id + nombre)
 */
export function courtDetailSlug(court) {
  const name = court?.nombre || court?.name || 'cancha'
  const slug = slugify(name)

  return slug || 'cancha'
}
