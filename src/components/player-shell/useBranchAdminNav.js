'use client'

import { useEffect, useState } from 'react'

import { useSelector } from 'react-redux'

import { getUserModules } from '@/views/roles-modules-submodules/api'

const normalizeLink = link => {
  if (link == null || String(link).trim() === '') return ''
  const value = String(link).trim()

  return value.startsWith('/') ? value : `/${value}`
}

const ADMIN_NAV_ORDER = [
  '/administrar',
  '/dashboard',
  '/owner-reservations',
  '/branches',
  '/empleados',
  '/explorar',
  '/price-schedules',
  '/date-blocks',
  '/court-types',
  '/ratings',
  '/users',
  '/mis-reservas',
  '/profile'
]

export function orderBranchAdminNav(items) {
  const rank = href => {
    if (href === '/profile') return 1000

    const index = ADMIN_NAV_ORDER.indexOf(href)

    return index === -1 ? 900 : index
  }

  return [...items].sort((a, b) => rank(a.href) - rank(b.href) || a.label.localeCompare(b.label, 'es'))
}

export function flattenBranchAdminLinks(modules) {
  const items = []
  const seen = new Set(['/explorar', '/profile'])
  const orderedModules = [...(modules || [])].sort((a, b) => (a.order || 0) - (b.order || 0))

  for (const module of orderedModules) {
    const submodules = [...(module.submodules || [])].sort((a, b) => (a.order || 0) - (b.order || 0))

    for (const submodule of submodules) {
      const href = normalizeLink(submodule.link)

      if (!href || seen.has(href)) continue
      seen.add(href)
      items.push({
        href,
        icon: submodule.icon || module.icon || 'ri-circle-line',
        label: submodule.name || submodule.translate || 'Sección'
      })
    }
  }

  return items
}

export function useBranchAdminNav(enabled) {
  const userId = useSelector(state => state.loginReducer.user?.id)
  const [links, setLinks] = useState([])

  useEffect(() => {
    if (!enabled || !userId) {
      setLinks([])

      return undefined
    }

    let cancelled = false

    getUserModules(userId, { silent: true }).then(response => {
      if (!cancelled) setLinks(flattenBranchAdminLinks(response?.modules))
    })

    return () => {
      cancelled = true
    }
  }, [enabled, userId])

  return links
}
