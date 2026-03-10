import NProgress from 'nprogress'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'

// Configuración centralizada de NProgress
const configureProgress = () => {
  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 50
  })
}

// Helper para manejar operaciones con progreso
export const withProgress = async (apiCall, successMessage = null) => {
  configureProgress()
  NProgress.start()

  try {
    const result = await apiCall()
    NProgress.done()

    if (successMessage) {
      notificationSuccesMessage(successMessage)
    }

    return result
  } catch (error) {
    NProgress.done()
    handleApiError(error)
    throw error
  }
}

// Manejo centralizado de errores
export const handleApiError = (error) => {
  console.error('API Error:', error)

  if (error.response) {
    const { status, data } = error.response
    const message = data?.message || 'Error del servidor'
    notificationErrorMessage(message)
  } else {
    const message = 'Error de conexión con el servidor'
    notificationErrorMessage(message)
  }
}

// Helper para validar respuestas
export const validateResponse = (response, emptyMessage = 'No hay datos disponibles') => {
  if (!response?.data) {
    notificationErrorMessage(emptyMessage)
    return []
  }

  if (Array.isArray(response.data) && response.data.length === 0) {
    return []
  }

  return response.data
}
