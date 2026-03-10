'use client'

import { useCallback, useMemo, useState } from 'react'

const toYYYYMMDD = d => (d ? d.toISOString().split('T')[0] : '')

/** Suma 1 hora a "HH:mm". Si pasa de 24:00, devuelve "23:00". */
function add1Hour(timeStr) {
  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) return '23:00'
  const [h, m] = timeStr.split(':').map(Number)
  let next = h * 60 + m + 60

  if (next >= 24 * 60) return '23:00'
  const h2 = Math.floor(next / 60)
  const m2 = next % 60

  return `${String(h2).padStart(2, '0')}:${String(m2).padStart(2, '0')}`
}

/**
 * Estado y lógica de filtros para la vista Explorar.
 * Filtros: nombre de cancha, tipo de cancha, ubicación (sede), fecha, horario (solo hora de inicio; la fin se deduce +1h).
 */
export function useExploreFilters(initialState = {}) {
  const today = new Date()
  const defaultFecha = initialState.fecha ?? toYYYYMMDD(today)
  const defaultHoraInicio = initialState.hora_inicio ?? '06:00'

  const [nombre, setNombre] = useState(initialState.nombre ?? '')
  const [courtTypeId, setCourtTypeId] = useState(initialState.court_type_id ?? null)
  const [ubicacionId, setUbicacionId] = useState(initialState.ubicacion_id ?? null)
  const [minRating, setMinRating] = useState(initialState.min_rating ?? null)
  const [fecha, setFecha] = useState(defaultFecha)
  const [horaInicio, setHoraInicio] = useState(defaultHoraInicio)

  const setFilters = useCallback(values => {
    if (values.nombre !== undefined) setNombre(values.nombre)
    if (values.court_type_id !== undefined) setCourtTypeId(values.court_type_id)
    if (values.ubicacion_id !== undefined) setUbicacionId(values.ubicacion_id)
    if (values.min_rating !== undefined) setMinRating(values.min_rating)
    if (values.fecha !== undefined) setFecha(values.fecha)
    if (values.hora_inicio !== undefined) setHoraInicio(values.hora_inicio)
  }, [])

  const clearFilters = useCallback(() => {
    setNombre('')
    setCourtTypeId(null)
    setUbicacionId(null)
    setMinRating(null)
    setFecha(toYYYYMMDD(new Date()))
    setHoraInicio('06:00')
  }, [])

  const filtersForApi = useMemo(
    () => ({
      fecha,
      hora_inicio: horaInicio,
      hora_fin: add1Hour(horaInicio),
      court_type_id: courtTypeId
    }),
    [fecha, horaInicio, courtTypeId]
  )

  /**
   * Aplica filtros client-side (nombre, ubicación, valoración mínima) sobre la lista de canchas.
   */
  const applyClientFilters = useCallback(
    (courts = []) => {
      let result = courts
      const nombreLower = (nombre || '').trim().toLowerCase()

      if (nombreLower) {
        result = result.filter(c => (c.nombre || c.name || '').toLowerCase().includes(nombreLower))
      }

      if (ubicacionId != null && ubicacionId !== '') {
        const id = Number(ubicacionId)

        result = result.filter(c => Number(c.sede_id) === id || Number(c.SportsVenue?.id) === id)
      }

      if (minRating != null && minRating !== '') {
        const rating = Number(minRating)

        result = result.filter(c => {
          const avg = c.rating_avg != null ? Number(c.rating_avg) : null

          if (avg == null) return false

          return avg >= rating
        })
      }

      return result
    },
    [nombre, ubicacionId, minRating]
  )

  return {
    nombre,
    setNombre,
    courtTypeId,
    setCourtTypeId,
    ubicacionId,
    setUbicacionId,
    minRating,
    setMinRating,
    fecha,
    setFecha,
    horaInicio,
    setHoraInicio,
    setFilters,
    clearFilters,
    filtersForApi,
    applyClientFilters
  }
}
