import axios from '@/utils/axios'

export async function loadLiveBoard() {
  const { data } = await axios.get('reservations/owner/live')

  return data
}

export async function reviewReservation(id, decision) {
  const { data } = await axios.post(`reservations/owner/${id}/review`, { decision })

  return data
}

export function reviewErrorMessage(error) {
  const message = error?.response?.data?.message

  if (Array.isArray(message) && message[0]) return String(message[0])
  if (typeof message === 'string' && message.trim()) return message

  return 'No se pudo actualizar la reserva. Inténtalo otra vez.'
}
