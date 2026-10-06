'use client'

import { useEffect, useState } from 'react'

import { createPortal } from 'react-dom'

import styles from '@/views/explorar/booking-chat/booking-dock.module.css'

import { formatRanges } from './schedule-model'
import AdminChat from './AdminChat'

export default function AdminDock({ flowKey, rangesKey, draft, onSaved }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [flowKey])

  if (!mounted) return null

  return createPortal(
    <div className={styles.anchor}>
      {open ? (
        <AdminChat
          flowKey={flowKey}
          rangesKey={rangesKey}
          draft={draft}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false)
            onSaved()
          }}
        />
      ) : null}
      <button type='button' className={styles.pill} aria-expanded={open} onClick={() => setOpen(current => !current)}>
        <span className={styles.count}>{draft.hours}</span>
        <span className={styles.copy}>
          <strong>{open ? 'Da clic aquí para cerrar' : 'Da clic aquí para definir estas horas'}</strong>
          <span>
            {formatRanges(draft.ranges)} · {draft.dateLabel}
          </span>
        </span>
        <i className={`${styles.chevron} ${open ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}`} aria-hidden />
      </button>
    </div>,
    document.body
  )
}
