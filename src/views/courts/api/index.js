// Axios helper Imports
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

/*___________________________________
│   * METHOD CREATE COURT           │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const createCourt = async (data) => {
  try {
    NProgress.start()

    const response = await axios.post('courts/add', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to create a new court')
    }

    NProgress.done()
    notificationSuccesMessage('Cancha creada exitosamente!')

    return response.data
  } catch (error) {
    NProgress.done()
    console.log('Error creating', error)

    if (error.response) {
      const { status, data } = error.response

      if (data.message?.includes('already in use')) {
        if (data.message.includes('nombre')) {
          notificationErrorMessage('El nombre de la cancha ya existe.')
        } else {
          notificationErrorMessage(data.message)
        }
      } else if (status === 400 || status === 409) {
        notificationErrorMessage(data.message || 'Error en los datos. Revisa los campos.')
      } else {
        notificationErrorMessage('Ocurrió un error inesperado.')
      }
    } else {
      notificationErrorMessage('Error de conexión con el servidor.')
    }
    throw error
  }
}

/*___________________________________
│   * METHOD UPDATE COURT           │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const updateCourt = async (id, data) => {
  try {
    NProgress.start()

    const response = await axios.put(`courts/update/${id}`, data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to update the court')
    }

    NProgress.done()
    notificationSuccesMessage('Cancha actualizada exitosamente!')

    return response.data
  } catch (error) {
    NProgress.done()
    if (error.response) {
      const { status, data } = error.response

      if (data.message?.includes('already in use')) {
        if (data.message.includes('nombre')) {
          notificationErrorMessage('El nombre de la cancha ya existe.')
        } else {
          notificationErrorMessage(data.message)
        }
      } else if (status === 400 || status === 409) {
        notificationErrorMessage(data.message || 'Error en los datos. Revisa los campos.')
      } else {
        notificationErrorMessage('Ocurrió un error inesperado.')
      }
    } else {
      notificationErrorMessage('Error de conexión con el servidor.')
    }
    throw error
  }
}

/*___________________________________
│   * METHOD DELETE COURT           │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const deleteCourt = async (id) => {
  try {
    NProgress.start()

    const response = await axios.delete(`courts/delete/${id}`)

    NProgress.done()
    notificationSuccesMessage('Cancha eliminada exitosamente!')

    return response.data
  } catch (error) {
    NProgress.done()
    console.log("DeleteCourt", error)
    notificationErrorMessage('No se pudo eliminar la cancha, por favor intenta de nuevo.')
    throw error
  }
}

/*___________________________________
│   * METHOD LIST COURT BY USER     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listCourtByIdWithPagination = async (user_id, params) => {
  try {
    const { data } = await axios.get(`courts/findAllPagination/${user_id}/${true}`, {
      params
    })

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/*___________________________________
│   * METHOD FEATURED COURTS (4)    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const getFeaturedCourts = async user_id => {
  try {
    const { data } = await axios.get(`courts/featured/${user_id}`)
    return data
  } catch (error) {
    console.error('getFeaturedCourts', error)
    return []
  }
}

/*___________________________________
│   * METHOD COURT DETAIL BY ID     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const getCourtDetail = async id => {
  try {
    const { data } = await axios.get(`courts/detail/${id}`)
    return data
  } catch (error) {
    console.error('getCourtDetail', error)
    if (error.response?.status === 404) return null
    throw error
  }
}

/*___________________________________
│   * SEARCH COURTS (fecha, hora, tipo, paginación)
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const searchCourts = async (fecha, hora_inicio, hora_fin, court_type_id, page = 1, pageSize = 8) => {
  try {
    const params = { fecha, hora_inicio, hora_fin, page, pageSize }
    if (court_type_id != null && court_type_id !== '') params.court_type_id = court_type_id
    const { data } = await axios.get('courts/search', { params })
    return data
  } catch (error) {
    console.error('searchCourts', error)
    throw error
  }
}
