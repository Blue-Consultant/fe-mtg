import axios from '@/utils/axios'

/**
 * @param {Record<string, string|number|undefined>} params — fecha, estado_reserva, estado_pago, cancha_id, search, currentPage, pageSize, orderBy, orderByMode
 */
export const listOwnerReservationsPaginated = async params => {
  const { data } = await axios.get('reservations/owner/paginated', { params })

  return data
}

/** Pagos confirmados: totales por periodo + historial diario (misma sede/canchas que el listado). */
export const getOwnerCollectionsSummary = async () => {
  const { data } = await axios.get('reservations/owner/collections-summary')

  return data
}
