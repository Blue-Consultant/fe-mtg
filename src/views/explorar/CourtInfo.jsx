'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import { getCourtDetail } from '@/views/courts/api'

import styles from './court-info.module.css'

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function money(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function reservationDay(value) {
  const raw = String(value || '').slice(0, 10)
  const date = new Date(`${raw}T12:00:00`)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
}

function addressOf(venue) {
  return [venue?.address, venue?.city].filter(Boolean).join(', ')
}

function phoneHref(phone) {
  const digits = String(phone || '').replace(/\D/g, '')

  if (!digits) return ''
  if (digits.startsWith('51')) return `tel:+${digits}`

  return `tel:+51${digits}`
}

function prettyPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  const local = digits.startsWith('51') ? digits.slice(2) : digits

  if (local.length !== 9) return phone || ''

  return `+51 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
}

function scheduleDays(rows) {
  const grouped = new Map()

  ;(rows || []).forEach(row => {
    const day = Number(row.dia_semana)
    const list = grouped.get(day) || []

    list.push(row)
    grouped.set(day, list)
  })

  return [1, 2, 3, 4, 5, 6, 0]
    .filter(day => grouped.has(day))
    .map(day => ({ label: DAYS[day], rows: grouped.get(day) }))
}

export default function CourtInfo({ courtId, lang }) {
  const searchParams = useSearchParams()
  const [court, setCourt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const locale = lang || 'es'
  const fecha = String(searchParams.get('fecha') || '').slice(0, 10)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setMissing(false)

      try {
        const data = await getCourtDetail(courtId)

        if (cancelled) return
        if (!data) setMissing(true)
        setCourt(data)
      } catch {
        if (!cancelled) setMissing(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [courtId])

  if (loading) return <p className={styles.lead}>Cargando la cancha…</p>
  if (missing || !court) return <p className={styles.lead}>No encontramos esta cancha.</p>

  const venue = court.SportsVenue
  const address = addressOf(venue)
  const maps = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : ''
  const phone = phoneHref(venue?.phone_number)
  const days = scheduleDays(court.PriceSchedules)
  const bookedDay = reservationDay(fecha)

  return (
    <div className={styles.page}>
      <Link className={styles.back} href={`/${locale}/mis-reservas`}>
        Volver a mis reservas
      </Link>
      <article className={styles.hero}>
        <div className={styles.photo}>
          {court.imagen ? (
            <OptimizedS3Image src={court.imagen} alt={court.nombre || 'Cancha'} fill className='object-cover' sizes='860px' />
          ) : (
            <span className={styles.photoFallback} aria-hidden='true'>
              <i className='ri-basketball-line' />
            </span>
          )}
        </div>
        <div className={styles.intro}>
          <p className={styles.kicker}>{court.court_types?.nombre || 'Cancha'}</p>
          <h1>{court.nombre || 'Cancha'}</h1>
          <p className={styles.lead}>{venue?.name || venue?.company_name || 'Sede'}</p>
          {court.rating_count > 0 ? (
            <p className={styles.lead}>
              {Number(court.rating_avg).toFixed(1)} · {court.rating_count} {court.rating_count === 1 ? 'opinión' : 'opiniones'}
            </p>
          ) : null}
          <div className={styles.thanks}>
            <strong>Gracias por confiar en nosotros.</strong>
            <p>El deporte es salud. Que sea un buen partido, siempre jugando en paz.</p>
            {bookedDay ? <p>Tu reserva es el {bookedDay}.</p> : null}
          </div>
        </div>
      </article>

      <section className={styles.panel}>
        <h2>La sede</h2>
        <p className={styles.place}>{venue?.name || venue?.company_name || 'Sede'}</p>
        {address ? (
          <p className={styles.line}>
            <i className='ri-map-pin-line' />
            {address}
          </p>
        ) : (
          <p className={styles.lead}>Esta sede todavía no publicó su dirección.</p>
        )}
        <div className={styles.actions}>
          {maps ? (
            <a className={styles.link} href={maps} target='_blank' rel='noreferrer'>
              <i className='ri-map-pin-line' />
              Cómo llegar
            </a>
          ) : null}
          {phone ? (
            <a className={styles.link} href={phone}>
              <i className='ri-phone-line' />
              {prettyPhone(venue.phone_number)}
            </a>
          ) : null}
          {venue?.email ? (
            <a className={styles.link} href={`mailto:${venue.email}`}>
              <i className='ri-mail-line' />
              {venue.email}
            </a>
          ) : null}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Horario y precio</h2>
        {days.length === 0 ? <p className={styles.lead}>Esta cancha todavía no tiene horario publicado.</p> : null}
        <ul className={styles.hours}>
          {days.map(day => (
            <li key={day.label}>
              <strong>{day.label}</strong>
              <span>
                {day.rows.map(row => (
                  <em key={`${row.hora_inicio}-${row.hora_fin}-${row.precio}`}>
                    {row.hora_inicio}–{row.hora_fin} · {money(row.precio)}
                  </em>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
