'use client'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { AnimatePresence, motion } from 'framer-motion'
import { useRelationHome } from './hooks/useRelationHome'
import RelationCards from './components/RelationCards'
import RelationTable from './components/RelationTable'


const RolesModulesSubmodules = ({ dictionary, lang }) => {
  const {
    memoizedDictionary,
    userDataReducer,
    branchList,
    rolesList,
    modulesList,
    debouncedSearch,
    customerUserOpen,
    customerUserData,
    openConfirmDialog,
    viewModeToggle,
    loading,
    selectedBranch,
    selectedRole,
    changerViewer,
    setSelectedBranch,
    setSelectedRole,
    setCustomerUserOpen,
    setCustomerUserData,
    handleDelete,
    openDeleteDialog,
    setOpenConfirmDialog,
    fetchRolesList,
  } = useRelationHome(dictionary)

  const permissionsController = {
    userDataReducer,
    branchList,
    rolesList,
    modulesList,
    customerUserOpen,
    customerUserData,
    dictionary: memoizedDictionary,
    openConfirmDialog,
    selectedBranch,
    selectedRole,
    debouncedSearch,
    viewModeToggle,
    loading,
    setCustomerUserOpen,
    handleDelete,
    openDeleteDialog,
    setOpenConfirmDialog,
    setSelectedBranch,
    setSelectedRole,
    setCustomerUserData,
    changerViewer,
    fetchRolesList,
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
              <RelationCards
                {...permissionsController}
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
              <RelationTable
                {...permissionsController}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>
    </Grid>
  )
}

export default RolesModulesSubmodules
