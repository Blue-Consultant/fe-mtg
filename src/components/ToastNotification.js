import { toast } from 'react-toastify'

// Sistema de deduplicación para evitar múltiples notificaciones del mismo error
let lastErrorMessage = null
let lastErrorTime = 0
const ERROR_DEDUP_TIME = 3000

export const notificationErrorMessage = message => {
  const now = Date.now()

  if (message === lastErrorMessage && now - lastErrorTime < ERROR_DEDUP_TIME) {
    return
  }

  lastErrorMessage = message
  lastErrorTime = now

  return toast.error(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}

export const notificationWarningMessage = message => {
  return toast.warning(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}

export const notificationSuccesMessage = message => {
  return toast.success(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}

export const notificationInfoMessage = message => {
  return toast.info(`${message}`, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}
