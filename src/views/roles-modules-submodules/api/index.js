import NProgress from 'nprogress'

import axios from '@/utils/axios'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'

/**
 * Obtener módulos y submódulos consolidados de un usuario (todos sus roles)
 */
export const getUserModules = async user_id => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.get(`user/${user_id}/modules`)

    NProgress.done()

    if (!response.data) {
      return { modules: [], total_permissions: 0 }
    }

    return response.data
  } catch (error) {
    console.error('ERROR: getUserModules API', error)
    NProgress.done()

    if (error.response) {
      const { data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { modules: [], total_permissions: 0 }
    }

    notificationErrorMessage('Error de conexión con el servidor')

    return { modules: [], total_permissions: 0 }
  }
}

/**
 * Obtener permisos de un rol específico (agrupados por módulo)
 * Usado principalmente para que el Owner vea qué módulos tiene un rol antes de asignarlos
 */
export const getRolePermissions = async role_id => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.get(`roles-modules-submodules/by-role/${role_id}`)

    NProgress.done()

    if (!response.data) {
      return { modules: [], total_permissions: 0 }
    }

    return response.data
  } catch (error) {
    console.error('ERROR: getRolePermissions API', error)
    NProgress.done()

    if (error.response) {
      const { data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { modules: [], total_permissions: 0 }
    }

    notificationErrorMessage('Error de conexión con el servidor')

    return { modules: [], total_permissions: 0 }
  }
}

/**
 * Obtener permisos de un rol específico (agrupados por módulo)
 */
export const getRolePermissionsPagination = async (status, params = {}) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.get(`roles-modules-submodules/findAllPagination/${status}`, { params })

    console.log('response', response.data)
    NProgress.done()

    if (!response.data) {
      return { rows: [], totalRows: 0, totalPages: 0, currentPage: 1 }
    }

    return response.data
  } catch (error) {
    console.error('ERROR: getRolePermissionsPagination API', error)
    NProgress.done()

    if (error.response) {
      const { data } = error.response
      const message = data.message || 'Error del servidor'

      notificationErrorMessage(message)

      return { rows: [], totalRows: 0, totalPages: 0, currentPage: 1 }
    }

    const message = 'Error de conexión con el servidor'

    notificationErrorMessage(message)

    return { rows: [], totalRows: 0, totalPages: 0, currentPage: 1 }
  }
}

/**
 * Asignar múltiples permisos a un rol (Bulk Assign)
 */
export const bulkAssignPermissions = async data => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.post(`roles-modules-submodules/bulk-assign`, data)

    NProgress.done()

    return response.data
  } catch (error) {
    NProgress.done()

    if (error.response) {
      const { data } = error.response
      const message = data.message || 'Error al asignar permisos'

      notificationErrorMessage(message)
      throw new Error(message)
    }

    const message = 'Error de conexión con el servidor'

    notificationErrorMessage(message)
    throw new Error(message)
  }
}

/**
 * Actualizar permisos de un rol (reemplaza los anteriores)
 */
export const updateRolePermissions = async (role_id, assignments) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 })
    NProgress.start()

    const response = await axios.put(`roles-modules-submodules/update-role/${role_id}`, {
      assignments
    })

    NProgress.done()

    notificationSuccesMessage('Permisos actualizados correctamente')

    return response.data
  } catch (error) {
    console.error('ERROR: updateRolePermissions API', error)
    NProgress.done()

    if (error.response) {
      const { data } = error.response
      const message = data.message || 'Error al actualizar permisos'

      notificationErrorMessage(message)
      throw new Error(message)
    }

    const message = 'Error de conexión con el servidor'

    notificationErrorMessage(message)
    throw new Error(message)
  }
}

/**
 * Eliminar un permiso específico
 */
export const deletePermission = async permission_id => {
  try {
    const response = await axios.delete(`roles-modules-submodules/permission/${permission_id}`)

    notificationSuccesMessage('Permiso eliminado correctamente')

    return response.data
  } catch (error) {
    const message = error.response?.data?.message || 'Error al eliminar el permiso'

    notificationErrorMessage(message)
    throw new Error(message)
  }
}

/**
 * Eliminar todos los permisos de un rol
 */
export const deleteRolePermissions = async role_id => {
  try {
    const response = await axios.delete(`roles-modules-submodules/by-role/${role_id}`)

    notificationSuccesMessage('Permisos eliminados correctamente')

    return response.data
  } catch (error) {
    const message = error.response?.data?.message || 'Error al eliminar permisos'

    notificationErrorMessage(message)
    throw new Error(message)
  }
}

/**
 * Verificar si un rol tiene permiso sobre un submódulo
 */
export const checkPermission = async (role_id, submodule_id) => {
  try {
    const response = await axios.get(`roles-modules-submodules/check/${role_id}/${submodule_id}`)

    return response.data
  } catch (error) {
    console.error('ERROR: checkPermission API', error)

    return { has_permission: false }
  }
}
