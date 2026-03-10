'use client'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { AnimatePresence, motion } from 'framer-motion'
import { useSubModules } from './hooks/useSubModules'
import SubModulesCards from './components/SubModulesCards'
import SubModulesListTable from './components/SubModulesListTable'

const SubModule = ({ dictionary, lang }) => {
  const {
    memoizedDictionary, userDataReducer,
    modulesList,
    valuesPagination,
    setValuesPagination, subModulesPagination,
    viewModeToggle, changerViewer,
    loading, setShowform,
    setOpenConfirmDialog, setDataProp,
    selectedBranch, setSelectedBranch,
    handleSelectFilterChange, debouncedSearch,
    customerUserOpen, setCustomerUserOpen,
    customerUserData, setCustomerUserData,
    handleDelete, openDeleteDialog,
    openConfirmDialog, fetchSubModulesData
  } = useSubModules(dictionary)

  const entitiesController = {
    userDataReducer,
    modulesList,
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
    fetchSubModulesData,
    selectedBranch,
    setSelectedBranch,
    handleSelectFilterChange,
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
              <SubModulesCards
                {...entitiesController}
                loading={loading}
                setShowform={setShowform}
                setDataProp={setDataProp}
                subModulesPagination={{ subModulesPagination }}
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
              <SubModulesListTable
                {...entitiesController}
                subModulesPagination={subModulesPagination}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Grid>
    </Grid>
  )
}

export default SubModule
