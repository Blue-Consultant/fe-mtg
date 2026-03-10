import { createPermission, deletePermission as deletePermissionAPI, findAllPermissionsPagination, getAllPermissions, updatePermission } from "@/views/permissions/api"
import { addPermissionsPagination, deletePermissionsPagination, setError, setLoading, setPermissions, setPermissionsPagination, updatePermissionsPagination } from "../slices/permissions"

export const getAllPermissionsThunk = () => async dispatch => {
  try {
    dispatch(setLoading(true))
    const data = await getAllPermissions()
    dispatch(setPermissions(data))
    return data
  } catch (error) {
    dispatch(setError(error.message || 'Failed to fetch permissions'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const createPermissionThunk = (permission) => async dispatch => {
  try {
    dispatch(setLoading(true))
    const data = await createPermission(permission)
    dispatch(addPermissionsPagination(data))
    return data
  } catch (error) {
    dispatch(setError(error.message || 'Failed to create permission'))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const updatePermissionThunk = (id, permission) => async dispatch => {
  try {
    dispatch(setLoading(true))
    const data = await updatePermission(id, permission)
    dispatch(updatePermissionsPagination(data))
    return data
  } catch (error) {
    dispatch(setError(error.message || 'Failed to update permission'))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const deletePermissionThunk = (id) => async dispatch => {
  try {
    dispatch(setLoading(true))
    const data = await deletePermissionAPI(id)
    // El reducer espera solo el ID, no el objeto completo
    dispatch(deletePermissionsPagination(id))
    return data
  } catch (error) {
    dispatch(setError(error.message || 'Failed to delete permission'))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchPermissionsPaginationThunk = ({status = true, params = {} }) => async dispatch => {
  try {
      dispatch(setLoading(true))
      const data = await findAllPermissionsPagination(status, params)

      // Validar si la respuesta tiene la estructura de paginación correcta
      if (data && typeof data === 'object' && Array.isArray(data.rows)) {
          dispatch(setPermissionsPagination(data))
      } else if (Array.isArray(data)) {
          // Por si la API devuelve solo un array
          dispatch(setPermissions(data))
      } else {
          dispatch(setError(data.message || 'Failed to fetch modules'))
      }
  } catch (error) {
      dispatch(setError(error.message || 'Failed to fetch modules'))
  } finally {
      dispatch(setLoading(false))
  }
}
