import { useEffect, useRef } from 'react'
import { usePathname, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
// import { findLatestActiveByUser, trackPageView } from '@/views/analytics/api'
import { getRolePermissions } from '@/views/roles-modules-submodules/api'

/**
 * Función helper para encontrar módulo y submódulo desde una ruta
 */
const findModuleSubmoduleFromRoute = (route, modules) => {
  if (!route || !modules || !modules.length) return { module: null, submodule: null }
  
  // Normalizar la ruta (remover el locale si existe)
  const normalizedRoute = route.replace(/^\/[a-z]{2}/, '')
  
  for (const module of modules) {
    if (module.submodules && module.submodules.length > 0) {
      for (const submodule of module.submodules) {
        const subLink = submodule.link?.startsWith('/') ? submodule.link : `/${submodule.link}`
        
        // Verificar si la ruta coincide exactamente o empieza con el link del submódulo
        if (normalizedRoute === subLink || normalizedRoute.startsWith(subLink + '/')) {
          return {
            module: {
              id: module.id,
              name: module.name,
              translate: module.translate
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
 * Hook para rastrear las páginas/rutas visitadas por el usuario
 * Registra automáticamente cada cambio de ruta en la sesión activa
 */
export const usePageTracking = () => {
  const pathname = usePathname()
  const params = useParams()
  const userData = useSelector((state) => state.loginReducer.user)
  const sessionIdRef = useRef(null)
  const lastPathRef = useRef(null)
  const modulesRef = useRef([])

  // Cargar módulos y submódulos del usuario
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
        console.debug('[PageTracking] No se pudieron cargar módulos:', error.message)
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
        // Obtener la sesión activa más reciente
        // const latestSession = await findLatestActiveByUser(userData.id)
        
        // if (latestSession?.session_uuid) {
        //   sessionIdRef.current = latestSession.session_uuid
          
        //   // Obtener el título de la página si está disponible
        //   const pageTitle = typeof document !== 'undefined' ? document.title : pathname
          
        //   // Obtener el referrer si está disponible
        //   const referrer = typeof document !== 'undefined' ? document.referrer : null
          
        //   // Buscar módulo y submódulo desde la ruta
        //   const { module, submodule } = findModuleSubmoduleFromRoute(pathname, modulesRef.current)
          
        //   // Registrar la visita de página con información de módulo/submódulo
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
        // No mostrar error si no hay sesión activa o si falla
        console.debug('[PageTracking] No se pudo registrar ruta:', error.message)
      }
    }

    // Pequeño delay para asegurar que la página está completamente cargada
    const timeoutId = setTimeout(() => {
      trackRoute()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname, userData?.id])

  return null
}

