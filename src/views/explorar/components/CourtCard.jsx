'use client'

import Link from 'next/link'
import OptimizedS3Image from '@/components/OptimizedS3Image'
import { courtDetailSlug } from '@/utils/slugify'
import styles from '../explorar.module.css'

const DEFAULT_COURT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop'
const DAYS_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá']

export default function CourtCard({ court, lang }) {
  const name = court.nombre || court.name
  const img = court.imagen || court.SportsVenue?.logo || court.image || DEFAULT_COURT_IMAGE
  const location = court.SportsVenue?.name || court.location || '—'
  const description = court.descripcion || 'Cancha deportiva disponible para reserva.'
  const schedules = court.PriceSchedules || []
  const pricePerHour =
    schedules.length > 0 && schedules[0].precio != null
      ? `S/ ${Number(schedules[0].precio).toFixed(0)}/h`
      : null

  const href = `/${lang}/explorar/${court.id}/${courtDetailSlug(court)}`

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.cardImageWrap}>
        <OptimizedS3Image
          src={img}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 600px) 100vw, 320px"
        />
        {pricePerHour != null && <span className={styles.cardPrice}>{pricePerHour}</span>}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{name}</h3>
        <p className={styles.cardDescription}>{description}</p>
        <div className={styles.cardMeta}>
          <i className="ri-map-pin-line" style={{ fontSize: '1rem', flexShrink: 0 }} />
          {location}
        </div>
        {schedules.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {schedules.slice(0, 3).map((s, idx) => (
              <span
                key={idx}
                className="text-xs text-gray-500 border border-gray-200 rounded px-1.5 py-0.5"
              >
                {DAYS_LABELS[s.dia_semana] ?? s.dia_semana} {s.hora_inicio}-{s.hora_fin}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
