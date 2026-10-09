'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { notificationInfoMessage } from '@/components/ToastNotification'

import { loadLiveBoard, reviewErrorMessage, reviewReservation } from './live-api'

const playerName = cliente => {
  const name = [cliente?.first_name, cliente?.last_name].filter(Boolean).join(' ').trim()

  return name || ''
}

const EMPTY = {
  today: '',
  now: '',
  por_aceptar: [],
  jugando: [],
  reservadas: [],
  terminaron: []
}

export function useLiveCourt() {
  const [board, setBoard] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const boardRef = useRef(EMPTY)

  const reload = useCallback(async () => {
    try {
      const data = await loadLiveBoard()

      setBoard({
        today: data?.today || '',
        now: data?.now || '',
        por_aceptar: data?.por_aceptar || [],
        jugando: data?.jugando || [],
        reservadas: data?.reservadas || [],
        terminaron: data?.terminaron || []
      })
      setError('')
      boardRef.current = {
        today: data?.today || '',
        now: data?.now || '',
        por_aceptar: data?.por_aceptar || [],
        jugando: data?.jugando || [],
        reservadas: data?.reservadas || [],
        terminaron: data?.terminaron || []
      }
    } catch (err) {
      setError(reviewErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      await reload()
      if (!cancelled) setLoading(false)
    }

    run()

    const onChange = () => {
      reload()
    }

    window.addEventListener('mtg-owner-board', onChange)

    return () => {
      cancelled = true
      window.removeEventListener('mtg-owner-board', onChange)
    }
  }, [reload])

  const review = async (id, decision) => {
    const item = boardRef.current.por_aceptar.find(row => row.id === id)
    const name = playerName(item?.cliente)

    setBusyId(id)
    setActionError('')

    try {
      await reviewReservation(id, decision)
      notificationInfoMessage(
        decision === 'aceptar'
          ? name
            ? `Aceptaste la reserva de ${name}.`
            : 'Aceptaste la reserva.'
          : 'Rechazaste la reserva. Esa hora quedó libre.'
      )
      await reload()

      return true
    } catch (err) {
      setActionError(reviewErrorMessage(err))

      return false
    } finally {
      setBusyId(null)
    }
  }

  return { board, loading, error, busyId, actionError, reload, review }
}
