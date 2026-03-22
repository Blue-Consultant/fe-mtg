'use client'

import { useEffect, useState, useCallback } from 'react'

import { usePathname, useRouter } from 'next/navigation'

import { useSelector } from 'react-redux'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import { getUserModules } from '@/views/roles-modules-submodules/api'
import themeConfig from '@configs/themeConfig'
import { getLocalizedUrl } from '@/utils/i18n'
import {
  stripLocaleFromPath,
  collectSubmodulePrefixes,
  pathMatchesWhitelist,
  pathMatchesSubmodulePrefixes,
  isOwnerRole
} from '@/utils/moduleRoutes'

const readRolesFromStorage = () => {
  try {
    const raw = localStorage.getItem('userRoles')
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

const resolveUserId = reduxUser => {
  if (reduxUser?.id) return reduxUser.id
  try {
    const stored = localStorage.getItem('user')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed.id || parsed.user_id || null
  } catch {
    return null
  }
}

/**
 * Bloquea rutas del panel según submódulos del usuario (rolesmodulessubmodules / API user/:id/modules).
 * Los propietarios pasan sin comprobar prefijos. Refuerzo de UX; el backend debe seguir siendo la autoridad.
 */
const ModuleAccessGuard = ({ children, locale }) => {
  const pathname = usePathname()
  const router = useRouter()
  const reduxUser = useSelector(state => state.loginReducer?.user)
  const [ready, setReady] = useState(false)

  const verifyAccess = useCallback(async () => {
    const pathWithoutLocale = stripLocaleFromPath(pathname)

    if (pathMatchesWhitelist(pathWithoutLocale)) {
      setReady(true)
      return
    }

    const roles = readRolesFromStorage()
    if (isOwnerRole(roles)) {
      setReady(true)
      return
    }

    const userId = resolveUserId(reduxUser)
    if (!userId) {
      setReady(false)
      return
    }

    const { modules } = await getUserModules(userId, { silent: true })
    const prefixes = collectSubmodulePrefixes(modules)

    if (prefixes.length === 0) {
      router.replace(getLocalizedUrl(themeConfig.homePageUrl, locale))
      return
    }

    if (pathMatchesSubmodulePrefixes(pathWithoutLocale, prefixes)) {
      setReady(true)
      return
    }

    router.replace(getLocalizedUrl(themeConfig.homePageUrl, locale))
  }, [pathname, reduxUser, router, locale])

  useEffect(() => {
    verifyAccess()
  }, [verifyAccess])

  if (!ready) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  return <>{children}</>
}

export default ModuleAccessGuard
