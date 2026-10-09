'use client'

import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import styles from './live-court.module.css'
import { useLiveCourt } from './useLiveCourt'

function playerName(cliente) {
  const name = [cliente?.first_name, cliente?.last_name].filter(Boolean).join(' ').trim()

  return name || 'Jugador'
}

function money(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function dayLabel(ymd, today) {
  if (!ymd) return ''
  if (ymd === today) return 'Hoy'
  const date = new Date(`${ymd}T12:00:00`)

  if (Number.isNaN(date.getTime())) return ymd

  return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
}

function phoneHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')

  if (!digits) return ''
  if (digits.startsWith('51')) return `tel:+${digits}`

  return `tel:+51${digits}`
}

function ReservationCard({ item, today, pending, busy, onAccept, onReject }) {
  const [confirmReject, setConfirmReject] = useState(false)
  const name = playerName(item.cliente)
  const phone = phoneHref(item.cliente?.phone_number)
  const when = `${dayLabel(item.fecha, today)} · ${item.hora_inicio}–${item.hora_fin}`

  return (
    <article className={styles.card}>
      <div className={styles.cardMain}>
        <p className={styles.kicker}>{item.cancha?.nombre || 'Cancha'}</p>
        <h3>{name}</h3>
        <p className={styles.when}>{when}</p>
        <p className={styles.meta}>
          {money(item.total)}
          {item.cancha?.sede ? ` · ${item.cancha.sede}` : ''}
        </p>
        {phone ? (
          <a className={styles.phone} href={phone}>
            Llamar
          </a>
        ) : null}
      </div>
      {pending && item.pago?.comprobante_url ? (
        <a className={styles.shot} href={item.pago.comprobante_url} target='_blank' rel='noreferrer'>
          <img src={item.pago.comprobante_url} alt={`Captura de Yape de ${name}`} />
          <span>Ver captura</span>
        </a>
      ) : null}
      {pending ? (
        <div className={styles.actions}>
          {confirmReject ? (
            <>
              <p>Si lo rechazas, esa hora queda libre.</p>
              <button type='button' className={styles.danger} disabled={busy} onClick={() => onReject(item.id)}>
                Sí, rechazar
              </button>
              <button type='button' className={styles.ghost} disabled={busy} onClick={() => setConfirmReject(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button type='button' className={styles.primary} disabled={busy} onClick={() => onAccept(item.id)}>
                Aceptar
              </button>
              <button type='button' className={styles.ghost} disabled={busy} onClick={() => setConfirmReject(true)}>
                Rechazar
              </button>
            </>
          )}
        </div>
      ) : null}
    </article>
  )
}

const TABS = [
  {
    id: 'por_aceptar',
    label: 'Por aceptar',
    hint: 'Yape que todavía tienes que revisar. Siguen aquí hasta que aceptes o rechaces.',
    empty: 'No tienes Yape pendientes. Cuando un jugador envíe su captura, aparece aquí.'
  },
  {
    id: 'jugando',
    label: 'Jugando ahora',
    hint: 'Estas personas están en la cancha en este momento.',
    empty: 'Nadie está jugando en este momento.'
  },
  {
    id: 'reservadas',
    label: 'Próximas',
    hint: 'Ya están confirmadas y juegan más tarde hoy.',
    empty: 'No hay más reservas confirmadas para hoy.'
  },
  {
    id: 'terminaron',
    label: 'Finalizadas',
    hint: 'Ya jugaron hoy y su hora terminó.',
    empty: 'Todavía no termina ninguna reserva de hoy.'
  }
]

export default function LiveCourt({ embedded = false }) {
  const { lang } = useParams()
  const locale = lang || 'es'
  const { board, loading, error, busyId, actionError, reload, review } = useLiveCourt()
  const [tab, setTab] = useState('por_aceptar')
  const pendingSeen = useRef(null)
  const current = TABS.find(item => item.id === tab) || TABS[0]
  const items = board[current.id] || []

  useEffect(() => {
    if (loading) return
    const count = board.por_aceptar.length

    if (pendingSeen.current != null && count > pendingSeen.current) setTab('por_aceptar')
    pendingSeen.current = count
  }, [loading, board.por_aceptar.length])

  const list = (pending = false) =>
    items.length ? (
      <div className={styles.list}>
        {items.map(item => (
          <ReservationCard
            key={item.id}
            item={item}
            today={board.today}
            pending={pending}
            busy={busyId === item.id}
            onAccept={id => review(id, 'aceptar')}
            onReject={id => review(id, 'rechazar')}
          />
        ))}
      </div>
    ) : null

  return (
    <div className={styles.page}>
      {embedded ? (
        <div className={styles.hero}>
          <p>{board.now ? `Son las ${board.now}.` : 'Lo que pasa ahora en tus canchas.'}</p>
          <button type='button' className={styles.ghost} onClick={reload}>
            Actualizar
          </button>
        </div>
      ) : (
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Tus canchas</p>
            <h1>Reservas de hoy</h1>
            <p>
              Elige una pestaña para ver qué está pasando en tus canchas.
              {board.now ? ` Son las ${board.now}.` : ''}
            </p>
          </div>
          <button type='button' className={styles.ghost} onClick={reload}>
            Actualizar
          </button>
        </header>
      )}

      {error ? <p className={styles.error}>{error}</p> : null}
      {actionError ? <p className={styles.error}>{actionError}</p> : null}
      {loading ? <p className={styles.empty}>Cargando las reservas…</p> : null}

      {!loading ? (
        <>
          <div className={styles.tabs} role='tablist' aria-label='Reservas de hoy'>
            {TABS.map(item => {
              const count = (board[item.id] || []).length

              return (
                <button
                  key={item.id}
                  type='button'
                  role='tab'
                  aria-selected={tab === item.id}
                  className={tab === item.id ? styles.tabOn : styles.tab}
                  onClick={() => setTab(item.id)}
                >
                  <strong>{count}</strong>
                  {item.label}
                </button>
              )
            })}
          </div>
          <section className={styles.section} role='tabpanel'>
            <p>{current.hint}</p>
            {list(current.id === 'por_aceptar') || <p className={styles.empty}>{current.empty}</p>}
          </section>
          <p className={styles.history}>
            <Link href={`/${locale}/owner-reservations/historial`}>Historial de reservas</Link>
          </p>
        </>
      ) : null}
    </div>
  )
}
