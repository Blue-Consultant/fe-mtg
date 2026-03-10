import { toast } from 'react-toastify'
import NProgress from 'nprogress'

import axios from '@/utils/axios'

const notificationErrorMessage = message => {
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

const notificationSuccesMessage = message => {
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

export const createDateBlock = async data => {
  try {
    NProgress.start()
    const response = await axios.post('date-blocks/add', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('No se pudo crear el bloqueo de fecha')
    }

    NProgress.done()
    notificationSuccesMessage('Bloqueo de fecha creado correctamente')

    return response.data
  } catch (error) {
    NProgress.done()

    if (error.response?.data?.message) {
      notificationErrorMessage(error.response.data.message)
    } else {
      notificationErrorMessage('Error al crear el bloqueo de fecha')
    }

    throw error
  }
}

export const updateDateBlock = async (id, data) => {
  try {
    NProgress.start()
    const response = await axios.put(`date-blocks/update/${id}`, data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('No se pudo actualizar el bloqueo de fecha')
    }

    NProgress.done()
    notificationSuccesMessage('Bloqueo de fecha actualizado correctamente')

    return response.data
  } catch (error) {
    NProgress.done()

    if (error.response?.data?.message) {
      notificationErrorMessage(error.response.data.message)
    } else {
      notificationErrorMessage('Error al actualizar el bloqueo de fecha')
    }

    throw error
  }
}

export const deleteDateBlock = async id => {
  try {
    NProgress.start()
    const response = await axios.delete(`date-blocks/delete/${id}`)

    NProgress.done()
    notificationSuccesMessage('Bloqueo de fecha eliminado correctamente')

    return response.data
  } catch (error) {
    NProgress.done()
    notificationErrorMessage('No se pudo eliminar el bloqueo de fecha')
    throw error
  }
}

export const listDateBlocksWithPagination = async (user_id, params) => {
  try {
    const { data } = await axios.get(`date-blocks/findAllPagination/${user_id}/${true}`, { params })

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const listCourtsByUser = async user_id => {
  try {
    const { data } = await axios.get(`courts/findAllPagination/${user_id}/${true}`, {
      params: { pageSize: 1000 }
    })

    return data?.rows || []
  } catch (error) {
    console.error(error)

    return []
  }
}
