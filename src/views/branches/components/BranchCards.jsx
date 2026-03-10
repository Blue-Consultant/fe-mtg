'use client'

import { Button, Chip, Pagination, Typography, Skeleton } from '@mui/material'
import OptimizedS3Image from '@/components/OptimizedS3Image'
import { usePermissions } from '@/contexts/permissionsContext'
import EmptyState from '@/components/EmptyState'
import styles from '../branches.module.css'

const BranchCards = ({ controller, companiesReducer }) => {
  const {
    loading,
    pagination,
    setShowform,
    setOpenConfirmDialog,
    setDataProp,
    handlePageChange,
    memoizedDictionary,
  } = controller
  const { rows = [], currentPage = 1, totalRows = 0, totalPages = 0 } = companiesReducer?.companiesPagination || {}
  const { hasPermission } = usePermissions()

  const editBranch = data => {
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
        {memoizedDictionary?.common?.add ?? 'Agregar'}
      </Button>
    ) : null
    return (
      <EmptyState
        title={memoizedDictionary?.modules?.companies?.emptyTitle ?? 'No hay sucursales'}
        description={memoizedDictionary?.modules?.companies?.emptyDescription ?? 'Aún no has registrado sucursales. Agrega tu primera sucursal para empezar.'}
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
                src={item.logoPreview || item.logo}
                alt={item.name || item.company_name || 'Sucursal'}
                fill
                className="object-cover"
                quality={85}
                priority={index < 4}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px"
              />
              <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
                <Chip
                  label={item.headquarters ? 'Principal' : 'Sucursal'}
                  size="small"
                  color="primary"
                  variant={item.headquarters ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 600, backgroundColor: 'rgba(255,255,255,0.95)' }}
                />
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <Typography variant="body2" color="text.secondary" className={styles.cardVenue}>
                {item.company_name || '—'}
              </Typography>
              {item.address && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {item.address}
                </Typography>
              )}
              <div className={styles.cardActions}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<i className="ri-edit-line" />}
                  onClick={() => editBranch(item)}
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

export default BranchCards
