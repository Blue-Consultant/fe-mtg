'use client'

import Link from 'next/link'

import Skeleton from '@mui/material/Skeleton'

import OptimizedS3Image from '@/components/OptimizedS3Image'

import { useVenueCatalog } from './hooks/useVenueCatalog'
import styles from './player-board.module.css'

function VenueCard({ lang, venue }) {
  const href = `/${lang}/explorar/reservar?sede=${venue.id}`

  return (
    <article className={styles.homeCard}>
      <Link href={href} className={styles.homeImage}>
        <OptimizedS3Image
          src={venue.image}
          alt=''
          fill
          className='object-cover'
          sizes='(max-width: 640px) 100vw, 33vw'
        />
      </Link>
      <div className={styles.homeBody}>
        <h2 className={styles.homeTitle}>
          <Link href={href} className={styles.venueNameLink}>
            {venue.name}
          </Link>
        </h2>
        {venue.company ? <p className={styles.homeCompany}>{venue.company}</p> : null}
        {venue.address ? (
          <p className={styles.homeAddress}>
            <i className='ri-map-pin-2-line' aria-hidden />
            {venue.address}
          </p>
        ) : null}
        {venue.sports.length > 0 ? (
          <ul className={styles.sportList}>
            {venue.sports.map(sport => (
              <li key={sport}>{sport}</li>
            ))}
          </ul>
        ) : null}
        <p className={styles.homeCount}>{venue.courts === 1 ? '1 cancha' : `${venue.courts} canchas`}</p>
        <div className={styles.homeContacts}>
          {venue.phone ? (
            <a className={styles.contactLink} href={`tel:${venue.phone}`}>
              <i className='ri-phone-line' aria-hidden />
              {venue.phone}
            </a>
          ) : null}
          {venue.email ? (
            <a className={styles.contactLink} href={`mailto:${venue.email}`}>
              <i className='ri-mail-line' aria-hidden />
              {venue.email}
            </a>
          ) : null}
        </div>
        <Link href={href} className={styles.homeCta}>
          Ver canchas
        </Link>
      </div>
    </article>
  )
}

export default function PlayerVenuesHome({ lang = 'es' }) {
  const { venues, loading, loadError } = useVenueCatalog()

  if (loading) {
    return (
      <>
        <Skeleton variant='rounded' height={156} />
        <div className={styles.homeGrid}>
          {[1, 2, 3, 4].map(item => (
            <Skeleton key={item} variant='rounded' height={210} />
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <h1>Canchas que confían en nosotros</h1>
          <p className={styles.heroLead}>Elige una sede y reserva su cancha.</p>
        </div>
        <aside className={styles.offer}>
          <p className={styles.offerKicker}>¿Tienes una sede?</p>
          <p className={styles.offerTitle}>Únete a MTG</p>
          <p className={styles.offerText}>Publica tus canchas y recibe reservas aquí.</p>
        </aside>
      </header>

      {loadError ? <p className={styles.empty}>{loadError}</p> : null}
      {!loadError && venues.length === 0 ? <p className={styles.empty}>Todavía no hay sedes publicadas.</p> : null}
      {!loadError && venues.length > 0 ? (
        <p className={styles.courtPrompt}>
          Sedes
          <span>Dirección, deportes y contacto de cada lugar.</span>
        </p>
      ) : null}

      <div className={styles.homeGrid}>
        {venues.map(venue => (
          <VenueCard key={venue.id} lang={lang} venue={venue} />
        ))}
      </div>
    </>
  )
}
