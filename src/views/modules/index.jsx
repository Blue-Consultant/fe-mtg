'use client'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { AnimatePresence, motion } from 'framer-motion'
import ModulesCards from './components/ModulesCards'
import ModulesListTable from './components/ModulesListTable'
import { useModules } from './hooks/useModules'

const Module = ({ dictionary, lang }) => {
  const {
    memoizedDictionary, userDataReducer,
    valuesPagination,
    setValuesPagination, modulesPagination,
    viewModeToggle, changerViewer,
    loading, setShowform,
    setOpenConfirmDialog, setDataProp,
    debouncedSearch,
    customerUserOpen, setCustomerUserOpen,
    customerUserData, setCustomerUserData,
    handleDelete, openDeleteDialog,
    openConfirmDialog, fetchModulesData
  } = useModules(dictionary)

  const modulesController = {
    userDataReducer,
    // branchList,
    searchedUserList: [],
    setSearchedUserList: () => {},
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
    fetchModulesData,
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
              <ModulesCards
                {...modulesController}
                loading={loading}
                setShowform={setShowform}
                setDataProp={setDataProp}
                modulesReducer={{ modulesPagination }}
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
              <ModulesListTable
                {...modulesController}
                modulesPagination={modulesPagination}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>
    </Grid>
  )
}

export default Module
