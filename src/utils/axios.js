import axios from 'axios'

export const API_URL = process.env.NEXT_PUBLIC_SERVER_API || ''
export const BUCKET_ORIGIN_SPACE = process.env.NEXT_PUBLIC_BUCKET_ORIGIN_SPACE || ''

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// No necesitamos interceptor de request porque las cookies httpOnly
// se envían automáticamente con withCredentials: true

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

instance.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config

    // Si la petición tiene el flag _skipRetry, no intentar refrescar
    if (originalRequest._skipRetry) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return instance(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await instance.post('/user/refresh')

        processQueue(null)
        isRefreshing = false

        return instance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError)
        isRefreshing = false

        if (typeof window !== 'undefined') {
          // Extraer el mensaje del backend si está disponible
          const errorMessage =
            refreshError?.response?.data?.message ||
            'Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente.'

          const errorCode = refreshError?.response?.data?.code

          // Limpiar solo datos no sensibles de localStorage
          localStorage.removeItem('userPermissions')
          localStorage.removeItem('userRoles')
          localStorage.removeItem('persist:root')
          localStorage.removeItem('persist:login')

          console.log('Sesión expirada:', errorMessage)

          // Guardar mensaje de expiración para mostrarlo en la página de login
          if (errorCode === 'REFRESH_TOKEN_EXPIRED') {
            sessionStorage.setItem('sessionExpiredMessage', errorMessage)
          }

          setTimeout(() => {
            window.location.replace('/es/login')
          }, 100)
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default instance
