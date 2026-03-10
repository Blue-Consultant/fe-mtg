import { useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import axios from '@/utils/axios'
import { logout } from '@/redux-store/slices/login'
import { persistor } from '@/redux-store'
import { io } from "socket.io-client"; // Importar socket.io-client

/**
 * Hook para validar la sesión del usuario de forma proactiva
 * Verifica periódicamente que el refresh token siga siendo válido
 *
 * Configuración:
 * - Intervalo de verificación: 5 minutos
 * - Timeout de petición: 10 segundos
 * - URL del socket: Usar variable de entorno o fallback a localhost
 */
export const useSessionValidator = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const dispatch = useDispatch()
  const loginUser = useSelector(state => state.loginReducer.user)
  const isValidatingRef = useRef(false)
  // Se mantiene la referencia anterior por si en un futuro retomamos el manejo de timeouts individuales.
  const timeoutRef = useRef(null)
  /**
   * Marcador opcional para deduplicar la validación inicial. Déjalo en `false`
   * si quieres observar el comportamiento original (validación en cada render).
   * En la reunión podemos decidir si activarlo definitivamente.
   */
  const hasValidatedInitialRef = useRef(false)
  const shouldDeduplicateInitialValidation = true
  const socketRef = useRef(null); // Referencia para el socket

  useEffect(() => {
    // Solo ejecutar si el usuario está autenticado
    if (status !== 'authenticated' || !session) {
      // Si perdemos la sesión, habilitamos nuevamente la validación inicial
      hasValidatedInitialRef.current = false
      // Limpiar conexión WebSocket si no hay sesión activa
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return
    }

    /**
     * Nueva lógica: en modo desarrollo (StrictMode) React puede montar/desmontar
     * el componente dos veces; este guard evita volver a disparar la petición
     * de validación inicial. Si decidimos no usarlo, basta con poner el flag en false.
     */
    if (shouldDeduplicateInitialValidation) {
      if (hasValidatedInitialRef.current) {
        return
      }
      hasValidatedInitialRef.current = true
    }

    // --- Lógica de WebSockets ---
    // Solo establecer conexión si no existe y si el usuario está autenticado
    const getUserId = () => {
      if (session?.user?.id) return String(session.user.id)
      if (loginUser?.id) return String(loginUser.id)
      if (loginUser?.user_id) return String(loginUser.user_id)
      return null
    }

    if (!socketRef.current) {
      const userId = getUserId()

      if (!userId) {
        return
      }

      const SOCKET_URL =
        process.env.NEXT_PUBLIC_SERVER_API ??
        (process.env.NEXT_PUBLIC_API_URL
          ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
          : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:6100')); 

      socketRef.current = io(SOCKET_URL, {
        query: { userId: userId },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
      });

      socketRef.current.on('disconnect', () => {
      });

      socketRef.current.on('ActionsRequest', (payload) => {
        if (payload.action === 'logout' && String(payload.userId) === userId) {
          // Optimización: Usar requestAnimationFrame para no bloquear el hilo principal
          requestAnimationFrame(() => {
            const forced = Boolean(payload?.forced)
            const reason = payload?.reason || (forced ? 'admin' : 'self')

            if (forced) {
              const forcedMessage = reason === 'inactive'
                ? 'Tu sesión ha sido cerrada por inactividad.'
                : 'Tu sesión ha sido cerrada por un administrador.'
              sessionStorage.setItem('sessionExpiredMessage', forcedMessage)
            } else {
              sessionStorage.removeItem('sessionExpiredMessage')
            }

            // Agrupar operaciones de localStorage en un solo bloque
            try {
              localStorage.removeItem('userPermissions');
              localStorage.removeItem('userRoles');
              localStorage.removeItem('persist:root');
              localStorage.removeItem('persist:login');
            } catch (e) {
              console.debug('Error clearing localStorage:', e)
            }

            // Ejecutar dispatch y operaciones pesadas en el siguiente frame
            requestAnimationFrame(() => {
              dispatch(logout());
              persistor.purge();
              signOut({ redirect: false });
              router.replace('/es/login');
            })
          })
        }
      });

      socketRef.current.on('connect_error', (err) => {
      });
    }
    // --- Fin Lógica de WebSockets ---

    const validateSession = async () => {
      // Evitar múltiples validaciones simultáneas
      if (isValidatingRef.current) {
        return
      }

      isValidatingRef.current = true

      try {
        // Intentar refrescar el token para verificar que el refresh token sigue siendo válido
        // Si el refresh token expiró, este endpoint devolverá 401
        await axios.post('/user/refresh', {}, {
          timeout: 10000,
          // No reintentar en caso de error 401
          _skipRetry: true
        })

      } catch (error) {
        const errorCode = error?.response?.data?.code

        // Si el refresh token expiró, hacer logout
        if (error?.response?.status === 401 || errorCode === 'REFRESH_TOKEN_EXPIRED') {

          // Limpiar estado local
          localStorage.removeItem('userPermissions')
          localStorage.removeItem('userRoles')
          localStorage.removeItem('persist:root')
          localStorage.removeItem('persist:login')

          dispatch(logout())
          await persistor.purge()

          // Guardar mensaje de expiración
          sessionStorage.setItem('sessionExpiredMessage',
            error?.response?.data?.message || 'Tu sesión ha expirado por inactividad.'
          )

          // Cerrar sesión de NextAuth
          await signOut({
            redirect: false
          })

          // Redirigir al login
          router.replace('/es/login')
        }
      } finally {
        isValidatingRef.current = false
      }
    }

    // Validar inmediatamente al montar
    validateSession()

    // Configurar validación periódica cada 5 minutos
    const intervalId = setInterval(() => {
      validateSession()
    }, 5 * 60 * 1000) // 5 minutos

    // Cleanup
    return () => {
      clearInterval(intervalId)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      hasValidatedInitialRef.current = false
      isValidatingRef.current = false
    }
  }, [status, session, dispatch, router, loginUser])

  return null
}

