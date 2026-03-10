'use client'

import {
  Grid,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Tabs,
  Tab,
  Box
} from '@mui/material'

import UserTable from './components/UserTable'
import Userform from './components/Userform'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import CanAccess from '@/components/permissions/CanAccess'

import { AnimatePresence, motion } from 'framer-motion'
import { useUsersClient } from './hooks/useUsersClient'

const Users = ({ dictionary }) => {
  const {
    memoizedDictionary,
    usersReducer,
    usuario,
    isLoading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    searchValue,
    setSearchValue,
    branchList,
    rolesData,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    getRolesByBranch,
    handleCreateStaffUser,
    handleDeleteUser,
    onDeleteAction,
    activeTab,
    setActiveTab,
    allUsersData
  } = useUsersClient(dictionary)

  const controller = {
    isLoading,
    showform,
    dataProp,
    pagination,
    memoizedDictionary,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    onDeleteAction,
    setShowform,
    setDataProp,
    activeTab,
  }

  return (
    <div>
      <AnimatePresence mode='wait'>
        {showform ? (
          <motion.div
            key='form'
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.1 }}
          >
            <Userform
              controller={controller}
              handleCreateStaffUser={handleCreateStaffUser}
              branchList={branchList}
              rolesData={rolesData}
              getRolesByBranch={getRolesByBranch}
            />
          </motion.div>
        ) : (
          <motion.div
            key='table'
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.1 }}
          >
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <Card>
                  <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
                    <div>
                      <Typography variant='h4' className='mbe-1'>
                        {memoizedDictionary.modules.users.title}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        Gestiona los usuarios del sistema
                      </Typography>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <CanAccess permission="crear">
                        <Button
                          startIcon={<i className='ri-add-line' />}
                          variant='contained'
                          onClick={() => {
                            setDataProp({ action: 'add', data: null })
                            setShowform(true)
                          }}
                          className={``}
                        >
                          {memoizedDictionary.common.add}
                        </Button>
                      </CanAccess>

                      <TextField
                        placeholder={memoizedDictionary.common.search}
                        size='small'
                        value={searchValue}
                        onChange={e => {
                          setSearchValue(e.target.value)
                          handleSearchChange(e.target.value)
                        }}
                        className={`sm:is-[350px] max-sm:flex-1 ${``}`}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <i className="ri-search-line text-textSecondary" />
                            </InputAdornment>
                          )
                        }}
                      />
                    </div>
                  </CardContent>

                  <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                    <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                      <Tab label="Usuarios con Sedes" />
                      <Tab label="Todos los Usuarios" />
                    </Tabs>
                  </Box>

                  <UserTable
                    controller={controller}
                    usersReducer={activeTab === 0 
                      ? usersReducer 
                      : { 
                          ...usersReducer, 
                          usersPagination: {
                            rows: (allUsersData.rows || []).map(user => {
                              // Formatear para que coincida con la estructura esperada por UserTable
                              const formattedUser = {
                                Users: {
                                  id: user.id,
                                  first_name: user.first_name || '',
                                  last_name: user.last_name || '',
                                  email: user.email || '',
                                  phone_number: user.phone_number || '',
                                  country: user.country || '',
                                  avatar: user.avatar || ''
                                },
                                Branches: user.SportsVenueUsers?.[0]?.SportsVenue || { id: null, name: 'N/A' },
                                Roles: user.UserRoles?.[0]?.Roles || { id: null, name: 'N/A' },
                                Status_conditions: { 
                                  name: user.hasVenues ? 'Con Sedes' : 'Sin Sedes', 
                                  id: user.hasVenues ? 1 : 0 
                                },
                                // Información adicional
                                hasVenues: user.hasVenues,
                                venuesCount: user.venuesCount || 0
                              }
                              return formattedUser
                            }),
                            totalRows: allUsersData.totalRows || 0,
                            totalPages: allUsersData.totalPages || 1,
                            currentPage: allUsersData.currentPage || 1
                          }
                        }
                    }
                  />
                </Card>
              </Grid>
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDeleteUser}
        moduleName={'usuario'}
      />
    </div>
  )
}

export default Users
