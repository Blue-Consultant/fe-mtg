'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { searchCourts } from '@/views/courts/api'
import { getCourtTypes } from '@/views/court-types/api'
import { notificationInfoMessage } from '@/components/ToastNotification'
import { useExploreFilters } from './useExploreFilters'

const toYYYYMMDD = d => (d ? d.toISOString().split('T')[0] : '')
const DEFAULT_PAGE_SIZE = 8

/**
 * Carga canchas (search API con paginación), tipos de cancha y aplica filtros client-side.
 * Retorna: courts (filtrados), courtTypes, loading, title, filters, loadCourts, pagination.
 */
export function useExploreCourts({
  lang,
  initialFecha,
  initialHoraInicio,
  initialHoraFin,
  initialCourtTypeId,
}) {
  const filters = useExploreFilters({
    fecha: initialFecha,
    hora_inicio: initialHoraInicio,
    hora_fin: initialHoraFin,
    court_type_id: initialCourtTypeId,
  })

  const [courtsRaw, setCourtsRaw] = useState([])
  const [courtTypes, setCourtTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Explorar canchas')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(DEFAULT_PAGE_SIZE)

  const loadCourts = useCallback(async (pageNum = 1) => {
    const { fecha, hora_inicio, hora_fin, court_type_id } = filters.filtersForApi
    setLoading(true)
    try {
      const today = toYYYYMMDD(new Date())
      const f = fecha || today
      const hi = hora_inicio || '06:00'
      const hf = hora_fin || '23:00'
      const ctId = court_type_id != null && court_type_id !== '' ? Number(court_type_id) : null

      const response = await searchCourts(f, hi, hf, ctId, pageNum, pageSize)
      const data = response?.data ?? []
      const totalItems = response?.total ?? 0

      setCourtsRaw(data)
      setTotal(totalItems)
      setPage(pageNum)

      if (totalItems > 0) {
        setTitle('Resultados de búsqueda')
      } else {
        setTitle('Sin resultados')
        notificationInfoMessage('No se encontraron canchas con los filtros seleccionados.')
      }
    } catch (err) {
      console.error('loadCourts', err)
      setCourtsRaw([])
      setTotal(0)
      setTitle('Error al cargar')
    } finally {
      setLoading(false)
    }
  }, [filters.filtersForApi, pageSize])

  const handlePageChange = useCallback((_event, newPage) => {
    if (newPage >= 1) loadCourts(newPage)
  }, [loadCourts])

  useEffect(() => {
    loadCourts()
  }, [loadCourts])

  useEffect(() => {
    if (initialFecha != null) filters.setFilters({ fecha: initialFecha })
    if (initialHoraInicio != null) filters.setFilters({ hora_inicio: initialHoraInicio })
    if (initialCourtTypeId !== undefined) filters.setFilters({ court_type_id: initialCourtTypeId })
  }, [initialFecha, initialHoraInicio, initialCourtTypeId])

  useEffect(() => {
    getCourtTypes(true)
      .then(list => setCourtTypes(Array.isArray(list) ? list : []))
      .catch(() => setCourtTypes([]))
  }, [])

  const courts = useMemo(
    () => filters.applyClientFilters(courtsRaw),
    [courtsRaw, filters.applyClientFilters]
  )

  const venuesFromCourts = useMemo(() => {
    const map = new Map()
    courtsRaw.forEach(c => {
      const v = c.SportsVenue
      if (v && v.id) map.set(v.id, { id: v.id, name: v.name || v.nombre || 'Sede' })
    })
    return Array.from(map.values())
  }, [courtsRaw])

  return {
    courts,
    courtTypes,
    loading,
    title,
    filters,
    loadCourts,
    venuesFromCourts,
    pagination: {
      page,
      total,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
      onPageChange: handlePageChange,
    },
  }
}
