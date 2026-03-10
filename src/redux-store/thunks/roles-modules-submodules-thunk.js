import {
  getRolePermissions,
  bulkAssignPermissions,
  updateRolePermissions,
  deletePermission,
  deleteRolePermissions,
  getRolePermissionsPagination
} from '@/views/roles-modules-submodules/api'
import {
  setRolePermissions,
  addPermissions,
  updatePermissions,
  deletePermission as deletePermissionAction,
  clearRolePermissions,
  setLoading,
  setError,
  setRolesPermissionsPagination,
  addRolesPermissionsPagination,
  updateRolesPermissionsPagination,
  deleteRolesPermissionsPagination
} from '../slices/roles-modules-submodules'

/**
 * Obtener todos los permisos de un rol
 */
export const fetchRolePermissionsThunk = role_id => async dispatch => {
  try {
    dispatch(setLoading(true))
    const data = await getRolePermissions(role_id)

    if (data && data.modules) {
      dispatch(setRolePermissions(data))
    } else {
      dispatch(setError('Failed to fetch role permissions'))
    }
  } catch (error) {
    dispatch(setError(error.message || 'Failed to fetch role permissions'))
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Obtener todos los permisos de un rol
 */
export const fetchRolePermissionsPaginationThunk =
  ({ status = true, params = {} }) =>
  async dispatch => {
    try {
      dispatch(setLoading(true))
      const data = await getRolePermissionsPagination(status, params)

      dispatch(setRolesPermissionsPagination(data))
    } catch (error) {
      dispatch(setError(error.message || 'Failed to fetch role permissions'))
    } finally {
      dispatch(setLoading(false))
    }
  }

/**
 * Asignar múltiples permisos a un rol
 */
export const bulkAssignPermissionsThunk = data => async dispatch => {
  try {
    dispatch(setLoading(true))
    const result = await bulkAssignPermissions(data)

    dispatch(addRolesPermissionsPagination(result))

    return result
  } catch (error) {
    const message = error.message || 'Failed to assign permissions'

    dispatch(setError(message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Actualizar permisos de un rol (reemplaza los anteriores)
 */
export const updateRolePermissionsThunk =
  ({ role_id, assignments }) =>
  async dispatch => {
    try {
      dispatch(setLoading(true))
      const result = await updateRolePermissions(role_id, assignments)

      dispatch(updatePermissions(result))

      return result
    } catch (error) {
      const message = error.message || 'Failed to update permissions'

      dispatch(setError(message))
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

/**
 * Eliminar un permiso específico
 */
export const deletePermissionThunk = permission_id => async dispatch => {
  try {
    dispatch(setLoading(true))
    await deletePermission(permission_id)
    dispatch(deletePermissionAction(permission_id))

    return permission_id
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Eliminar todos los permisos de un rol
 */
export const deleteRolePermissionsThunk = role_id => async dispatch => {
  try {
    dispatch(setLoading(true))
    await deleteRolePermissions(role_id)
    dispatch(clearRolePermissions())

    return role_id
  } catch (error) {
    dispatch(setError(error.message))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}
