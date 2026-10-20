'use client'

import { Pagination, Rating, Skeleton } from '@mui/material'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import EmptyState from '@/components/EmptyState'
import { usePermissions } from '@/contexts/permissionsContext'

import styles from '../courts.module.css'

const CourtCards = ({ controller, courtsReducer }) => {
  const { loading, pagination, setShowform, setOpenConfirmDialog, setDataProp, handlePageChange } = controller

  const { rows = [], currentPage = 1, totalPages = 0 } = courtsReducer?.courtsPagination || {}
  const { hasPermission } = usePermissions()

  const editCourt = data => {
    setDataProp({ action: 'edit', data })
    setShowform(true)
  }

  if (loading) {
    return (
      <div className={styles.cardsGrid}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className={styles.card}>
            <Skeleton variant='rectangular' height={168} animation='wave' />
            <div className={styles.cardBody}>
              <Skeleton variant='text' width='80%' height={28} />
              <Skeleton variant='text' width='60%' height={20} />
              <Skeleton variant='text' width='90%' height={20} />
              <div className={styles.cardActions}>
                <Skeleton variant='rounded' width='100%' height={36} />
                <Skeleton variant='rounded' width='100%' height={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    const addButton = hasPermission('crear') ? (
      <button
        type='button'
        className={styles.btnPrimary}
        onClick={() => {
          setDataProp({ action: 'add', data: null })
          setShowform(true)
        }}
      >
        <i className='ri-add-line' aria-hidden />
        Agregar cancha
      </button>
    ) : null

    return (
      <EmptyState
        title='No hay canchas'
        description='Aún no has registrado canchas. Agrega tu primera cancha para empezar a gestionar reservas.'
        action={addButton}
      />
    )
  }

  return (
    <>
      <div className={styles.cardsGrid}>
        {rows.map((item, index) => {
          const typeName = item.court_types?.nombre || item.CourtType?.nombre || item.courtType?.nombre
          const isActive = Boolean(item.estado)

          return (
            <article key={item.id || index} className={styles.card}>
              <div className={styles.cardImageWrap}>
                <OptimizedS3Image
                  src={item.imagen || item.SportsVenue?.logo}
                  alt={item.nombre || 'Cancha'}
                  fill
                  className='object-cover'
                  quality={85}
                  priority={index < 4}
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px'
                />
                <div className={styles.chipRow}>
                  <span className={`${styles.chip} ${isActive ? styles.chipOk : styles.chipOff}`}>
                    {isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  {typeName ? <span className={`${styles.chip} ${styles.chipType}`}>{typeName}</span> : null}
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{item.nombre}</h3>
                {item.rating_avg != null && item.rating_count > 0 ? (
                  <div className={styles.cardMeta}>
                    <Rating
                      value={Number(item.rating_avg)}
                      precision={0.1}
                      size='small'
                      readOnly
                      sx={{
                        '& .MuiRating-iconFilled': { color: '#13b236' }
                      }}
                    />
                    <span className={styles.cardInfo}>({item.rating_count})</span>
                  </div>
                ) : null}
                <p className={styles.cardVenue}>{item.SportsVenue?.name || 'Sin sucursal'}</p>
                {item.capacidad != null && item.capacidad > 0 ? (
                  <p className={styles.cardInfo}>Capacidad: {item.capacidad} personas</p>
                ) : null}
                <div className={styles.cardActions}>
                  <button
                    type='button'
                    className={`${styles.btnPrimary} ${styles.btnSm}`}
                    onClick={() => editCourt(item)}
                    disabled={!hasPermission('editar')}
                  >
                    <i className='ri-edit-line' aria-hidden />
                    Editar
                  </button>
                  <button
                    type='button'
                    className={`${styles.btnDanger} ${styles.btnSm}`}
                    onClick={() => {
                      setDataProp({ action: 'deactivate', data: item.id })
                      setOpenConfirmDialog(true)
                    }}
                    disabled={!hasPermission('eliminar')}
                  >
                    <i className='ri-delete-bin-line' aria-hidden />
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {totalPages > 1 ? (
        <div className={styles.paginationWrap}>
          <Pagination
            count={Math.ceil(totalPages)}
            page={pagination?.currentPage ?? currentPage}
            showFirstButton
            showLastButton
            onChange={(_, newPage) => handlePageChange(newPage)}
            sx={{
              '& .MuiPaginationItem-root.Mui-selected': {
                backgroundColor: '#13b236',
                color: '#fff'
              }
            }}
          />
        </div>
      ) : null}
    </>
  )
}

export default CourtCards
