import { useState, useEffect, useMemo } from 'react'

import { useSelector } from 'react-redux'

import { notificationErrorMessage } from '@/components/ToastNotification'

export const usePermissionsTable = () => {
  const permissionsPagination = useSelector(state => state.permissionsReducer.permissionsPagination)
  const loadingPermissions = useSelector(state => state.permissionsReducer.loading)
  const errorPermissions = useSelector(state => state.permissionsReducer.error)
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  // Usar useMemo en vez de estado para evitar copias innecesarias
  const filteredData = useMemo(() => {
    return permissionsPagination?.rows || []
  }, [permissionsPagination])

  useEffect(() => {
    if (errorPermissions) {
      notificationErrorMessage(errorPermissions)
    }
  }, [errorPermissions])

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
    loadingPermissions,
    rowSelection,
    setRowSelection,
    filteredData,
    globalFilter,
    setGlobalFilter,
    truncateSmart
  }
}
