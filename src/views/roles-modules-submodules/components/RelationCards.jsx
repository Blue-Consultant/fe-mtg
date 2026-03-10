'use client'
import { useState } from 'react'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import CustomAvatar from '@core/components/mui/Avatar'
import SkeletonCard from '@/components/skeletonCard'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { Box, Button, Chip } from '@mui/material'
import RelationForm from './RelationForm'
import RelationFilters from './RelationFilters'
import { usePermissions } from '@/contexts/permissionsContext'

const RelationCards = ({
  loading,
  valuesPagination,
  setValuesPagination,
  customerUserOpen,
  setCustomerUserOpen,
  branchList,
  rolesList,
  modulesList,
  customerUserData,
  setCustomerUserData,
  dictionary,
  rolePermissions,
  handleDelete,
  openDeleteDialog,
  setOpenConfirmDialog,
  openConfirmDialog,
  selectedBranch,
  setSelectedBranch,
  selectedRole,
  setSelectedRole,
  handleSelectFilterChange,
  debouncedSearch,
  changerViewer,
  viewModeToggle
 }) => {
  const [openRoleDialog, setOpenRoleDialog] = useState(false)
  const rows = rolePermissions?.rows || []
  const { hasPermission } = usePermissions()

  return (
    <>
      <Grid
      container
      spacing={2}
      alignItems="stretch"
      justifyContent="center"
      >
        {loading ? (
          <SkeletonCard rowsNum={3}></SkeletonCard>
        ) : rows.length === 0 ? (
          <Grid
            item
            xs={12}
            container
            justifyContent='center'
            alignItems='center'
            style={{ display: 'flex', width: '100%' }}
          >
            <Alert severity='info'>
              <Typography variant='h6'>No data available at the moment</Typography>
            </Alert>
          </Grid>
        ) : (
          <Grid container spacing={2} alignItems="stretch">
            <Grid
              item
              xs={12}
              sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}
            >
              <Box sx={{ width: { xs: '90%', sm: '100%' } }}>
                <RelationFilters
                  dictionary={dictionary}
                  branchList={branchList}
                  rolesList={rolesList}
                  selectedBranch={selectedBranch}
                  selectedRole={selectedRole}
                  setSelectedBranch={setSelectedBranch}
                  setSelectedRole={setSelectedRole}
                  handleSelectFilterChange={handleSelectFilterChange}
                  debouncedSearch={debouncedSearch}
                  viewModeToggle={viewModeToggle}
                  changerViewer={changerViewer}
                  customerUserOpen={customerUserOpen}
                  setCustomerUserOpen={setCustomerUserOpen}
                  customerUserData={customerUserData}
                  setCustomerUserData={setCustomerUserData}
                  onOpenRoleDialog={() => setOpenRoleDialog(true)}
                />
              </Box>
            </Grid>
            {rows.map((item, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index} sx={{ display: 'flex', justifyContent: 'center'}}>
                <Card sx={{ minHeight: 220, height: '100%', width: { xs: '90%', sm: '100%' }}}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <CustomAvatar skin="light" color="primary" variant="rounded">
                        <i className={item.Submodules?.icon || "ri-file-line"} />
                      </CustomAvatar>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          color="primary"
                          noWrap
                          variant="body1"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: { xs: '90%', sm: '100%' }
                          }}
                        >
                          {item.Submodules?.name || 'N/A'}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.Submodules?.link || 'Sin enlace'}
                        </Typography>
                      </Box>

                      <Chip
                        label={item.status ? 'Activo' : 'Inactivo'}
                        color={item.status ? 'success' : 'error'}
                        variant="tonal"
                        sx={{ flexShrink: 0 }}
                      />

                    </Box>

                    {/* Información adicional */}
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                        <strong>Rol:</strong> {item.Roles?.name || 'Sin Rol'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Módulo:</strong> {item.Modules?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        <strong>Orden:</strong> {item.Submodules?.order ?? 'N/A'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled={!hasPermission('eliminar')}
                        startIcon={<i className="ri-delete-bin-line" />}
                        color="error"
                        onClick={() => openDeleteDialog(item.permission_id)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Grid item xs={12} sm={12} lg={12}>
          <div className='flex justify-center'>
            <Pagination
              count={valuesPagination.totalPages || 1}
              page={valuesPagination.currentPage}
              showFirstButton
              showLastButton
              variant='tonal'
              color='primary'
              onChange={(_, newPage) => {
                setValuesPagination(prev => ({
                  ...prev,
                  currentPage: newPage
                }))
              }}
            />
          </div>
        </Grid>
      </Grid>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDelete}
        moduleName={'Permiso'}
      />

      <RelationForm
        open={openRoleDialog}
        setOpen={setOpenRoleDialog}
        dictionary={dictionary}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
      />
    </>
  )
}

export default RelationCards
