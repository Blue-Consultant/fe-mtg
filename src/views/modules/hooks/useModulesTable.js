import { useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { notificationErrorMessage } from '@/components/ToastNotification'


export const useModulesTable = () => {
  const modulesPagination = useSelector(state => state.modules.modulesPagination)
  const loadingModules = useSelector(state => state.modules.loading)
  const errorModules = useSelector(state => state.modules.error)
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  useEffect(() => {
    if (!modulesPagination?.rows) return

    const normalized = modulesPagination.rows.map(e => ({
      ...e
    }))

    setData(normalized)
    setFilteredData(normalized)
  }, [modulesPagination])

  useEffect(() => {
    if (errorModules) {
      notificationErrorMessage(errorModules)
    }
  }, [errorModules])

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
    modulesPagination,
    loadingModules,
    errorModules,
    rowSelection, setRowSelection,
    data, setData,
    filteredData, setFilteredData,
    globalFilter, setGlobalFilter,
    truncateSmart
  }
}
