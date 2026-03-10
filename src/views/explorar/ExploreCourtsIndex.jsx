'use client'

import { useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import Pagination from '@mui/material/Pagination'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

import { useExploreCourts } from './hooks/useExploreCourts'
import ExploreFiltersDrawer from './components/ExploreFiltersDrawer'
import CourtCardsGrid from './components/CourtCardsGrid'
import styles from './explorar.module.css'

export default function ExploreCourtsIndex({
  lang,
  fecha: pathFecha,
  hora_inicio: pathHoraInicio,
  hora_fin: pathHoraFin,
  court_type_id: pathCourtTypeId
}) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const router = useRouter()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { courts, courtTypes, loading, title, filters, loadCourts, venuesFromCourts, pagination } = useExploreCourts({
    lang,
    initialFecha: pathFecha,
    initialHoraInicio: pathHoraInicio,
    initialHoraFin: pathHoraFin,
    initialCourtTypeId: pathCourtTypeId
  })

  const handleSearch = useCallback(() => {
    loadCourts()
    setMobileFiltersOpen(false)
  }, [loadCourts])

  const filtersContent = (
    <ExploreFiltersDrawer
      filters={filters}
      courtTypes={courtTypes}
      venues={venuesFromCourts}
      onSearch={handleSearch}
      lang={lang}
      router={router}
    />
  )

  if (loading) {
    return (
      <Box className={styles.root}>
        {isDesktop && (
          <aside className={`${styles.filtersPanel} ${styles.hideScrollbar}`}>
            <div className={styles.filtersPanelHeader}>
              <Skeleton variant='text' width='60%' height={28} />
              <Skeleton variant='text' width='80%' height={20} />
            </div>
            <div className={styles.filtersPanelBody}>
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} variant='rounded' height={40} />
              ))}
            </div>
          </aside>
        )}
        <div className={`${isDesktop ? styles.cardsArea : styles.cardsAreaFullWidth} ${styles.hideScrollbar}`}>
          <Skeleton variant='text' width={280} height={32} className={styles.titleSection} />
          <div className={styles.cardsGrid}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <Skeleton variant='rectangular' className={styles.skeletonImage} />
                <div className={styles.skeletonBody}>
                  <Skeleton variant='text' width='90%' height={24} />
                  <Skeleton variant='text' width='70%' height={20} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Box>
    )
  }

  return (
    <Box className={styles.root}>
      {/* Desktop: panel de filtros fijo a la izquierda */}
      {isDesktop && <aside className={`${styles.filtersPanel} ${styles.hideScrollbar}`}>{filtersContent}</aside>}

      {/* Mobile: botón para abrir drawer de filtros */}
      {!isDesktop && (
        <Drawer
          anchor='left'
          open={mobileFiltersOpen}
          onClose={() => setMobileFiltersOpen(false)}
          PaperProps={{
            className: styles.filtersDrawerWrap,
            sx: { width: 320, maxWidth: '85vw' }
          }}
        >
          <Box className={styles.filtersDrawerWrap}>{filtersContent}</Box>
        </Drawer>
      )}
      {/* Área de cards: derecha en desktop; en mobile incluye el botón de filtros arriba */}
      <div className={`${isDesktop ? styles.cardsArea : styles.cardsAreaFullWidth} ${styles.hideScrollbar}`}>
        {!isDesktop && (
          <Box className={styles.filterTriggerBtn} sx={{ px: 0, pt: 0, pb: 1 }}>
            <IconButton
              onClick={() => setMobileFiltersOpen(true)}
              color='primary'
              aria-label='Abrir filtros'
              size='medium'
            >
              <i className='ri-filter-3-line' style={{ fontSize: '1.5rem' }} />
            </IconButton>
            <Typography component='span' variant='body2' color='text.secondary' sx={{ ml: 1 }}>
              Filtros
            </Typography>
          </Box>
        )}
        <CourtCardsGrid
          courts={courts}
          lang={lang}
          title={title}
          onEmptyAction={() => filters.clearFilters()}
          emptyActionLabel='Limpiar filtros'
        />
        {pagination && pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={pagination.onPageChange}
              color='primary'
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </div>
    </Box>
  )
}
