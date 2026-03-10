import { useState, useEffect } from 'react'

import { useSelector } from 'react-redux'

import { notificationErrorMessage } from '@/components/ToastNotification'

export const useRelationTable = () => {
  const rolesPermissionsPagination = useSelector(state => state.rolesModulesSubmodules.rolesPermissionsPagination)
  const loading = useSelector(state => state.rolesModulesSubmodules.loading)
  const error = useSelector(state => state.rolesModulesSubmodules.error)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [openRoleDialog, setOpenRoleDialog] = useState(false)

  // Convertir la estructura de paginación a una lista plana para la tabla
  useEffect(() => {
    if (!rolesPermissionsPagination?.rows || rolesPermissionsPagination.rows.length === 0) {
      setData([])
      setFilteredData([])

      return
    }

    const flattenedData = rolesPermissionsPagination.rows.map(row => {
      return {
        permission_id: row.id,
        role_id: row.role_id,
        role_name: row.Roles?.name || 'N/A',
        role_translate: row.Roles?.description || '',
        module_id: row.module_id,
        module_name: row.Modules?.name || 'N/A',
        module_translate: row.Modules?.descripcion || '',
        module_icon: row.Modules?.icon || 'ri-folder-line',
        submodule_id: row.submodule_id,
        submodule_name: row.Submodules?.name || 'N/A',
        submodule_translate: row.Submodules?.translate || '',
        submodule_icon: row.Submodules?.icon || 'ri-file-line',
        submodule_link: row.Submodules?.link || '',
        submodule_order: row.Submodules?.order || 0,
        status: row.status
      }
    })

    setData(flattenedData)
    setFilteredData(flattenedData)
  }, [rolesPermissionsPagination])

  useEffect(() => {
    if (error) {
      notificationErrorMessage(error)
    }
  }, [error])

  const truncateSmart = (text, wordLimit = 5, charLimit = 40) => {
    if (!text) return 'N/A'
    const words = text.split(' ').slice(0, wordLimit)
    let result = words.join(' ')

    if (result.length > charLimit) {
      result = result.slice(0, charLimit)
    }

    return result.length < text.length ? result + '...' : result
  }

  return {
    rolesPermissionsPagination,
    loading,
    error,
    rowSelection,
    setRowSelection,
    data,
    setData,
    filteredData,
    setFilteredData,
    globalFilter,
    setGlobalFilter,
    truncateSmart,
    openRoleDialog,
    setOpenRoleDialog
  }
}
