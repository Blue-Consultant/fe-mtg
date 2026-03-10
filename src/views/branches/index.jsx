'use client'

// React Imports
import React from 'react'

// MUI Imports
import {
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material'

// Component Imports
import BranchesCards from './components/BranchCards'
import BranchForm from './components/BranchForm'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'

// Custom Hook
import { useBranchesClient } from './hooks/useBranchesClient'

// Third-party Imports
import { AnimatePresence, motion } from 'framer-motion'
import CanAccess from '@/components/permissions/CanAccess'
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
    deactivateBranches,
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
    addOrUpdateBranch,
  }

  return (
    <div className={styles.pageWrap}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showform ? 'branch-form' : 'branch-list'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <header className={styles.header}>
            {showform ? (
              <>
                <div className={styles.backRow}>
                  <IconButton
                    onClick={handleSetDefautProps}
                    color="primary"
                    size="medium"
                    aria-label="Volver a la lista"
                  >
                    <i className="ri-arrow-left-line" style={{ fontSize: '1.5rem' }} />
                  </IconButton>
                  <div>
                    <Typography variant="h5" className={styles.headerTitle}>
                      {dataProp.action === 'edit'
                        ? (memoizedDictionary?.modules?.companies?.components?.text?.edit_company ?? 'Editar sucursal')
                        : (memoizedDictionary?.modules?.companies?.components?.text?.create_company ?? 'Nueva sucursal')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" className={styles.headerSubtitle}>
                      {dataProp.action === 'edit' ? 'Modifica los datos de la sucursal' : 'Registra una nueva sucursal'}
                    </Typography>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Typography variant="h5" className={styles.headerTitle}>
                    {memoizedDictionary?.modules?.companies?.title ?? 'Sucursales'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className={styles.headerSubtitle}>
                    Gestiona las sucursales del programa
                  </Typography>
                </div>
                <div className={styles.headerActions}>
                  <CanAccess permission="crear">
                    <Button
                      startIcon={<i className="ri-add-line" />}
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setDataProp({ action: 'add', data: null })
                        setShowform(true)
                      }}
                    >
                      {memoizedDictionary?.common?.add ?? 'Agregar'}
                    </Button>
                  </CanAccess>
                  <TextField
                    placeholder={memoizedDictionary?.modules?.companies?.components?.text?.text_find_company ?? 'Buscar por nombre...'}
                    size="small"
                    onChange={e => handleSearchChange(e.target.value)}
                    className={styles.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="ri-search-line" style={{ color: 'var(--mui-palette-text-secondary)' }} />
                        </InputAdornment>
                      ),
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
        type="delete"
        onConfirmation={deactivateBranches}
        moduleName="Sucursal"
      />
    </div>
  )
}

export default BranchesIndex
