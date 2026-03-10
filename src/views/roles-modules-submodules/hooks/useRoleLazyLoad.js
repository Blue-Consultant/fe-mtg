import { useState, useCallback } from 'react'
import { getRolePermissionsPagination } from '@/views/roles-modules-submodules/api'

export const useRoleLazyLoad = () => {

  const [roleDataCache, setRoleDataCache] = useState({})
  const [loadingRoles, setLoadingRoles] = useState({})
  const [rolePagination, setRolePagination] = useState({})

  const loadRoleData = useCallback(async (roleId, page = 1, pageSize = 8) => {
    setLoadingRoles(prev => ({ ...prev, [roleId]: true }))

    try {
      const params = {
        role_id: roleId,
        currentPage: page,
        pageSize: pageSize,
        orderBy: 'id',
        orderByMode: 'asc',
      }

      const result = await getRolePermissionsPagination(true, params)

      const mappedRows = (result.rows || []).map(row => {
        return {
        permission_id: row.id,
        role_id: row.role_id,
        role_name: row.Roles?.name || 'N/A',
        role_translate: row.Roles?.description || '',
        module_id: row.module_id,
        module_name: row.Modules?.name || 'N/A',
        module_translate: row.Modules?.translate || row.Modules?.descripcion || '',
        module_icon: row.Modules?.icon || 'ri-folder-line',
        submodule_id: row.submodule_id,
        submodule_name: row.Submodules?.name || 'N/A',
        submodule_translate: row.Submodules?.translate || '',
        submodule_icon: row.Submodules?.icon || 'ri-file-line',
        submodule_link: row.Submodules?.link || '',
        submodule_order: row.Submodules?.order || 0,
        status: row.status,
      }
      })

      setRoleDataCache(prev => ({
        ...prev,
        [roleId]: {
          rows: mappedRows,
          totalRows: result.totalRows || 0,
          currentPage: result.currentPage || 1,
          totalPages: result.totalPages || 1,
        }
      }))

      return result
    } catch (error) {
      console.error(`Error loading role ${roleId}:`, error)
      return null
    } finally {
      setLoadingRoles(prev => ({ ...prev, [roleId]: false }))
    }
  }, [])

  /**
   * Cambiar de página para un rol específico
   */
  const handleRolePageChange = useCallback((roleId, newPage) => {
    const pageSize = rolePagination[roleId]?.pageSize || 8
    loadRoleData(roleId, newPage + 1, pageSize)
  }, [loadRoleData, rolePagination])

  /**
   * Cambiar tamaño de página para un rol específico
   */
  const handleRolePageSizeChange = useCallback((roleId, newPageSize) => {
    loadRoleData(roleId, 1, newPageSize)
    setRolePagination(prev => ({
      ...prev,
      [roleId]: { currentPage: 0, pageSize: newPageSize }
    }))
  }, [loadRoleData])

  /**
   * Inicializar paginación para un rol
   */
  const initializeRolePagination = useCallback((roleId) => {
    if (!rolePagination[roleId]) {
      setRolePagination(prev => ({
        ...prev,
        [roleId]: { currentPage: 0, pageSize: 8 }
      }))
    }
  }, [rolePagination])

  /**
   * Limpiar cache (útil después de crear/eliminar permisos)
   */
  const clearRoleCache = useCallback((roleId = null) => {
    if (roleId) {
      setRoleDataCache(prev => {
        const newCache = { ...prev }
        delete newCache[roleId]
        return newCache
      })
    } else {
      setRoleDataCache({})
    }
  }, [])

  return {
    roleDataCache,
    loadingRoles,
    rolePagination,
    loadRoleData,
    handleRolePageChange,
    handleRolePageSizeChange,
    initializeRolePagination,
    clearRoleCache,
  }
}

