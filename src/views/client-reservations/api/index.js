import axios from '@/utils/axios'

/**
 * @returns {{ pendiente_pago: array, proximas: array, historial: array }}
 */
export const getMyReservationsSummary = async () => {
  const { data } = await axios.get('reservations/me/summary')

  return {
    pendiente_pago: Array.isArray(data?.pendiente_pago) ? data.pendiente_pago : [],
    proximas: Array.isArray(data?.proximas) ? data.proximas : [],
    historial: Array.isArray(data?.historial) ? data.historial : []
  }
}
