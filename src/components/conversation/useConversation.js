'use client'

import { useCallback, useRef, useState, useTransition } from 'react'

import { appendMessages, useOptimistic } from './useOptimisticState'

const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms))

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const typingDelay = text => {
  if (prefersReducedMotion()) return 40

  return 520 + Math.min(String(text || '').length * 6, 420)
}

let messageSeq = 0

export function createMessage(partial, role = 'assistant') {
  messageSeq += 1

  return {
    id: partial.id || `msg-${messageSeq}`,
    role: partial.role || role,
    kind: partial.kind || 'text',
    ...partial
  }
}

export function useConversation() {
  const [messages, setMessages] = useState([])
  const [optimisticMessages, addOptimistic] = useOptimistic(messages, appendMessages)
  const [, startTransition] = useTransition()
  const [isTyping, setIsTyping] = useState(false)
  const session = useRef(0)
  const queue = useRef(Promise.resolve())

  const commit = useCallback(
    (runId, updater) => {
      startTransition(() => {
        setMessages(current => (session.current === runId ? updater(current) : current))
      })
    },
    [startTransition]
  )

  const enqueue = useCallback(task => {
    const runId = session.current

    queue.current = queue.current
      .then(async () => {
        if (session.current !== runId) return
        await task(runId)
      })
      .catch(() => {})

    return queue.current
  }, [])

  const cancel = useCallback(() => {
    session.current += 1
  }, [])

  const reset = useCallback(() => {
    session.current += 1
    setIsTyping(false)
    setMessages([])
  }, [])

  const speak = useCallback(
    lines =>
      enqueue(async runId => {
        for (const line of lines) {
          if (session.current !== runId) return
          setIsTyping(true)
          await wait(typingDelay(line.text || line.receipt?.total))
          if (session.current !== runId) return
          commit(runId, current => [...current, createMessage(line)])
        }

        if (session.current === runId) setIsTyping(false)
      }),
    [commit, enqueue]
  )

  const reply = useCallback(
    (userMessage, lines, { keepTyping = false } = {}) =>
      enqueue(async runId => {
        const outgoing = createMessage(userMessage, 'user')

        addOptimistic(outgoing)
        setIsTyping(true)
        await wait(420)
        if (session.current !== runId) return
        commit(runId, current => [...current, outgoing])

        for (const line of lines) {
          if (session.current !== runId) return
          setIsTyping(true)
          await wait(typingDelay(line.text || line.receipt?.total))
          if (session.current !== runId) return
          commit(runId, current => [...current, createMessage(line)])
        }

        if (session.current === runId && !keepTyping) setIsTyping(false)
      }),
    [addOptimistic, commit, enqueue]
  )

  const stopTyping = useCallback(() => {
    setIsTyping(false)
  }, [])

  return {
    messages: optimisticMessages,
    isTyping,
    reset,
    cancel,
    speak,
    reply,
    stopTyping
  }
}
