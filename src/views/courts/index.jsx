'use client'

import React from 'react'

import { TextField, InputAdornment } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'

import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import CanAccess from '@/components/permissions/CanAccess'

import CourtCards from './components/CourtCards'
import CourtForm from './components/CourtForm'
import { useCourtsClient } from './hooks/useCourtsClient'
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
    ownerEmployees,
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
    ownerEmployees,
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
          <header className={styles.header}>
            {showform ? (
              <div className={styles.backRow}>
                <button type='button' className={styles.backBtn} onClick={handleSetDefautProps} aria-label='Volver'>
                  <i className='ri-arrow-left-line' aria-hidden />
                </button>
                <div>
                  <h1 className={styles.headerTitle}>
                    {dataProp.action === 'edit' ? 'Editar cancha' : 'Nueva cancha'}
                  </h1>
                  <p className={styles.headerSubtitle}>
                    {dataProp.action === 'edit'
                      ? 'Modifica los datos de la cancha.'
                      : 'Registra una nueva cancha deportiva.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className={styles.headerTitle}>Mis canchas</h1>
                  <p className={styles.headerSubtitle}>Gestiona las canchas de tus sucursales.</p>
                </div>
                <div className={styles.headerActions}>
                  <CanAccess permission='crear'>
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
                  </CanAccess>
                  <TextField
                    placeholder='Buscar por nombre…'
                    size='small'
                    onChange={e => handleSearchChange(e.target.value)}
                    className={styles.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line' style={{ color: '#5c6560' }} />
                        </InputAdornment>
                      )
                    }}
                  />
                </div>
              </>
            )}
          </header>

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
