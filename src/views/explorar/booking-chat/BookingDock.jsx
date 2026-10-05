'use client'

import { useEffect, useState } from 'react'

import { createPortal } from 'react-dom'

import { formatMoney } from './booking-script'
import BookingChat from './BookingChat'
import styles from './booking-dock.module.css'

export default function BookingDock({ selectionKey, draft, authenticated, playerName }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hoursLabel = draft.hours === 1 ? '1 hora' : `${draft.hours} horas`
  const detail = `${draft.start} – ${draft.end} · ${draft.courtName}`

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className={styles.anchor}>
      {open ? (
        <BookingChat
          selectionKey={selectionKey}
          draft={draft}
          authenticated={authenticated}
          playerName={playerName}
          onClose={() => setOpen(false)}
        />
      ) : null}
      <button type='button' className={styles.pill} aria-expanded={open} onClick={() => setOpen(current => !current)}>
        <span className={styles.count}>{draft.hours}</span>
        <span className={styles.copy}>
          <strong>{open ? 'Da clic aquí para cerrar' : 'Da clic aquí para continuar tu reserva'}</strong>
          <span>
            {hoursLabel} · {detail}
          </span>
        </span>
        <strong className={styles.amount}>{formatMoney(draft.total)}</strong>
        <i className={`${styles.chevron} ${open ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}`} aria-hidden />
      </button>
    </div>,
    document.body
  )
}
