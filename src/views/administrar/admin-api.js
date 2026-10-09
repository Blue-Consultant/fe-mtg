import axios from '@/utils/axios'

import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification'

import { listCourtsByUser } from '@/views/price-schedules/api'
import { listDateBlocksWithPagination } from '@/views/date-blocks/api'

const listParams = { currentPage: 1, pageSize: 500, orderBy: 'id', orderByMode: 'asc' }

export async function loadAdminCourts(userId) {
  return listCourtsByUser(userId)
}

export async function loadAdminSchedules(userId) {
  const { data } = await axios.get(`price-schedules/findAllPagination/${userId}/${true}`, { params: listParams })

  return data?.rows || []
}

export async function loadAdminBlocks(userId) {
  const data = await listDateBlocksWithPagination(userId, listParams)

  return data?.rows || []
}

export async function replaceCourtSchedules(courtId, schedules) {
  const { data } = await axios.put(`price-schedules/replace-for-court/${courtId}`, { schedules })

  return data
}

export async function createAdminBlocks(blocks) {
  const created = []

  for (const block of blocks) {
    const { data } = await axios.post('date-blocks/add', block)

    created.push(data)
  }

  return created
}

export async function deleteAdminBlocks(ids) {
  for (const id of ids) {
    await axios.delete(`date-blocks/delete/${id}`)
  }
}

export async function loadBookedSlot(courtId, fecha, hora) {
  const { data } = await axios.get('reservations/owner/slot', {
    params: { cancha_id: courtId, fecha, hora }
  })

  return data
}

export async function lookupClientByDni(dni) {
  const { data } = await axios.get('reservations/owner/client', { params: { dni } })

  return data
}

export async function createManualReservation(body, file) {
  const form = new FormData()

  Object.entries(body).forEach(([key, value]) => {
    if (value == null || value === '') return
    form.append(key, String(value))
  })
  if (file) form.append('comprobante', file)

  const { data } = await axios.post('reservations/owner/manual', form, {
    transformRequest: [
      (payload, headers) => {
        if (payload instanceof FormData) delete headers['Content-Type']

        return payload
      }
    ]
  })

  return data
}

export function notifySaved(message) {
  notificationSuccesMessage(message)
}

export function notifyFailed(error, fallback) {
  const raw = error?.response?.data?.message
  const message = Array.isArray(raw) ? raw[0] : raw

  notificationErrorMessage(typeof message === 'string' && message.trim() ? message : fallback)
}
