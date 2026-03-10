import NProgress from 'nprogress'

import axios from '@/utils/axios'
import { notificationErrorMessage } from '@/components/ToastNotification'

export const createView = async (name, link) => {
  console.log('name', name)
  console.log('link', link)

  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.post(`views/generar-archivo-vista`, {
      name,
      link
    })

    console.log('response createView', response.data)

    // notificationSuccesMessage(response.data.message)
    NProgress.done()

    if (!response.data || response.data.length === 0) {
      return { message: 'Vista no creada', status: 400 }
    }

    return { message: 'Asimismo, la vista ha sido creada en la ruta.' }
  } catch (error) {
    console.error('ERROR: createView API', error)
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { message, status: status }
    }

    const errorMessage = 'Error de conexión con el servidor'

    notificationErrorMessage(errorMessage)

    return { message: errorMessage, status: 500 }
  }
}
