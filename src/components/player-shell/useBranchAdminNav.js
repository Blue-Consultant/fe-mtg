'use client'

import { useEffect, useState } from 'react'

import { useSelector } from 'react-redux'

import { getUserModules } from '@/views/roles-modules-submodules/api'
import { isPlatformOwnerRole, readBusinessRolesFromStorage } from '@/utils/moduleRoutes'

const normalizeLink = link => {
  if (link == null || String(link).trim() === '') return ''
  const value = String(link).trim()

  return value.startsWith('/') ? value : `/${value}`
}

const ADMIN_NAV_ORDER = [
  '/owner-reservations',
  '/administrar',
  '/dashboard',
  '/branches',
  '/empleados',
  '/explorar',
  '/court-types',
  '/ratings',
  '/users',
  '/roles',
  '/permissions',
  '/modules',
  '/sub-modules',
  '/roles-modules-submodules',
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

export function flattenBranchAdminLinks(modules, { includeSystemUsers = false } = {}) {
  const items = []
  const seen = new Set(['/explorar', '/profile', '/administrar'])

  const orderedModules = [...(modules || [])].sort((a, b) => (a.order || 0) - (b.order || 0))

  for (const currentModule of orderedModules) {
    const submodules = [...(currentModule.submodules || [])].sort((a, b) => (a.order || 0) - (b.order || 0))

    for (const submodule of submodules) {
      const href = normalizeLink(submodule.link)

      if (!href || seen.has(href)) continue
      if (!includeSystemUsers && href === '/users') continue

      seen.add(href)

      items.push({
        href,
        icon: submodule.icon || currentModule.icon || 'ri-circle-line',
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
    const includeSystemUsers = isPlatformOwnerRole(readBusinessRolesFromStorage())

    getUserModules(userId, { silent: true }).then(response => {
      if (!cancelled) setLinks(flattenBranchAdminLinks(response?.modules, { includeSystemUsers }))
    })

    return () => {
      cancelled = true
    }
  }, [enabled, userId])

  return links
}
