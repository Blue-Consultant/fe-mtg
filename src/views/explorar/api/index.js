import NProgress from 'nprogress'

import axios from '@/utils/axios'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'

/*___________________________________
│   * METHOD CREATE COURT           │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const createPreference = async data => {
  try {
    NProgress.start()

    const response = await axios.post('payments/create-preference', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to create a new court')
    }

    NProgress.done()

    return response.data
  } catch (error) {
    NProgress.done()
    console.log('Error creating', error)

    if (error.response) {
      const { status, data } = error.response

      if (status === 400 || status === 409) {
        notificationErrorMessage(data.message || 'Error en los datos. Revisa los campos.')
      } else {
        notificationErrorMessage(data.message || 'Ocurrió un error inesperado.')
      }
    } else {
      notificationErrorMessage('Error de conexión con el servidor.')
    }

    throw error
  }
}
