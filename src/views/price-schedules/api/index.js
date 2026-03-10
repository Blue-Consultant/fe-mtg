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
│   * METHOD CREATE PRICE SCHEDULE  │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const createPriceSchedule = async (data) => {
  try {
    NProgress.start()

    const response = await axios.post('price-schedules/add', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to create a new price schedule')
    }

    NProgress.done()
    notificationSuccesMessage('Horario de precio creado exitosamente!')

    return response.data
  } catch (error) {
    NProgress.done()
    console.log('Error creating', error)

    if (error.response) {
      const { status, data } = error.response

      if (data.message?.includes('already in use')) {
        notificationErrorMessage(data.message)
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
│   * METHOD CREATE BULK PRICE SCHEDULES  │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const createPriceSchedulesBulk = async (data) => {
  try {
    NProgress.start()

    const response = await axios.post('price-schedules/add-bulk', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('No se pudieron crear los horarios de precio')
    }

    NProgress.done()
    const count = response.data?.count ?? response.data?.created?.length ?? 0
    notificationSuccesMessage(`${count} horario(s) de precio creado(s) exitosamente!`)

    return response.data
  } catch (error) {
    NProgress.done()
    if (error.response) {
      const { status, data } = error.response
      if (status === 400 || status === 409) {
        notificationErrorMessage(data?.message || 'Error en los datos. Revisa los campos.')
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
│   * METHOD UPDATE PRICE SCHEDULE   │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const updatePriceSchedule = async (id, data) => {
  try {
    NProgress.start()

    const response = await axios.put(`price-schedules/update/${id}`, data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to update the price schedule')
    }

    NProgress.done()
    notificationSuccesMessage('Horario de precio actualizado exitosamente!')

    return response.data
  } catch (error) {
    NProgress.done()
    if (error.response) {
      const { status, data } = error.response

      if (data.message?.includes('already in use')) {
        notificationErrorMessage(data.message)
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
│   * METHOD DELETE PRICE SCHEDULE  │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const deletePriceSchedule = async (id) => {
  try {
    NProgress.start()

    const response = await axios.delete(`price-schedules/delete/${id}`)

    NProgress.done()
    notificationSuccesMessage('Horario de precio eliminado exitosamente!')

    return response.data
  } catch (error) {
    NProgress.done()
    console.log("DeletePriceSchedule", error)
    notificationErrorMessage('No se pudo eliminar el horario de precio, por favor intenta de nuevo.')
    throw error
  }
}

/*___________________________________
│   * METHOD LIST PRICE SCHEDULES   │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listPriceScheduleByIdWithPagination = async (user_id, params) => {
  try {
    const { data } = await axios.get(`price-schedules/findAllPagination/${user_id}/${true}`, {
      params
    })

    return data
  } catch (error) {
    console.error(error)
    throw error
  }
}

/*___________________________________
│   * METHOD LIST COURTS BY USER    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listCourtsByUser = async (user_id) => {
  try {
    const { data } = await axios.get(`courts/findAllPagination/${user_id}/${true}`, {
      params: { pageSize: 1000 } // Obtener todas las canchas
    })

    return data?.rows || []
  } catch (error) {
    console.error(error)
    return []
  }
}
