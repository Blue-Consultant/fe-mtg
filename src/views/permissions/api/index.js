import NProgress from 'nprogress'

import axios from '@/utils/axios'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'

export const getAllPermissions = async () => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.get('permissions/findAllPermissions')

    NProgress.done()

    if (!response.data) {
      return []
    }

    return response.data
  } catch (error) {
    console.error('ERROR: getAllPermissions API', error)
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { message, status }
    }
  }
}

export const createPermission = async permission => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.post('permissions/createPermissions', permission)

    NProgress.done()
    notificationSuccesMessage('Permiso creado con éxito')

    return response.data
  } catch (error) {
    console.error('ERROR: createPermission API', error)
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { message, status }
    }
  }
}

export const updatePermission = async (id, permission) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.put(`permissions/updatePermissions/${id}`, permission)

    NProgress.done()
    notificationSuccesMessage('Permiso actualizado con éxito')

    return response.data
  } catch (error) {
    console.error('ERROR: updatePermission API', error)
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { message, status }
    }
  }
}

export const deletePermission = async id => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.delete(`permissions/deletePermissions/${id}`)

    NProgress.done()
    notificationSuccesMessage('Permiso eliminado con éxito')

    return response.data
  } catch (error) {
    console.error('ERROR: deletePermission API', error)
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { message, status }
    }
  }
}

export const findAllPermissionsPagination = async (status, queryPagination) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.get(`permissions/findAllPermissionsPagination/${status}`, { params: queryPagination })

    NProgress.done()

    return response.data
  } catch (error) {
    console.error('ERROR: findAllPermissionsPagination API', error)
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { message, status }
    }
  }
}
