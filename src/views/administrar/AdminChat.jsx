'use client'

import { useEffect, useRef, useState } from 'react'

import { Conversation, useConversation } from '@/components/conversation'

import { formatRanges } from './schedule-model'
import { createAdminBlocks, deleteAdminBlocks, notifyFailed, notifySaved, replaceCourtSchedules } from './admin-api'
import { applyAdminTurn, composerFor, initialAdminState, openingMessages } from './admin-script'

export default function AdminChat({ flowKey, rangesKey, draft, onClose, onSaved }) {
  const { messages, isTyping, reset, cancel, speak, reply, stopTyping } = useConversation()
  const [booking, setBooking] = useState(() => ({ ...initialAdminState(), canOpen: draft.canOpen }))
  const [working, setWorking] = useState(false)
  const draftRef = useRef(draft)
  const bookingRef = useRef(booking)
  const flowRef = useRef(flowKey)
  const busy = useRef(false)

  draftRef.current = draft
  bookingRef.current = booking

  useEffect(() => {
    const dayChanged = flowRef.current !== flowKey

    if (dayChanged || bookingRef.current.step === 'intent') return

    busy.current = false
    setWorking(false)
    setBooking({ ...initialAdminState(), canOpen: draftRef.current.canOpen })
    reset()
    speak(openingMessages())
  }, [rangesKey, flowKey, reset, speak])

  useEffect(() => {
    flowRef.current = flowKey
    busy.current = false
    setWorking(false)
    setBooking({ ...initialAdminState(), canOpen: draftRef.current.canOpen })
    reset()
    speak(openingMessages())

    return () => cancel()
  }, [flowKey, reset, speak, cancel])

  const turn = async (input, userMessage) => {
    if (busy.current || isTyping) return
    busy.current = true
    setWorking(true)

    try {
      const result = applyAdminTurn(booking, draftRef.current, input)

      await reply(userMessage, result.messages, { keepTyping: Boolean(result.effect) })

      if (result.effect) {
        try {
          if (result.effect === 'save-price') {
            await replaceCourtSchedules(draftRef.current.courtId, result.payload)
            notifySaved('Precio publicado.')
          }

          if (result.effect === 'save-close') {
            await createAdminBlocks(
              result.payload.map(item => ({ ...item, cancha_id: draftRef.current.courtId }))
            )
            notifySaved('Horario cerrado.')
          }

          if (result.effect === 'save-open') {
            await deleteAdminBlocks(result.payload.filter(Boolean))
            notifySaved('Horario abierto.')
          }

          setBooking(result.state)
          await speak([{ role: 'assistant', text: 'Listo. El calendario ya quedó actualizado.' }])
          onSaved()
        } catch (error) {
          setBooking({ ...result.state, step: 'confirm' })
          notifyFailed(error, 'No se pudo guardar. Inténtalo otra vez.')
          await speak([{ role: 'assistant', text: 'No se pudo guardar. Inténtalo otra vez.' }])
        }

        return
      }

      setBooking(result.state)
    } catch {
      stopTyping()
    } finally {
      busy.current = false
      setWorking(false)
    }
  }

  return (
    <Conversation
      kicker={draft.courtName}
      title={`${draft.hours === 1 ? '1 hora' : `${draft.hours} horas`} · ${formatRanges(draft.ranges)}`}
      onClose={onClose}
      messages={messages}
      isTyping={isTyping}
      busy={working}
      composer={composerFor(booking)}
      onChoice={choice => turn(choice, { role: 'user', text: choice.label })}
      onText={value => turn({ value }, { role: 'user', text: value.trim() })}
    />
  )
}
