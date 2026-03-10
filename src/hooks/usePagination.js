// hooks/usePagination.js
import { useState, useCallback, useEffect } from 'react'

import debounce from 'lodash.debounce'

const usePagination = (initialState = {}) => {
  const [pagination, setPagination] = useState(() => ({
    searchValue: '',
    currentPage: 1,
    pageSize: 5,
    orderBy: 'title',
    orderByMode: 'asc',
    ...initialState
  }))

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  const getParams = useCallback(
    (customParams = {}) => {
      const params = { ...pagination, ...customParams }
      const result = {}

      if (params.searchValue) result.searchValue = params.searchValue
      if (params.currentPage) result.currentPage = params.currentPage
      if (params.pageSize) result.pageSize = params.pageSize
      if (params.orderBy) result.orderBy = params.orderBy
      if (params.orderByMode) result.orderByMode = params.orderByMode

      return result
    },
    [pagination]
  )

  const updatePagination = useCallback(updates => {
    setPagination(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSearchChange = useCallback(
    debounce(value => {
      updatePagination({
        searchValue: value,
        currentPage: 1
      })
    }, 500),
    [updatePagination]
  )

  const handlePageChange = useCallback(
    newPage => {
      updatePagination({ currentPage: newPage })
    },
    [updatePagination]
  )

  const handlePageSizeChange = useCallback(
    newPageSize => {
      updatePagination({
        pageSize: newPageSize,
        currentPage: 1
      })
    },
    [updatePagination]
  )

  const handleSortChange = useCallback(
    (orderBy, orderByMode) => {
      updatePagination({ orderBy, orderByMode })
    },
    [updatePagination]
  )

  return {
    pagination,
    isReady,
    getParams,
    updatePagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  }
}

export default usePagination
