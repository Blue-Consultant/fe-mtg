import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import usePagination from '@/hooks/usePagination'

// Redux Actions
import {
  setPriceSchedulesPagination,
  addPriceSchedulesPagination,
  addManyPriceSchedulesPagination,
  updatePriceSchedulesPagination,
  deletePriceSchedules,
} from '@/redux-store/slices/price-schedules'

// API Methods
import {
  listPriceScheduleByIdWithPagination,
  deletePriceSchedule,
  createPriceSchedule,
  createPriceSchedulesBulk,
  updatePriceSchedule,
  listCourtsByUser
} from '../api'

export const usePriceSchedulesClient = (dictionary) => {
  /*_____________________________________
  │ REDUX STATE                          │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const priceSchedulesReducer = useSelector(state => state.priceSchedulesReducer)

  /*_____________________________________
  │ LOCAL STATE - UI                     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const [showform, setShowform] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [isLoading, setIsLoading] = useState(false)
  const [courtsList, setCourtsList] = useState([])

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
    pageSize: 5,
    orderBy: 'id',
    orderByMode: 'asc'
  })

  /*_____________________________________
  │ MEMOIZED VALUES                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const memoizedDictionary = useMemo(
    () => dictionary,
    [JSON.stringify(dictionary)]
  )

  /*_____________________________________
  │ GET PRICE SCHEDULES DATA             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const getPriceSchedules = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) {
      console.warn('Usuario no autenticado')
      return
    }

    try {
      setIsLoading(true)
      const params = getParams(pagination)
      const priceSchedulesData = await listPriceScheduleByIdWithPagination(usuario.id, params)
      dispatch(setPriceSchedulesPagination(priceSchedulesData))
    } catch (error) {
      console.error('Error fetching price schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, isPaginationReady, pagination, getParams, dispatch])

  /*_____________________________________
  │ GET COURTS LIST                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
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

  /*_____________________________________
  │ HANDLE SET DEFAULT PROPS             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleSetDefautProps = useCallback(() => {
    setShowform(false)
    setDataProp({ action: '', data: null })
  }, [])

  /*_____________________________________
  │ ADD OR UPDATE PRICE SCHEDULE         │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const addOrUpdatePriceSchedule = useCallback(async ({ formData, isEditMode, priceScheduleId }) => {
    try {
      if (isEditMode && priceScheduleId) {
        const editData = await updatePriceSchedule(priceScheduleId, formData)
        if (editData) {
          dispatch(updatePriceSchedulesPagination(editData))
        }
        return editData
      }
      // CREATE: bulk si hay varios días, sino uno solo
      const diasArray = Array.isArray(formData.dia_semana) ? formData.dia_semana : (formData.dia_semana != null ? [Number(formData.dia_semana)] : [])
      if (diasArray.length > 1) {
        const { created } = await createPriceSchedulesBulk({
          cancha_id: Number(formData.cancha_id),
          dia_semana: diasArray,
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          precio: Number(formData.precio) || 0,
          estado: Boolean(formData.estado)
        })
        if (created?.length) {
          dispatch(addManyPriceSchedulesPagination(created))
        }
        return { created }
      }
      if (diasArray.length === 1) {
        const createData = await createPriceSchedule({
          cancha_id: Number(formData.cancha_id),
          dia_semana: diasArray[0],
          hora_inicio: formData.hora_inicio,
          hora_fin: formData.hora_fin,
          precio: Number(formData.precio) || 0,
          estado: Boolean(formData.estado)
        })
        if (createData) {
          dispatch(addPriceSchedulesPagination(createData))
        }
        return createData
      }
      throw new Error('Selecciona al menos un día')
    } catch (error) {
      console.error('Error saving price schedule:', error)
      throw error
    }
  }, [dispatch])

  /*_____________________________________
  │ DELETE PRICE SCHEDULE                │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const deactivatePriceSchedules = useCallback(async (isConfirmed) => {
    if (isConfirmed && dataProp.data) {
      try {
        await deletePriceSchedule(dataProp.data)
        dispatch(deletePriceSchedules(dataProp.data))
      } catch (error) {
        console.error('Error deactivating price schedule:', error)
      }
    }
  }, [dataProp.data, dispatch])

  /*_____________________________________
  │ EFFECTS                              │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    if (!isPaginationReady || !usuario?.id) return
    getPriceSchedules()
  }, [isPaginationReady, usuario?.id, getPriceSchedules])

  useEffect(() => {
    getCourts()
  }, [getCourts])

  /*_____________________________________
  │ RETURN CONTROLLER OBJECT             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  return {
    // Dictionary
    memoizedDictionary,
    dictionary,

    // Redux State
    priceSchedulesReducer,
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

    // Courts List
    courtsList,

    // Pagination
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,

    // Business Methods
    getPriceSchedules,
    getCourts,
    handleSetDefautProps,
    addOrUpdatePriceSchedule,
    deactivatePriceSchedules,
  }
}
