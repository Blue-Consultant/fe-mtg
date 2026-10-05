'use client'

import { useMemo } from 'react'

import { usePublishedCourts } from './usePublishedCourts'

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=640&h=360&fit=crop'

const formatAddress = venue => [venue?.address, venue?.city].filter(Boolean).join(', ')

const groupVenues = courts => {
  const map = new Map()

  courts.forEach(court => {
    const venue = court.SportsVenue
    const key = venue?.id

    if (!key) return

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: venue.name || 'Sede',
        company: venue.company_name && venue.company_name !== venue.name ? venue.company_name : '',
        address: formatAddress(venue),
        phone: String(venue.phone_number || '').trim(),
        email: String(venue.email || '').trim(),
        image: venue.logo || court.imagen || DEFAULT_IMAGE,
        courts: 0,
        sports: new Set()
      })
    }

    const entry = map.get(key)

    entry.courts += 1
    if (court.court_types?.nombre) entry.sports.add(court.court_types.nombre)
    if (!venue.logo && court.imagen && entry.image === DEFAULT_IMAGE) entry.image = court.imagen
  })

  return Array.from(map.values())
    .map(venue => ({ ...venue, sports: Array.from(venue.sports) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function useVenueCatalog() {
  const { courts, loading, loadError } = usePublishedCourts(
    'No pudimos cargar las sedes. Revisa que el servidor esté activo.'
  )

  const venues = useMemo(() => groupVenues(courts), [courts])

  return { venues, loading, loadError }
}
