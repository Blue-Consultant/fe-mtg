import { createModule, deleteModule, getModules, getModulesPagination, updateModule } from '@/views/modules/api'
import {
  addModulePagination,
  deleteModulePagination,
  setError,
  setLoading,
  setModules,
  setModulesPagination,
  updateModulePagination
} from '../slices/modules'

//TODO: Devuelve todos los registros
export const fetchModulesThunks =
  ({ status = true }) =>
  async dispatch => {
    try {
      dispatch(setLoading(true))
      const data = await getModules(status)

      if (Array.isArray(data)) {
        dispatch(setModules({ rows: data, totalRows: data.length }))

        return data
      } else if (data && typeof data === 'object' && Array.isArray(data.rows)) {
        dispatch(setModules(data))

        return data.rows
      } else {
        dispatch(setError(data?.message || 'Failed to fetch modules'))

        return []
      }
    } catch (error) {
      dispatch(setError(error.message || 'Failed to fetch modules'))

      return []
    } finally {
      dispatch(setLoading(false))
    }
  }

//TODO: Devuelve todos los registros aplicando paginación
export const fetchModulesPagination =
  ({ status = true, params = {} }) =>
  async dispatch => {
    try {
      dispatch(setLoading(true))
      const data = await getModulesPagination(status, params)

      // Validar si la respuesta tiene la estructura de paginación correcta
      if (data && typeof data === 'object' && Array.isArray(data.rows)) {
        dispatch(setModulesPagination(data))
      } else if (Array.isArray(data)) {
        // Por si la API devuelve solo un array
        dispatch(setModules(data))
      } else {
        dispatch(setError(data.message || 'Failed to fetch modules'))
      }
    } catch (error) {
      dispatch(setError(error.message || 'Failed to fetch modules'))
    } finally {
      dispatch(setLoading(false))
    }
  }

export const createModuleThunk =
  ({ module }) =>
  async dispatch => {
    try {
      dispatch(setLoading(true))
      const newModule = await createModule(module)

      dispatch(addModulePagination(newModule))

      return newModule
    } catch (error) {
      const message = error.message || 'Failed to create module'

      dispatch(setError(message))
    } finally {
      dispatch(setLoading(false))
    }
  }

export const updateModuleThunk =
  ({ moduleId, module }) =>
  async dispatch => {
    try {
      dispatch(setLoading(true))
      const updateModules = await updateModule(moduleId, module)

      dispatch(updateModulePagination(updateModules))

      return updateModules
    } catch (error) {
      const message = error.message || 'Failed to create module'

      dispatch(setError(message))
    } finally {
      dispatch(setLoading(false))
    }
  }

export const deleteModuleThunks = moduleId => async dispatch => {
  try {
    dispatch(setLoading(true))

    await deleteModule(moduleId)
    dispatch(deleteModulePagination(moduleId))

    return moduleId
  } catch (error) {
    dispatch(setError(error.message))
  } finally {
    dispatch(setLoading(false))
  }
}
