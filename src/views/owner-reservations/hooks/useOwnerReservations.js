import { useCallback, useEffect, useMemo, useState } from 'react'

import { useSelector } from 'react-redux'

import debounce from 'lodash.debounce'

import usePagination from '@/hooks/usePagination'

import { listCourtsByUser } from '@/views/ratings/api'
import { getOwnerCollectionsSummary, listOwnerReservationsPaginated } from '../api'

const emptyStats = () => ({
  currency: 'PEN',
  today: 0,
  yesterday: 0,
  last_7_days: 0,
  month_to_date: 0,
  last_month_total: 0,
  daily_history: []
})

function ymd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${day}`
}

export function todayYmd() {
  return ymd(new Date())
}

export function daysAgoYmd(days) {
  const date = new Date()

  date.setDate(date.getDate() - days)

  return ymd(date)
}

export function monthStartYmd() {
  const date = new Date()

  return ymd(new Date(date.getFullYear(), date.getMonth(), 1))
}

export const useOwnerReservations = () => {
  const usuario = useSelector(state => state.loginReducer.user)
  const [loading, setLoading] = useState(false)
  const [loadingCollections, setLoadingCollections] = useState(false)
  const [list, setList] = useState({ rows: [], totalRows: 0, totalPages: 0, currentPage: 1 })
  const [collections, setCollections] = useState(() => emptyStats())
  const [courtsList, setCourtsList] = useState([])

  const [fechaDesde, setFechaDesdeState] = useState('')
  const [fechaHasta, setFechaHastaState] = useState('')
  const [estadoReserva, setEstadoReservaState] = useState('')
  const [estadoPago, setEstadoPagoState] = useState('')
  const [canchaId, setCanchaIdState] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')

  const [searchInput, setSearchInput] = useState('')

  const debouncedSetSearch = useMemo(
    () =>
      debounce(value => {
        setSearchDebounced(String(value).trim())
      }, 450),
    []
  )

  useEffect(() => {
    debouncedSetSearch(searchInput)

    return () => debouncedSetSearch.cancel()
  }, [searchInput, debouncedSetSearch])

  const {
    pagination,
    isReady: isPaginationReady,
    getParams,
    handlePageChange,
    handlePageSizeChange,
    updatePagination
  } = usePagination({
    pageSize: 10,
    orderBy: 'fecha',
    orderByMode: 'desc'
  })

  const setFechaDesde = useCallback(
    v => {
      setFechaDesdeState(v)
      updatePagination({ currentPage: 1 })
    },
    [updatePagination]
  )

  const setFechaHasta = useCallback(
    v => {
      setFechaHastaState(v)
      updatePagination({ currentPage: 1 })
    },
    [updatePagination]
  )

  const setEstadoReserva = useCallback(
    v => {
      setEstadoReservaState(v)
      updatePagination({ currentPage: 1 })
    },
    [updatePagination]
  )

  const setEstadoPago = useCallback(
    v => {
      setEstadoPagoState(v)
      updatePagination({ currentPage: 1 })
    },
    [updatePagination]
  )

  const setCanchaId = useCallback(
    v => {
      setCanchaIdState(v)
      updatePagination({ currentPage: 1 })
    },
    [updatePagination]
  )

  useEffect(() => {
    updatePagination({ currentPage: 1 })
  }, [searchDebounced, updatePagination])

  const fetchCourts = useCallback(async () => {
    if (!usuario?.id) return

    try {
      const courts = await listCourtsByUser(usuario.id)

      setCourtsList(Array.isArray(courts) ? courts : [])
    } catch {
      setCourtsList([])
    }
  }, [usuario?.id])

  const fetchCollections = useCallback(async () => {
    if (!usuario?.id) return
    setLoadingCollections(true)

    try {
      const data = await getOwnerCollectionsSummary()

      setCollections({
        currency: data?.currency ?? 'PEN',
        today: Number(data?.today) || 0,
        yesterday: Number(data?.yesterday) || 0,
        last_7_days: Number(data?.last_7_days) || 0,
        month_to_date: Number(data?.month_to_date) || 0,
        last_month_total: Number(data?.last_month_total) || 0,
        daily_history: Array.isArray(data?.daily_history) ? data.daily_history : []
      })
    } catch (e) {
      console.error(e)
      setCollections(emptyStats())
    } finally {
      setLoadingCollections(false)
    }
  }, [usuario?.id])

  const fetchReservations = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) return
    setLoading(true)

    try {
      const p = getParams(pagination)

      const params = {
        ...p,
        fecha_desde: fechaDesde || undefined,
        fecha_hasta: fechaHasta || undefined,
        estado_reserva: estadoReserva || undefined,
        estado_pago: estadoPago || undefined,
        cancha_id: canchaId === '' ? undefined : Number(canchaId),
        search: searchDebounced || undefined
      }

      const data = await listOwnerReservationsPaginated(params)

      setList({
        rows: data?.rows ?? [],
        totalRows: data?.totalRows ?? 0,
        totalPages: data?.totalPages ?? 0,
        currentPage: data?.currentPage ?? 1
      })
    } catch (e) {
      console.error(e)
      setList({ rows: [], totalRows: 0, totalPages: 0, currentPage: 1 })
    } finally {
      setLoading(false)
    }
  }, [
    usuario?.id,
    isPaginationReady,
    getParams,
    pagination,
    fechaDesde,
    fechaHasta,
    estadoReserva,
    estadoPago,
    canchaId,
    searchDebounced
  ])

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const refetchAll = useCallback(() => {
    fetchReservations()
    fetchCollections()
  }, [fetchReservations, fetchCollections])

  const applyRange = useCallback(
    (desde, hasta) => {
      setFechaDesdeState(desde)
      setFechaHastaState(hasta)
      updatePagination({ currentPage: 1 })
    },
    [updatePagination]
  )

  const handleResetFilters = useCallback(() => {
    setFechaDesdeState('')
    setFechaHastaState('')
    setEstadoReservaState('')
    setEstadoPagoState('')
    setCanchaIdState('')
    setSearchInput('')
    setSearchDebounced('')
    debouncedSetSearch.cancel()
    updatePagination({ currentPage: 1, pageSize: 10 })
  }, [updatePagination, debouncedSetSearch])

  return {
    usuario,
    loading,
    loadingCollections,
    collections,
    list,
    courtsList,
    fechaDesde,
    setFechaDesde,
    fechaHasta,
    setFechaHasta,
    applyRange,
    estadoReserva,
    setEstadoReserva,
    estadoPago,
    setEstadoPago,
    canchaId,
    setCanchaId,
    searchInput,
    setSearchInput,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    handleResetFilters,
    refetch: refetchAll
  }
}
