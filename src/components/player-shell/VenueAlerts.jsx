'use client'

import { useRouter } from 'next/navigation'

import styles from '@/views/explorar/player-board.module.css'

export function VenueAlertButton({ alerts, className }) {
  return (
    <button
      type='button'
      className={className}
      aria-label='Notificaciones'
      aria-expanded={alerts.open}
      onClick={() => alerts.setOpen(open => !open)}
    >
      <i className='ri-notification-2-line' aria-hidden />
      {alerts.unread > 0 ? <span className={styles.alertBadge}>{alerts.unread}</span> : null}
    </button>
  )
}

export function VenueAlertPanel({ alerts, locale, onOpenReservation }) {
  const router = useRouter()

  if (!alerts.open) return null

  const openItem = async item => {
    await alerts.markRead(item)
    alerts.setOpen(false)
    onOpenReservation?.()
    router.push(`/${locale}/owner-reservations`)
  }

  return (
    <>
      <button type='button' className={styles.alertBackdrop} aria-label='Cerrar notificaciones' onClick={() => alerts.setOpen(false)} />
      <div className={styles.alertPanel} role='dialog' aria-label='Notificaciones'>
        <p className={styles.alertTitle}>Notificaciones</p>
        {alerts.items.length ? (
          <ul className={styles.alertList}>
            {alerts.items.map(item => (
              <li key={item.id}>
                <button type='button' className={item.read ? styles.alertItem : styles.alertItemNew} onClick={() => openItem(item)}>
                  <strong>{item.title}</strong>
                  {item.message ? <span>{item.message}</span> : null}
                  {item.time ? <small>{item.time}</small> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.alertEmpty}>Cuando un jugador envíe su Yape, te avisamos aquí.</p>
        )}
      </div>
    </>
  )
}
