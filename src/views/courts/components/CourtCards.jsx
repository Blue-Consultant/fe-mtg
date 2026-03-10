'use client'

import { Button, Chip, Pagination, Typography, Rating, Skeleton } from '@mui/material'
import OptimizedS3Image from '@/components/OptimizedS3Image'
import { usePermissions } from '@/contexts/permissionsContext'
import EmptyState from '@/components/EmptyState'
import styles from '../courts.module.css'

const CourtCards = ({ controller, courtsReducer }) => {
  const {
    loading,
    pagination,
    setShowform,
    setOpenConfirmDialog,
    setDataProp,
    handlePageChange,
  } = controller
  const { rows = [], currentPage = 1, totalRows = 0, totalPages = 0 } = courtsReducer?.courtsPagination || {}
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
            <Skeleton variant="rectangular" height={180} animation="wave" />
            <div className={styles.cardBody}>
              <Skeleton variant="text" width="80%" height={28} />
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="90%" height={20} />
              <div className={styles.cardActions}>
                <Skeleton variant="rounded" width={80} height={36} />
                <Skeleton variant="rounded" width={80} height={36} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!rows || rows.length === 0) {
    const addButton = hasPermission('crear') ? (
      <Button
        variant="contained"
        color="primary"
        startIcon={<i className="ri-add-line" />}
        onClick={() => {
          setDataProp({ action: 'add', data: null })
          setShowform(true)
        }}
      >
        Agregar cancha
      </Button>
    ) : null
    return (
      <EmptyState
        title="No hay canchas"
        description="Aún no has registrado canchas. Agrega tu primera cancha para empezar a gestionar reservas."
        action={addButton}
      />
    )
  }

  return (
    <>
      <div className={styles.cardsGrid}>
        {rows.map((item, index) => (
          <article key={item.id || index} className={styles.card}>
            <div className={styles.cardImageWrap}>
              <OptimizedS3Image
                src={item.imagen || item.SportsVenue?.logo}
                alt={item.nombre || 'Cancha'}
                fill
                className="object-cover"
                quality={85}
                priority={index < 4}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px"
              />
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                <Chip
                  label={item.estado ? 'Activa' : 'Inactiva'}
                  size="small"
                  color={item.estado ? 'success' : 'default'}
                  sx={{ fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.95)' }}
                />
                {(item.court_types?.nombre) && (
                  <Chip
                    label={item.court_types.nombre}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                  />
                )}
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{item.nombre}</h3>
              <div className={styles.cardMeta}>
                {item.rating_avg != null && item.rating_count > 0 && (
                  <>
                    <Rating value={Number(item.rating_avg)} precision={0.1} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      ({item.rating_count})
                    </Typography>
                  </>
                )}
              </div>
              <Typography variant="body2" color="text.secondary" className={styles.cardVenue}>
                {item.SportsVenue?.name || 'Sin sucursal'}
              </Typography>
              {item.capacidad != null && item.capacidad > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Capacidad: {item.capacidad} personas
                </Typography>
              )}
              <div className={styles.cardActions}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<i className="ri-edit-line" />}
                  onClick={() => editCourt(item)}
                  disabled={!hasPermission('editar')}
                >
                  Editar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<i className="ri-delete-bin-line" />}
                  onClick={() => {
                    setDataProp({ action: 'deactivate', data: item.id })
                    setOpenConfirmDialog(true)
                  }}
                  disabled={!hasPermission('eliminar')}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.paginationWrap}>
          <Pagination
            count={Math.ceil(totalPages)}
            page={pagination?.currentPage ?? currentPage}
            showFirstButton
            showLastButton
            color="primary"
            onChange={(_, newPage) => handlePageChange(newPage)}
          />
        </div>
      )}
    </>
  )
}

export default CourtCards
