/**
 * Asegura `venue_id` coherente con Prisma cuando solo viene anidado `SportsVenue`.
 */
export const normalizeRoleRow = role => {
  if (!role || typeof role !== 'object') return role

  const venue_id = role.venue_id ?? role.SportsVenue?.id ?? null

  return { ...role, venue_id }
}
