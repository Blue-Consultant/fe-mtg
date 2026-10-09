'use client'

import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { useSelector } from 'react-redux'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import { getMyReservationsSummary } from '@/views/client-reservations/api'

import styles from './mis-reservas.module.css'

const TABS = [
  {
    key: 'pendiente_pago',
    label: 'Por confirmar',
    empty: 'No tienes reservas esperando confirmación.'
  },
  {
    key: 'proximas',
    label: 'Próximas',
    empty: 'No tienes partidos próximos.'
  },
  {
    key: 'historial',
    label: 'Historial',
    empty: 'Todavía no hay reservas anteriores.'
  }
]

function reservationDay(value) {
  const raw = String(value || '').slice(0, 10)
  const date = new Date(`${raw}T12:00:00`)

  if (!raw || Number.isNaN(date.getTime())) return 'Sin fecha'

  return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function endLabel(start, end) {
  if (end === '00:00' && start && start !== '00:00') return '24:00'

  return end
}

function statusOf(value) {
  const name = String(value || '').toLowerCase()

  if (name === 'validando') {
    return { label: 'En validación', note: 'El encargado está revisando tu Yape.', chip: styles.chipWait, wait: true }
  }

  if (name === 'pendiente') {
    return { label: 'Pago pendiente', note: 'Falta completar el pago.', chip: styles.chipWait, wait: true }
  }

  if (name === 'confirmada') {
    return { label: 'Confirmada', note: 'Tu horario ya está reservado.', chip: styles.chipOk, wait: false }
  }

  if (name === 'cancelada') {
    return { label: 'No se confirmó', note: 'Esa hora quedó libre.', chip: styles.chipOff, wait: false }
  }

  return { label: value || 'Sin estado', note: '', chip: styles.chipOff, wait: false }
}

function courtInfoHref(row, lang) {
  const court = row.cancha

  if (!court?.id) return ''

  const params = new URLSearchParams()

  if (row.fecha) params.set('fecha', String(row.fecha).slice(0, 10))

  const query = params.toString()

  return `/${lang || 'es'}/explorar/cancha/${court.id}${query ? `?${query}` : ''}`
}

function ReservationCard({ row, lang }) {
  const court = row.cancha
  const href = courtInfoHref(row, lang)
  const sede = court?.sede?.name || court?.sede?.company_name || ''
  const status = statusOf(row.estado_reserva)

  return (
    <article className={status.wait ? `${styles.card} ${styles.cardWait}` : styles.card}>
      <div className={styles.photo}>
        {court?.imagen ? (
          <OptimizedS3Image src={court.imagen} alt={court.nombre || 'Cancha'} fill className='object-cover' sizes='148px' />
        ) : (
          <span className={styles.photoFallback} aria-hidden='true'>
            <i className='ri-basketball-line' />
          </span>
        )}
      </div>
      <div>
        <h2 className={styles.court}>{court?.nombre || 'Cancha'}</h2>
        {sede ? <p className={styles.lead}>{sede}</p> : null}
        <p className={styles.when}>
          {reservationDay(row.fecha)} · {row.hora_inicio}–{endLabel(row.hora_inicio, row.hora_fin)}
        </p>
        <div className={styles.meta}>
          <span className={status.chip}>{status.label}</span>
          <span className={styles.amount}>S/ {Number(row.total || 0).toFixed(2)}</span>
        </div>
        {status.note ? <p className={styles.note}>{status.note}</p> : null}
      </div>
      <div className={styles.side}>
        {href ? (
          <Link className={styles.link} href={href}>
            Ver cancha
          </Link>
        ) : null}
      </div>
    </article>
  )
}

const MisReservasIndex = () => {
  const { lang } = useParams()
  const locale = lang || 'es'
  const user = useSelector(state => state.loginReducer.user)
  const [tab, setTab] = useState('pendiente_pago')
  const [data, setData] = useState({ pendiente_pago: [], proximas: [], historial: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setData(await getMyReservationsSummary())
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudieron cargar tus reservas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)

      return
    }

    load()
  }, [load, user?.id])

  const rows = data[tab] || []
  const current = TABS.find(item => item.key === tab) || TABS[0]

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Mis reservas</h1>
        <p className={styles.lead}>
          {user?.id
            ? 'Mira si el encargado ya confirmó tu Yape, tus próximos partidos y lo que ya pasó.'
            : 'Entra para ver tus reservas.'}
        </p>
      </header>

      {user?.id ? (
        <div className={styles.tabs} role='tablist' aria-label='Tus reservas'>
          {TABS.map(item => {
            const count = (data[item.key] || []).length
            const on = tab === item.key

            return (
              <button
                key={item.key}
                type='button'
                role='tab'
                aria-selected={on}
                className={on ? styles.tabOn : styles.tab}
                onClick={() => setTab(item.key)}
              >
                <span className={on ? styles.countOn : styles.count}>{count}</span>
                {item.label}
              </button>
            )
          })}
        </div>
      ) : null}

      {user?.id && loading ? <p className={styles.lead}>Cargando tus reservas…</p> : null}
      {user?.id && !loading && error ? <p className={styles.error}>{error}</p> : null}

      {user?.id && !loading && !error && rows.length === 0 ? (
        <div className={styles.emptyBox}>
          <i className='ri-calendar-check-line' />
          <p className={styles.empty}>{current.empty}</p>
          {tab !== 'historial' ? (
            <Link className={styles.link} href={`/${locale}/explorar`}>
              Reservar una cancha
            </Link>
          ) : null}
        </div>
      ) : null}

      {user?.id && !loading && !error && rows.length > 0 ? (
        <div className={styles.list} role='tabpanel'>
          {rows.map(row => (
            <ReservationCard key={row.id} row={row} lang={locale} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default MisReservasIndex
