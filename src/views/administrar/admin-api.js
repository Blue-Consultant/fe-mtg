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

export function notifySaved(message) {
  notificationSuccesMessage(message)
}

export function notifyFailed(error, fallback) {
  const message = error?.response?.data?.message

  notificationErrorMessage(typeof message === 'string' && message.trim() ? message : fallback)
}
