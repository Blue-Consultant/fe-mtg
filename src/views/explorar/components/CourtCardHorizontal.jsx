'use client'

import Link from 'next/link'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import { courtDetailSlug } from '@/utils/slugify'
import styles from '../explorar-detail.module.css'

const DEFAULT_COURT_IMAGE = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=300&fit=crop'

export default function CourtCardHorizontal({ court, lang }) {
  const name = court.nombre || court.name
  const img = court.imagen || court.SportsVenue?.logo || court.image || DEFAULT_COURT_IMAGE
  const location = court.SportsVenue?.name || court.location || '—'
  const schedules = court.PriceSchedules || []

  const pricePerHour =
    schedules.length > 0 && schedules[0].precio != null ? `S/ ${Number(schedules[0].precio).toFixed(0)}/h` : null

  const href = `/${lang}/explorar/${court.id}/${courtDetailSlug(court)}`

  return (
    <Link href={href} className={styles.cardHorizontal}>
      <div className={styles.cardHorizontalImage}>
        <OptimizedS3Image src={img} alt={name} fill className='object-cover' sizes='280px' />
      </div>
      <div className={styles.cardHorizontalBody}>
        <span className={styles.cardHorizontalTitle}>{name}</span>
        {pricePerHour != null && <span className={styles.cardHorizontalPrice}>{pricePerHour}</span>}
        <span className={styles.cardHorizontalLocation}>
          <i className='ri-map-pin-line' style={{ fontSize: '0.875rem' }} />
          {location}
        </span>
      </div>
    </Link>
  )
}
