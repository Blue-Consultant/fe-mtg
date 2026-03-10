'use client'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import { AnimatePresence, motion } from 'framer-motion'

import RolesTable from './components/RolesTable'
import RoleCards from './components/RoleCards'
import { useRoles } from './hooks/useRoles'
import AddRolesDrawer from './components/AddRolesDrawer'

const RolesIndex = ({ dictionary = {} }) => {
  const {
    dataProp,
    showform,
    setShowform,
    setDataProp,
    isLoading,
    rolesReducer,
    addRoles,
    updateRoles,
    deleteRoles,
    viewModeToggle,
    changerViewer,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange
  } = useRoles()

  const controller = {
    loading: isLoading,
    showform,
    dataProp,
    updateRoles,
    addRoles,
    deleteRoles,
    setShowform,
    setDataProp,
    viewModeToggle,
    changerViewer,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange
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
              <RoleCards controller={controller} rolesReducer={rolesReducer} dictionary={dictionary} />
            </motion.div>
          ) : (
            <motion.div
              key='table'
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.2 }}
            >
              <RolesTable controller={controller} rolesReducer={rolesReducer} dictionary={dictionary} />
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>

      <AddRolesDrawer
        open={showform}
        customerUserData={dataProp?.data}
        handleClose={() => setShowform(false)}
        rolesReducer={rolesReducer}
        controller={controller}
        dictionary={dictionary}
      />
    </Grid>
  )
}

export default RolesIndex
