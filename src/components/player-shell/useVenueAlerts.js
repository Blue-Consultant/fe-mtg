'use client'

import { useCallback, useEffect, useState } from 'react'

import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

import { notificationInfoMessage } from '@/components/ToastNotification'
import { listNotificationsIdUser, updateNotifications } from '@/views/notifications/ApiNotifications'

export function useVenueAlerts(enabled) {
  const userId = useSelector(state => state.loginReducer.user?.id)
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    const data = await listNotificationsIdUser(userId)

    setItems(Array.isArray(data) ? data.filter(item => item?.status !== false) : [])
  }, [userId])

  useEffect(() => {
    if (!enabled || !userId) {
      setItems([])
      setOpen(false)

      return undefined
    }

    load()

    const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 20000,
      query: { userId }
    })

    const onCreated = data => {
      const notice = data?.notification || data

      if (notice?.title) notificationInfoMessage(notice.title)
      load()
      window.dispatchEvent(new CustomEvent('mtg-owner-board'))
    }

    const onBoard = () => {
      load()
      window.dispatchEvent(new CustomEvent('mtg-owner-board'))
    }

    socket.on('notificationCreated', onCreated)
    socket.on('ownerBoardChanged', onBoard)

    return () => {
      socket.off('notificationCreated', onCreated)
      socket.off('ownerBoardChanged', onBoard)
      socket.disconnect()
    }
  }, [enabled, userId, load])

  const unread = items.filter(item => !item.read).length

  const markRead = async item => {
    if (!item?.id || item.read) return
    setItems(current => current.map(row => (row.id === item.id ? { ...row, read: true } : row)))
    await updateNotifications(item.id, { read: true })
  }

  return { items, unread, open, setOpen, markRead }
}
