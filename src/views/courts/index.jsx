'use client'

import React from 'react'

import { Typography, Button, IconButton, TextField, InputAdornment, Box } from '@mui/material'

import { AnimatePresence, motion } from 'framer-motion'

import CourtCards from './components/CourtCards'
import CourtForm from './components/CourtForm'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useCourtsClient } from './hooks/useCourtsClient'
import CanAccess from '@/components/permissions/CanAccess'
import styles from './courts.module.css'

const CourtsIndex = ({ dictionary }) => {
  const {
    memoizedDictionary,
    courtsReducer,
    usuario,
    loading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    branchesList,
    courtTypesList,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSetDefautProps,
    addOrUpdateCourt,
    deactivateCourts
  } = useCourtsClient(dictionary)

  const controller = {
    loading,
    showform,
    dataProp,
    pagination,
    memoizedDictionary,
    branchesList,
    courtTypesList,
    usuario,
    setShowform,
    setDataProp,
    setOpenConfirmDialog,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSetDefautProps,
    addOrUpdateCourt
  }

  return (
    <div className={styles.pageWrap}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={showform ? 'court-form' : 'court-list'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <header className={styles.header}>
            {showform ? (
              <>
                <div className={styles.backRow}>
                  <IconButton
                    onClick={handleSetDefautProps}
                    color='primary'
                    size='medium'
                    aria-label='Volver a la lista'
                  >
                    <i className='ri-arrow-left-line' style={{ fontSize: '1.5rem' }} />
                  </IconButton>
                  <div>
                    <Typography variant='h5' className={styles.headerTitle}>
                      {dataProp.action === 'edit' ? 'Editar cancha' : 'Nueva cancha'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' className={styles.headerSubtitle}>
                      {dataProp.action === 'edit'
                        ? 'Modifica los datos de la cancha'
                        : 'Registra una nueva cancha deportiva'}
                    </Typography>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Typography variant='h5' className={styles.headerTitle}>
                    Mis canchas
                  </Typography>
                  <Typography variant='body2' color='text.secondary' className={styles.headerSubtitle}>
                    Gestiona las canchas de tus sucursales
                  </Typography>
                </div>
                <div className={styles.headerActions}>
                  <CanAccess permission='crear'>
                    <Button
                      startIcon={<i className='ri-add-line' />}
                      variant='contained'
                      color='primary'
                      onClick={() => {
                        setDataProp({ action: 'add', data: null })
                        setShowform(true)
                      }}
                    >
                      Agregar cancha
                    </Button>
                  </CanAccess>
                  <TextField
                    placeholder='Buscar por nombre...'
                    size='small'
                    onChange={e => handleSearchChange(e.target.value)}
                    className={styles.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line' style={{ color: 'var(--mui-palette-text-secondary)' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </div>
              </>
            )}
          </header>

          {/* Contenido: formulario o lista */}
          {showform ? (
            <CourtForm controller={controller} />
          ) : (
            <CourtCards controller={controller} courtsReducer={courtsReducer} />
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={deactivateCourts}
        moduleName='Cancha'
      />
    </div>
  )
}

export default CourtsIndex
