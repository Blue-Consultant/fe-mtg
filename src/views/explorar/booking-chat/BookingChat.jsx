'use client'

import { useEffect, useRef, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { Conversation, useConversation } from '@/components/conversation'

import {
  accountExistsByDocument,
  accountExistsByEmail,
  loginAndStartSession,
  registerAndStartSession
} from './booking-account'
import {
  applyBookingTurn,
  composerFor,
  initialBookingState,
  loginFailure,
  openingMessages,
  sessionFailure,
  signedInState,
  yapeReceivedMessages
} from './booking-script'
import { holdYapeSlot, releaseYapeHold, submitYapeCapture, yapeErrorMessage } from './booking-yape'

export default function BookingChat({ selectionKey, draft, authenticated, playerName, onClose, onSlotTaken }) {
  const router = useRouter()
  const { lang } = useParams()
  const { messages, isTyping, reset, cancel, speak, reply, stopTyping } = useConversation()
  const [booking, setBooking] = useState(initialBookingState)
  const [working, setWorking] = useState(false)
  const draftRef = useRef(draft)
  const urls = useRef([])
  const busy = useRef(false)
  const holdIdRef = useRef(null)

  draftRef.current = draft

  useEffect(() => {
    urls.current.forEach(url => URL.revokeObjectURL(url))
    urls.current = []
    busy.current = false
    setWorking(false)
    setBooking(initialBookingState())
    reset()
    speak(openingMessages(draftRef.current))

    return () => {
      const held = holdIdRef.current

      holdIdRef.current = null
      if (held) releaseYapeHold(held)
      cancel()
    }
  }, [selectionKey, reset, speak, cancel])

  useEffect(
    () => () => {
      urls.current.forEach(url => URL.revokeObjectURL(url))
    },
    []
  )

  const apartar = async (current, name) => {
    try {
      const hold = await holdYapeSlot(draftRef.current)

      holdIdRef.current = hold.reserva_id
      const next = signedInState(current, draftRef.current, name, hold)

      setBooking(next.state)
      await speak(next.messages)
    } catch (error) {
      holdIdRef.current = null
      setBooking({ ...current, step: 'review', holdId: null, profile: { ...current.profile, password: '' } })
      if (error?.response?.status === 409) onSlotTaken?.()
      await speak([{ role: 'assistant', text: yapeErrorMessage(error) }])
    }
  }

  const turn = async (input, userMessage) => {
    if (busy.current || isTyping) return
    busy.current = true
    setWorking(true)

    try {
      const result = applyBookingTurn(booking, draftRef.current, input, { authenticated, playerName })

      await reply(userMessage, result.messages, { keepTyping: Boolean(result.effect) })

      if (result.close) {
        window.setTimeout(onClose, 1200)

        return
      }

      if (result.effect === 'go-reservations') {
        onClose?.()
        router.push(`/${lang || 'es'}/mis-reservas`)

        return
      }

      if (result.effect === 'login') {
        const session = await loginAndStartSession(result.state.profile.email, result.state.profile.password)

        if (!session.ok) {
          const next = session.reason === 'session' ? sessionFailure(result.state) : loginFailure(result.state)

          setBooking(next.state)
          await speak(next.messages)

          return
        }

        await apartar(result.state, session.name)

        return
      }

      if (result.effect === 'check-email') {
        const exists = await accountExistsByEmail(result.state.profile.email)

        if (exists) {
          setBooking({ ...result.state, step: 'login-password' })
          await speak([
            {
              role: 'assistant',
              text: 'Ese correo ya tiene cuenta. Escribe tu contraseña.'
            }
          ])

          return
        }

        setBooking({ ...result.state, step: 'reg-password' })
        await speak([{ role: 'assistant', text: 'Mínimo 8 caracteres.' }])

        return
      }

      if (result.effect === 'check-document') {
        const exists = await accountExistsByDocument(result.state.profile.dni)

        if (exists) {
          setBooking({ ...result.state, step: 'login-email', profile: { ...result.state.profile, password: '' } })
          await speak([
            {
              role: 'assistant',
              text: 'Ese DNI ya está registrado. Entra con tu correo.'
            }
          ])

          return
        }

        setBooking({ ...result.state, step: 'reg-phone' })
        await speak([{ role: 'assistant', text: 'Tu celular. Solo los 9 dígitos.' }])

        return
      }

      if (result.effect === 'register') {
        const session = await registerAndStartSession(result.state.profile)

        if (!session.ok) {
          setBooking({ ...result.state, step: 'reg-email', profile: { ...result.state.profile, password: '' } })
          await speak([{ role: 'assistant', text: session.message }])

          return
        }

        await apartar(result.state, session.name || result.state.profile.name)

        return
      }

      if (result.effect === 'hold') {
        await apartar(result.state, playerName)

        return
      }

      if (result.effect === 'submit-yape') {
        try {
          await submitYapeCapture(input.file, draftRef.current, holdIdRef.current)
          holdIdRef.current = null
          setBooking({
            ...result.state,
            step: 'done',
            profile: { ...result.state.profile, password: '' }
          })
          await speak(yapeReceivedMessages(draftRef.current))
        } catch (error) {
          const taken = error?.response?.status === 409

          if (taken) {
            const held = holdIdRef.current

            holdIdRef.current = null
            if (held) releaseYapeHold(held)
            onSlotTaken?.()
          }

          setBooking({ ...result.state, step: taken ? 'review' : 'payment', holdId: taken ? null : result.state.holdId })
          await speak([{ role: 'assistant', text: yapeErrorMessage(error) }])
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
      kicker='Reserva'
      title={draft.courtName}
      onClose={onClose}
      messages={messages}
      isTyping={isTyping}
      busy={working}
      composer={composerFor(booking)}
      onChoice={choice => turn({ id: choice.id }, { role: 'user', text: choice.label })}
      onText={value =>
        turn({ value }, { role: 'user', text: composerFor(booking)?.secret ? '••••••••' : value.trim() })
      }
      onFile={file => {
        const imageUrl = String(file.type || '').startsWith('image/') ? URL.createObjectURL(file) : ''

        if (imageUrl) urls.current.push(imageUrl)
        turn(
          { file },
          imageUrl
            ? { role: 'user', kind: 'image', text: 'Captura de Yape', imageUrl }
            : { role: 'user', text: file.name || 'Archivo' }
        )
      }}
    />
  )
}
