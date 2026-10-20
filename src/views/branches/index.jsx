'use client'

import React from 'react'

import { TextField, InputAdornment } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'

import CanAccess from '@/components/permissions/CanAccess'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'

import BranchesCards from './components/BranchCards'
import BranchForm from './components/BranchForm'
import { useBranchesClient } from './hooks/useBranchesClient'
import styles from './branches.module.css'

const BranchesIndex = ({ dictionary }) => {
  const {
    memoizedDictionary,
    companiesReducer,
    usuario,
    loading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    branchShortList,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSetDefautProps,
    addOrUpdateBranch,
    deactivateBranches
  } = useBranchesClient(dictionary)

  const controller = {
    loading,
    showform,
    dataProp,
    pagination,
    memoizedDictionary,
    branchShortList,
    usuario,
    setShowform,
    setDataProp,
    setOpenConfirmDialog,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleSetDefautProps,
    addOrUpdateBranch
  }

  return (
    <div className={styles.pageWrap}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={showform ? 'branch-form' : 'branch-list'}
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
                  <h1 className={styles.headerTitle}>{dataProp.action === 'edit' ? 'Editar sede' : 'Nueva sede'}</h1>
                  <p className={styles.headerSubtitle}>
                    {dataProp.action === 'edit'
                      ? 'Actualiza los datos de tu local.'
                      : 'Registra el local donde operan tus canchas.'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h1 className={styles.headerTitle}>
                    {memoizedDictionary?.modules?.companies?.title ?? 'Sucursales'}
                  </h1>
                  <p className={styles.headerSubtitle}>Administra las sedes de tu negocio.</p>
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
                      {memoizedDictionary?.common?.add ?? 'Agregar sede'}
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
            <BranchForm controller={controller} />
          ) : (
            <BranchesCards controller={controller} companiesReducer={companiesReducer} />
          )}
        </motion.div>
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={deactivateBranches}
        moduleName='Sucursal'
      />
    </div>
  )
}

export default BranchesIndex
