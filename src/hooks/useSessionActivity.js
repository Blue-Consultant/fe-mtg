import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
// import { touchSession } from '@/views/analytics/api'
// import { findLatestActiveByUser } from '@/views/analytics/api'

/**
 * Hook para detectar actividad del usuario y actualizar la sesión
 * Escucha eventos de mouse, teclado y scroll para determinar actividad real
 * El backend cerrará sesiones sin touch después del timeout configurado (por defecto 10 min)
 */
export const useSessionActivity = () => {
  const userData = useSelector((state) => state.loginReducer.user)

  const sessionIdRef = useRef(null)
  const lastTouchTimeRef = useRef(0)
  const touchTimeoutRef = useRef(null)

  // Tiempo mínimo entre touches para evitar llamadas excesivas
  const TOUCH_THROTTLE_MS = 60000

  useEffect(() => {
    if (!userData?.id) {
      return
    }

    // Función para obtener la sesión activa y hacer touch
    const touchActiveSession = async () => {
      try {

        console.log('[SessionActivity] Haciendo touch de la sesión')
        // Obtener la sesión activa más reciente si no la tenemos
        // if (!sessionIdRef.current) {
        //   const latestSession = await findLatestActiveByUser(userData.id)
        //   if (latestSession?.session_uuid) {
        //     sessionIdRef.current = latestSession.session_uuid
        //   }
        // }

        // if (sessionIdRef.current) {
        //   // Hacer touch de la sesión
        //   await touchSession(sessionIdRef.current)
        //   lastTouchTimeRef.current = Date.now()
        // }
      } catch (error) {
        // Si la sesión no existe o fue cerrada, limpiar la referencia
        if (error?.response?.status === 404) {
          sessionIdRef.current = null
        }
        console.debug('[SessionActivity] No se pudo actualizar sesión:', error.message)
      }
    }

    // Hacer touch inmediatamente al montar (inicializar sesión)
    touchActiveSession()

    // Manejador de actividad con throttle
    const handleActivity = () => {
      const now = Date.now()
      const timeSinceLastTouch = now - lastTouchTimeRef.current

      // Solo hacer touch si pasó suficiente tiempo desde el último
      if (timeSinceLastTouch >= TOUCH_THROTTLE_MS) {
        // Cancelar timeout pendiente si existe
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current)
        }

        // Programar touch con debounce de 1 segundo
        touchTimeoutRef.current = setTimeout(() => {
          touchActiveSession()
        }, 1000)
      }
    }

    // Eventos que indican actividad del usuario
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    // Registrar listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })

      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current)
        touchTimeoutRef.current = null
      }

      sessionIdRef.current = null
      lastTouchTimeRef.current = 0
    }
  }, [userData?.id])

  return null
}

