'use client'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { AnimatePresence, motion } from 'framer-motion'

import { usePermissions } from './hooks/usePermissions'
import PermissionsListTable from './components/PermissionsListTable'
import PermissionsCards from './components/PermissionsCards'

const PermissionsIndex = ({ dictionary }) => {
  const {
    memoizedDictionary,
    userDataReducer,
    valuesPagination,
    setValuesPagination,
    permissionsPagination,
    viewModeToggle,
    changerViewer,
    loading,
    debouncedSearch,
    customerUserOpen,
    setCustomerUserOpen,
    customerUserData,
    setCustomerUserData,
    handleDelete,
    openDeleteDialog,
    openConfirmDialog,
    setOpenConfirmDialog,
    fetchPermissionsData
  } = usePermissions(dictionary)

  const permissionsController = {
    userDataReducer,
    customerUserOpen,
    setCustomerUserOpen,
    customerUserData,
    setCustomerUserData,
    dictionary: memoizedDictionary,
    valuesPagination,
    setValuesPagination,
    handleDelete,
    openDeleteDialog,
    openConfirmDialog,
    setOpenConfirmDialog,
    fetchPermissionsData,
    debouncedSearch,
    changerViewer,
    viewModeToggle
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AnimatePresence mode='wait'>
          {viewModeToggle ? (
            <motion.div
              key='cards'
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.2 }}
            >
              <PermissionsCards
                {...permissionsController}
                loading={loading}
                permissionsPagination={permissionsPagination}
              />
            </motion.div>
          ) : (
            <motion.div
              key='table'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
            >
              <PermissionsListTable {...permissionsController} permissionsPagination={permissionsPagination} />
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>
    </Grid>
  )
}

export default PermissionsIndex
