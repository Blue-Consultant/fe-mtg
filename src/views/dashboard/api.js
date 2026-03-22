import axios from '@/utils/axios'

/** KPIs panel propietario (recaudación, sedes, canchas, clientes, reservas). */
export const getOwnerDashboardStats = async () => {
  const { data } = await axios.get('reservations/owner/dashboard-stats')
  return data
}
