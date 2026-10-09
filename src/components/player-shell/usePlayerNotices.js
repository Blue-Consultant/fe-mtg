'use client'

import { useEffect } from 'react'

import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

import { notificationInfoMessage } from '@/components/ToastNotification'
import { listNotificationsIdUser, updateNotifications } from '@/views/notifications/ApiNotifications'

const isReservationNotice = item => String(item?.type || '').startsWith('reserva-')

export function usePlayerNotices(enabled) {
  const userId = useSelector(state => state.loginReducer.user?.id)

  useEffect(() => {
    if (!enabled || !userId) return undefined

    let cancelled = false
    const shown = new Set()

    const announce = item => {
      if (!item?.id || shown.has(item.id) || !isReservationNotice(item)) return
      shown.add(item.id)
      notificationInfoMessage(item.message ? `${item.title}. ${item.message}` : item.title)
      if (!item.read) updateNotifications(item.id, { read: true })
    }

    listNotificationsIdUser(userId).then(data => {
      if (cancelled || !Array.isArray(data)) return
      data.filter(item => item?.status !== false && !item.read).forEach(announce)
    })

    const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 20000,
      query: { userId }
    })

    socket.on('notificationCreated', data => announce(data?.notification || data))

    return () => {
      cancelled = true
      socket.off('notificationCreated')
      socket.disconnect()
    }
  }, [enabled, userId])
}
