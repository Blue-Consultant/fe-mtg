import { getSubModules, createSubModule, updateSubModule, deleteSubModule, getSubModulesByModule } from "@/views/sub-modules/api"
import { setError, setLoading, setSubModulesPagination, addSubModulePagination, updateSubModulePagination, deleteSubModulePagination, setSubModules } from "../slices/sub-modules"

//TODO: Devuelve todos los registros con paginación
export const fetchSubModulesPaginationThunks = ({status = true, params = {} }) => async dispatch => {
    try {
        dispatch(setLoading(true))
        const data = await getSubModules(status, params)
        
        // Validar si la respuesta tiene la estructura de paginación correcta
        if (data && typeof data === 'object' && Array.isArray(data.rows)) {
            dispatch(setSubModulesPagination(data))
        } else if (Array.isArray(data)) {
            // Por si la API devuelve solo un array
            dispatch(setSubModulesPagination({ rows: data, totalRows: data.length }))
        } else {
            dispatch(setError(data.message || 'Failed to fetch sub modules'))
        }
    } catch (error) {
        dispatch(setError(error.message || 'Failed to fetch sub modules'))
    } finally {  
        dispatch(setLoading(false))
    }
}

//TODO: Devuelve todos los sub módulos por módulo
export const fetchSubModulesByModuleThunks = ({module_id, status = true }) => async dispatch => {
  try {
      dispatch(setLoading(true))
      const data = await getSubModulesByModule(module_id, status)
      if (Array.isArray(data)) {
        dispatch(setSubModules(data))
      } else if (data.rows && data.rows.length > 0) {
        dispatch(setSubModules({ list: data.rows}))
      } else if (data.message) {
        dispatch(setError(data.message || 'Failed to fetch sub modules by module'))
      }
    } catch (error) {
        dispatch(setError(error.message || 'Failed to fetch sub modules by module'))
    } finally {  
        dispatch(setLoading(false))
    }
}

export const createSubModuleThunk = (subModule) => async dispatch => {
  try {
    dispatch(setLoading(true));
    const newSubModule = await createSubModule(subModule);
    dispatch(addSubModulePagination(newSubModule));
    return newSubModule;
  } catch (error) {
    const message = error.message || 'Failed to create sub-module';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateSubModuleThunk = ({ subModuleId, subModule }) => async dispatch => {
  try {
    dispatch(setLoading(true));
    const updatedSubModule = await updateSubModule(subModuleId, subModule);
    dispatch(updateSubModulePagination(updatedSubModule));
    return updatedSubModule;
  } catch (error) {
    const message = error.message || 'Failed to update sub-module';
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteSubModuleThunk = (subModuleId) => async dispatch => {
  try {
    dispatch(setLoading(true));

    await deleteSubModule(subModuleId);
    dispatch(deleteSubModulePagination(subModuleId));

    return subModuleId;
  } catch (error) {
     dispatch(setError(error.message));
     throw error;
  } finally {
    dispatch(setLoading(false));
  }
}