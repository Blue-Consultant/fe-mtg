import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import usePagination from '@/hooks/usePagination'

import {
  setDateBlocksPagination,
  addDateBlocksPagination,
  updateDateBlocksPagination,
  deleteDateBlocks,
} from '@/redux-store/slices/date-blocks'

import {
  listDateBlocksWithPagination,
  deleteDateBlock,
  createDateBlock,
  updateDateBlock,
  listCourtsByUser
} from '../api'

export const useDateBlocksClient = (dictionary) => {
  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const dateBlocksReducer = useSelector(state => state.dateBlocksReducer)

  const [showform, setShowform] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [isLoading, setIsLoading] = useState(false)
  const [courtsList, setCourtsList] = useState([])

  const {
    pagination,
    isReady: isPaginationReady,
    getParams,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = usePagination({
    pageSize: 5,
    orderBy: 'id',
    orderByMode: 'asc'
  })

  const memoizedDictionary = useMemo(() => dictionary, [JSON.stringify(dictionary)])

  const getDateBlocks = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) return
    try {
      setIsLoading(true)
      const params = getParams(pagination)
      const result = await listDateBlocksWithPagination(usuario.id, params)
      dispatch(setDateBlocksPagination(result))
    } catch (error) {
      console.error('Error fetching date blocks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, isPaginationReady, pagination, getParams, dispatch])

  const getCourts = useCallback(async () => {
    if (!usuario?.id) return
    try {
      const courts = await listCourtsByUser(usuario.id)
      setCourtsList(Array.isArray(courts) ? courts : [])
    } catch (error) {
      console.error('Error fetching courts:', error)
      setCourtsList([])
    }
  }, [usuario?.id])

  const handleSetDefautProps = useCallback(() => {
    setShowform(false)
    setDataProp({ action: '', data: null })
  }, [])

  const addOrUpdateDateBlock = useCallback(async ({ formData, isEditMode, dateBlockId }) => {
    try {
      if (isEditMode && dateBlockId) {
        const editData = await updateDateBlock(dateBlockId, formData)
        if (editData) dispatch(updateDateBlocksPagination(editData))
        return editData
      }
      const createData = await createDateBlock(formData)
      if (createData) dispatch(addDateBlocksPagination(createData))
      return createData
    } catch (error) {
      console.error('Error saving date block:', error)
      throw error
    }
  }, [dispatch])

  const deactivateDateBlocks = useCallback(async (isConfirmed) => {
    if (isConfirmed && dataProp.data) {
      try {
        await deleteDateBlock(dataProp.data)
        dispatch(deleteDateBlocks(dataProp.data))
      } catch (error) {
        console.error('Error deleting date block:', error)
      }
    }
  }, [dataProp.data, dispatch])

  useEffect(() => {
    if (!isPaginationReady || !usuario?.id) return
    getDateBlocks()
  }, [isPaginationReady, usuario?.id, getDateBlocks])

  useEffect(() => {
    getCourts()
  }, [getCourts])

  return {
    memoizedDictionary,
    dictionary,
    dateBlocksReducer,
    usuario,
    loading: isLoading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    courtsList,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    getDateBlocks,
    getCourts,
    handleSetDefautProps,
    addOrUpdateDateBlock,
    deactivateDateBlocks,
  }
}
