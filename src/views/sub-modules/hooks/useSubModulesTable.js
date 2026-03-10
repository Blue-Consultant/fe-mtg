import { useState, useEffect } from 'react'

import { useSelector } from 'react-redux'

import { notificationErrorMessage } from '@/components/ToastNotification'

export const useSubModulesTable = () => {
  const subModulesPagination = useSelector(state => state.subModule.subModulesPagination)
  const loadingEntities = useSelector(state => state.subModule.loading)
  const errorEntities = useSelector(state => state.subModule.error)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (!subModulesPagination?.rows) return

    const normalized = subModulesPagination.rows.map(e => ({
      ...e
    }))

    console.log('normalized', normalized)

    setData(normalized)
    setFilteredData(normalized)
  }, [subModulesPagination])

  useEffect(() => {
    if (errorEntities) {
      notificationErrorMessage(errorEntities)
    }
  }, [errorEntities])

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
    subModulesPagination,
    loadingEntities,
    errorEntities,
    rowSelection,
    setRowSelection,
    data,
    setData,
    filteredData,
    setFilteredData,
    globalFilter,
    setGlobalFilter,
    truncateSmart
  }
}
