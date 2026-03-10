import { useEffect, useRef } from 'react'

import { usePathname, useParams } from 'next/navigation'

import { useSelector } from 'react-redux'

// import { findLatestActiveByUser, trackPageView } from '@/views/analytics/api'
import { getRolePermissions } from '@/views/roles-modules-submodules/api'

/**
 * Funci?n helper para encontrar m?dulo y subm?dulo desde una ruta
 */
const findModuleSubmoduleFromRoute = (route, modules) => {
  if (!route || !modules || !modules.length) return { module: null, submodule: null }

  // Normalizar la ruta (remover el locale si existe)
  const normalizedRoute = route.replace(/^\/[a-z]{2}/, '')

  for (const mod of modules) {
    if (mod.submodules && mod.submodules.length > 0) {
      for (const submodule of mod.submodules) {
        const subLink = submodule.link?.startsWith('/') ? submodule.link : `/${submodule.link}`

        // Verificar si la ruta coincide exactamente o empieza con el link del subm?dulo
        if (normalizedRoute === subLink || normalizedRoute.startsWith(subLink + '/')) {
          return {
            module: {
              id: mod.id,
              name: mod.name,
              translate: mod.translate
            },
            submodule: {
              id: submodule.id,
              name: submodule.name,
              translate: submodule.translate
            }
          }
        }
      }
    }
  }

  return { module: null, submodule: null }
}

/**
 * Hook para rastrear las p?ginas/rutas visitadas por el usuario
 * Registra autom?ticamente cada cambio de ruta en la sesi?n activa
 */
export const usePageTracking = () => {
  const pathname = usePathname()
  const params = useParams()
  const userData = useSelector(state => state.loginReducer.user)
  const sessionIdRef = useRef(null)
  const lastPathRef = useRef(null)
  const modulesRef = useRef([])

  // Cargar m?dulos y subm?dulos del usuario
  useEffect(() => {
    if (!userData?.id) return

    const loadModules = async () => {
      try {
        const roleId = userData.Branches_users?.[0]?.rol_id || userData.role_id

        if (roleId) {
          const response = await getRolePermissions(roleId)

          modulesRef.current = response?.modules || []
        }
      } catch (error) {
        console.debug('[PageTracking] No se pudieron cargar m?dulos:', error.message)
      }
    }

    loadModules()
  }, [userData?.id])

  useEffect(() => {
    if (!userData?.id || !pathname) {
      return
    }

    // Evitar registrar la misma ruta dos veces
    if (lastPathRef.current === pathname) {
      return
    }

    const trackRoute = async () => {
      try {
        console.log('[PageTracking] Registrando ruta:', pathname)

        // Obtener la sesi?n activa m?s reciente
        // const latestSession = await findLatestActiveByUser(userData.id)

        // if (latestSession?.session_uuid) {
        //   sessionIdRef.current = latestSession.session_uuid

        //   // Obtener el t?tulo de la p?gina si est? disponible
        //   const pageTitle = typeof document !== 'undefined' ? document.title : pathname

        //   // Obtener el referrer si est? disponible
        //   const referrer = typeof document !== 'undefined' ? document.referrer : null

        //   // Buscar m?dulo y subm?dulo desde la ruta
        //   const { module, submodule } = findModuleSubmoduleFromRoute(pathname, modulesRef.current)

        //   // Registrar la visita de p?gina con informaci?n de m?dulo/subm?dulo
        //   await trackPageView(
        //     latestSession.session_uuid,
        //     pathname,
        //     pageTitle,
        //     referrer,
        //     module,
        //     submodule
        //   )

        //   lastPathRef.current = pathname
        //   // Removido console.debug para mejorar rendimiento - usar React DevTools para debugging
        // }
      } catch (error) {
        // No mostrar error si no hay sesi?n activa o si falla
        console.debug('[PageTracking] No se pudo registrar ruta:', error.message)
      }
    }

    // Peque?o delay para asegurar que la p?gina est? completamente cargada
    const timeoutId = setTimeout(() => {
      trackRoute()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname, userData?.id])

  return null
}
