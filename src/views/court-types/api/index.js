import { toast } from 'react-toastify'
import NProgress from 'nprogress'

import axios from '@/utils/axios'

const notificationErrorMessage = message => {
  toast.error(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    theme: 'light'
  })
}

const notificationSuccessMessage = message => {
  toast.success(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    theme: 'light'
  })
}

export const getCourtTypes = async (activeOnly = true) => {
  try {
    NProgress.start()
    const url = activeOnly ? 'court-types?estado=true' : 'court-types'
    const { data } = await axios.get(url)

    NProgress.done()

    return data || []
  } catch (error) {
    NProgress.done()
    console.error('getCourtTypes', error)

    if (error.response?.data?.message) {
      notificationErrorMessage(error.response.data.message)
    } else {
      notificationErrorMessage('Error al cargar tipos de cancha')
    }

    return []
  }
}

export const createCourtType = async payload => {
  try {
    NProgress.start()
    const { data } = await axios.post('court-types', payload)

    NProgress.done()
    notificationSuccessMessage('Tipo de cancha creado correctamente')

    return data
  } catch (error) {
    NProgress.done()
    const msg = error.response?.data?.message || 'Error al crear tipo de cancha'

    notificationErrorMessage(msg)
    throw error
  }
}

export const updateCourtType = async (id, payload) => {
  try {
    NProgress.start()
    const { data } = await axios.put(`court-types/${id}`, payload)

    NProgress.done()
    notificationSuccessMessage('Tipo de cancha actualizado correctamente')

    return data
  } catch (error) {
    NProgress.done()
    const msg = error.response?.data?.message || 'Error al actualizar tipo de cancha'

    notificationErrorMessage(msg)
    throw error
  }
}

export const deleteCourtType = async id => {
  try {
    NProgress.start()
    const { data } = await axios.delete(`court-types/${id}`)

    NProgress.done()
    notificationSuccessMessage('Tipo de cancha desactivado correctamente')

    return data
  } catch (error) {
    NProgress.done()
    const msg = error.response?.data?.message || 'Error al eliminar tipo de cancha'

    notificationErrorMessage(msg)
    throw error
  }
}
