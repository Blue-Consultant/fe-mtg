'use client'

import { Pagination, Skeleton } from '@mui/material'

import OptimizedS3Image from '@/components/OptimizedS3Image'
import EmptyState from '@/components/EmptyState'
import { usePermissions } from '@/contexts/permissionsContext'

import styles from '../branches.module.css'

const BranchCards = ({ controller, companiesReducer }) => {
  const { loading, pagination, setShowform, setOpenConfirmDialog, setDataProp, handlePageChange, memoizedDictionary } =
    controller

  const { rows = [], currentPage = 1, totalPages = 0 } = companiesReducer?.companiesPagination || {}
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
        {memoizedDictionary?.common?.add ?? 'Agregar sede'}
      </button>
    ) : null

    return (
      <EmptyState
        title={memoizedDictionary?.modules?.companies?.emptyTitle ?? 'No hay sucursales'}
        description={
          memoizedDictionary?.modules?.companies?.emptyDescription ??
          'Aún no has registrado sedes. Agrega tu primera para empezar a publicar canchas.'
        }
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
                className='object-cover'
                quality={85}
                priority={index < 4}
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px'
              />
              <span className={styles.badge}>{item.headquarters || item.is_headquarters ? 'Principal' : 'Sede'}</span>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <p className={styles.cardVenue}>{item.company_name || '—'}</p>
              {item.address ? <p className={styles.cardMeta}>{item.address}</p> : null}
              <div className={styles.cardActions}>
                <button
                  type='button'
                  className={`${styles.btnPrimary} ${styles.btnSm}`}
                  onClick={() => editBranch(item)}
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
        ))}
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

export default BranchCards
