import { useEffect, useState, useMemo, useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import usePagination from '@/hooks/usePagination'

import {
  setRatingsPagination,
  addRatingsPagination,
  updateRatingsPagination,
  deleteRatings
} from '@/redux-store/slices/ratings'

import { listRatingsWithPagination, deleteRating, createRating, updateRating, listCourtsByUser } from '../api'

export const useRatingsClient = dictionary => {
  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const ratingsReducer = useSelector(state => state.ratingsReducer)

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
    orderByMode: 'desc'
  })

  const memoizedDictionary = useMemo(() => dictionary, [JSON.stringify(dictionary)])

  const getRatings = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) return

    try {
      setIsLoading(true)
      const params = getParams(pagination)
      const result = await listRatingsWithPagination(usuario.id, params)

      dispatch(setRatingsPagination(result))
    } catch (error) {
      console.error('Error fetching ratings:', error)
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

  const addOrUpdateRating = useCallback(
    async ({ formData, isEditMode, ratingId }) => {
      try {
        if (isEditMode && ratingId) {
          const editData = await updateRating(ratingId, formData)

          if (editData) dispatch(updateRatingsPagination(editData))

          return editData
        }

        const createData = await createRating(formData)

        if (createData) dispatch(addRatingsPagination(createData))

        return createData
      } catch (error) {
        console.error('Error saving rating:', error)
        throw error
      }
    },
    [dispatch]
  )

  const deactivateRatings = useCallback(
    async isConfirmed => {
      if (isConfirmed && dataProp.data) {
        try {
          await deleteRating(dataProp.data)
          dispatch(deleteRatings(dataProp.data))
        } catch (error) {
          console.error('Error deleting rating:', error)
        }
      }
    },
    [dataProp.data, dispatch]
  )

  useEffect(() => {
    if (!isPaginationReady || !usuario?.id) return
    getRatings()
  }, [isPaginationReady, usuario?.id, getRatings])

  useEffect(() => {
    getCourts()
  }, [getCourts])

  return {
    memoizedDictionary,
    dictionary,
    ratingsReducer,
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
    getRatings,
    getCourts,
    handleSetDefautProps,
    addOrUpdateRating,
    deactivateRatings
  }
}
