'use client'

import Typography from '@mui/material/Typography'

import CourtCard from './CourtCard'
import EmptyState from '@/components/EmptyState'
import styles from '../explorar.module.css'

const DEFAULT_EMPTY_TITLE = 'Sin resultados'

const DEFAULT_EMPTY_DESCRIPTION =
  'No hay canchas para mostrar con los filtros seleccionados. Prueba cambiando la fecha, horario o tipo de cancha.'

export default function CourtCardsGrid({
  courts,
  lang,
  title,
  emptyTitle = DEFAULT_EMPTY_TITLE,
  emptyDescription = DEFAULT_EMPTY_DESCRIPTION,
  onEmptyAction,
  emptyActionLabel,
  emptyAction
}) {
  if (!courts || courts.length === 0) {
    return (
      <>
        {title && (
          <Typography variant='subtitle1' color='text.secondary' className={styles.titleSection}>
            {title}
          </Typography>
        )}
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          actionLabel={emptyActionLabel}
          onActionClick={onEmptyAction}
        />
      </>
    )
  }

  return (
    <>
      {title && (
        <Typography variant='subtitle1' color='text.secondary' className={styles.titleSection}>
          {title}
        </Typography>
      )}
      <div className={styles.cardsGrid}>
        {courts.map(court => (
          <CourtCard key={court.id} court={court} lang={lang} />
        ))}
      </div>
    </>
  )
}
