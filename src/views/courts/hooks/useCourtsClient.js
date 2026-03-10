import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import usePagination from '@/hooks/usePagination'

// Redux Actions
import {
  setCourtsPagination,
  addCourtsPagination,
  updateCourtsPagination,
  deleteCourts,
} from '@/redux-store/slices/courts'

// API Methods
import {
  listCourtByIdWithPagination,
  deleteCourt,
  createCourt,
  updateCourt
} from '../api'

// API Methods para obtener sucursales y tipos de cancha
import { listBranchesByOwner } from '@/views/branches/api'
import { getCourtTypes } from '@/views/court-types/api'

export const useCourtsClient = (dictionary) => {
  /*_____________________________________
  │ REDUX STATE                          │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const courtsReducer = useSelector(state => state.courtsReducer)

  /*_____________________________________
  │ LOCAL STATE - UI                     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const [showform, setShowform] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [isLoading, setIsLoading] = useState(false)
  const [branchesList, setBranchesList] = useState([])
  const [courtTypesList, setCourtTypesList] = useState([])

  /*_____________________________________
  │ PAGINATION HOOK                     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const {
    pagination,
    isReady: isPaginationReady,
    getParams,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = usePagination({
    pageSize: 8,
    orderBy: 'rating_avg',
    orderByMode: 'desc'
  })

  /*_____________________________________
  │ MEMOIZED VALUES                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const memoizedDictionary = useMemo(
    () => dictionary,
    [JSON.stringify(dictionary)]
  )

  /*_____________________________________
  │ GET COURTS DATA                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const getCourts = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) {
      console.warn('Usuario no autenticado')
      return
    }

    try {
      setIsLoading(true)
      const params = getParams(pagination)
      const courtsData = await listCourtByIdWithPagination(usuario.id, params)
      dispatch(setCourtsPagination(courtsData))
    } catch (error) {
      console.error('Error fetching courts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, isPaginationReady, pagination, getParams, dispatch])

  /*_____________________________________
  │ GET BRANCHES LIST                    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const getBranches = useCallback(async () => {
    if (!usuario?.id) return

    try {
      const dataBranchOwner = await listBranchesByOwner(usuario.id)
      if (!Array.isArray(dataBranchOwner)) {
        setBranchesList([])
        return
      }

      // Obtener las sucursales únicas del formato SportsVenueUsers
      const branches = dataBranchOwner
        .map(item => {
          const venue = item.SportsVenue || item.Branches
          if (!venue) return null
          return {
            id: venue.id,
            name: venue.name,
            company_name: venue.company_name
          }
        })
        .filter(branch => branch !== null)
        .filter((branch, index, self) =>
          index === self.findIndex(b => b.id === branch.id)
        )

      setBranchesList(branches)
    } catch (error) {
      console.error('Error fetching branches:', error)
      setBranchesList([])
    }
  }, [usuario?.id])

  const getCourtTypesList = useCallback(async () => {
    try {
      const list = await getCourtTypes(true)
      setCourtTypesList(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error('Error fetching court types:', error)
      setCourtTypesList([])
    }
  }, [])

  /*_____________________________________
  │ HANDLE SET DEFAULT PROPS             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleSetDefautProps = useCallback(() => {
    setShowform(false)
    setDataProp({ action: '', data: null })
  }, [])

  /*_____________________________________
  │ ADD OR UPDATE COURT                  │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const addOrUpdateCourt = useCallback(async ({ formData, isEditMode, courtId }) => {
    try {
      if (isEditMode && courtId) {
        const editData = await updateCourt(courtId, formData)
        if (editData) {
          dispatch(updateCourtsPagination(editData))
        }
        return editData
      } else {
        // CREATE: crear y luego refetch para que paginación y lista queden sincronizados
        const createData = await createCourt(formData)
        if (createData) {
          await getCourts()
        }
        return createData
      }
    } catch (error) {
      console.error('Error saving court:', error)
      throw error
    }
  }, [dispatch, getCourts])

  /*_____________________________________
  │ DELETE COURT                         │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const deactivateCourts = useCallback(async (isConfirmed) => {
    if (isConfirmed && dataProp.data) {
      try {
        await deleteCourt(dataProp.data)
        dispatch(deleteCourts(dataProp.data))
      } catch (error) {
        console.error('Error deactivating court:', error)
      }
    }
  }, [dataProp.data, dispatch])

  /*_____________________________________
  │ EFFECTS                              │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    if (!isPaginationReady || !usuario?.id) return
    getCourts()
  }, [isPaginationReady, usuario?.id, getCourts])

  useEffect(() => {
    getBranches()
  }, [getBranches])

  useEffect(() => {
    getCourtTypesList()
  }, [getCourtTypesList])

  /*_____________________________________
  │ RETURN CONTROLLER OBJECT             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  return {
    // Dictionary
    memoizedDictionary,
    dictionary,

    // Redux State
    courtsReducer,
    usuario,

    // UI State
    loading: isLoading,
    showform,
    setShowform,

    // Form State
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,

    // Branches List
    branchesList,

    // Court types (for selector)
    courtTypesList,

    // Pagination
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,

    // Business Methods
    getCourts,
    getBranches,
    handleSetDefautProps,
    addOrUpdateCourt,
    deactivateCourts,
  }
}
