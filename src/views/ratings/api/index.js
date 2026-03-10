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

export const createRating = async data => {
  try {
    NProgress.start()
    const response = await axios.post('ratings/add', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('No se pudo crear la valoración')
    }

    NProgress.done()
    notificationSuccesMessage('Valoración creada correctamente')

    return response.data
  } catch (error) {
    NProgress.done()

    if (error.response?.data?.message) {
      notificationErrorMessage(error.response.data.message)
    } else {
      notificationErrorMessage('Error al crear la valoración')
    }

    throw error
  }
}

export const updateRating = async (id, data) => {
  try {
    NProgress.start()
    const response = await axios.put(`ratings/update/${id}`, data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('No se pudo actualizar la valoración')
    }

    NProgress.done()
    notificationSuccesMessage('Valoración actualizada correctamente')

    return response.data
  } catch (error) {
    NProgress.done()

    if (error.response?.data?.message) {
      notificationErrorMessage(error.response.data.message)
    } else {
      notificationErrorMessage('Error al actualizar la valoración')
    }

    throw error
  }
}

export const deleteRating = async id => {
  try {
    NProgress.start()
    const response = await axios.delete(`ratings/delete/${id}`)

    NProgress.done()
    notificationSuccesMessage('Valoración eliminada correctamente')

    return response.data
  } catch (error) {
    NProgress.done()
    notificationErrorMessage('No se pudo eliminar la valoración')
    throw error
  }
}

export const listRatingsWithPagination = async (user_id, params) => {
  try {
    const { data } = await axios.get(`ratings/findAllPagination/${user_id}`, { params })

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
