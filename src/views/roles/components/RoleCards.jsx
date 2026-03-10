'use client'

import { useState, useMemo } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Pagination from '@mui/material/Pagination'
import CustomAvatar from '@core/components/mui/Avatar'
import SkeletonCard from '@/components/skeletonCard'
import RolesFilters from './filters/RolesFilter'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { Box, Button, Chip } from '@mui/material'
import { usePermissions } from '@/contexts/permissionsContext'

const RoleCards = ({ controller, rolesReducer, dictionary = {} }) => {
  const {
    loading,
    setShowform,
    setDataProp,
    handleSearchChange,
    viewModeToggle,
    changerViewer,
    pagination,
    handlePageChange,
    deleteRoles
  } = controller
  const { rows = [], totalPages = 1 } = rolesReducer?.rolesPagination || {}
  const currentPage = pagination?.currentPage ?? 1
  const branchesOwner = rolesReducer?.branchesOwnerRoles || []

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const { hasPermission } = usePermissions()

  const branchNameMap = useMemo(() => {
    const map = new Map()

    branchesOwner.forEach(branch => {
      const branchData = branch?.Branches || branch
      if (branchData?.id) {
        map.set(Number(branchData.id), branchData.name || '')
      }
    })

    return map
  }, [branchesOwner])

  const branchLabel = dictionary?.modules?.roles?.components?.table?.branch || 'Sucursal'
  const branchFallbackLabel = dictionary?.modules?.roles?.components?.table?.noBranch || 'Sin sucursal'
  const handleEdit = (roleData) => {
    setDataProp({ action: 'edit', data: roleData })
    setShowform(true)
  }

  const openDeleteDialog = (role) => {
    setSelectedRole(role)
    setOpenConfirmDialog(true)
  }

  const handleDelete = async (isConfirmed) => {
    if (isConfirmed && selectedRole) {
      try {
        await deleteRoles(selectedRole)
      } catch (error) {
        console.error('Error al eliminar rol:', error)
      } finally {
        setOpenConfirmDialog(false)
        setSelectedRole(null)
      }
    } else {
      setOpenConfirmDialog(false)
      setSelectedRole(null)
    }
  }

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
                <RolesFilters
                  dictionary={dictionary}
                  onSearchChange={handleSearchChange}
                  viewModeToggle={viewModeToggle}
                  changerViewer={changerViewer}
                  setShowform={setShowform}
                  setDataProp={setDataProp}
                />
              </Box>
            </Grid>
            {rows.map((role) => (
              <Grid item xs={12} sm={6} lg={3} key={role.id} sx={{ display: 'flex', justifyContent: 'center'}}>
                <Card sx={{ minHeight: 220, height: '100%', width: { xs: '90%', sm: '100%' }}}>
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
                      <CustomAvatar skin="light" color="primary" variant="rounded">
                        <i className='ri-shield-user-line' />
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip
                          label={role.status ? 'Activo' : 'Inactivo'}
                          color={role.status ? 'success' : 'error'}
                          variant="tonal"
                          size="small"
                        />
                        <Typography variant='caption' color='text.secondary'>
                          {`${branchLabel}: ${branchNameMap.get(Number(role.branch_id)) || branchFallbackLabel}`}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant='h6' color="primary" className='mb-2'>
                      {role.name}
                    </Typography>

                    <Typography
                      variant='body2'
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        flexGrow: 1,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {role.description || 'Sin descripción'}
                    </Typography>

                    {/* Botones */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
                      <Button
                        disabled={!hasPermission('editar')}
                        variant="outlined"
                        fullWidth
                        startIcon={<i className='ri-edit-box-line' />}
                        className={``}
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(role)}
                      >
                        {dictionary?.modules?.roles?.components?.buttons?.edit || 'Editar'}
                      </Button>
                      <Button
                        disabled={!hasPermission('eliminar')}
                        variant="outlined"
                        fullWidth
                        className={``}
                        startIcon={<i className="ri-delete-bin-line" />}
                        color="error"
                        size="small"
                        onClick={() => openDeleteDialog(role)}
                      >
                        {dictionary?.modules?.roles?.components?.buttons?.delete || 'Eliminar'}
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
              count={totalPages || 1}
              page={currentPage}
              showFirstButton
              showLastButton
              variant='tonal'
              color='primary'
              onChange={(_, newPage) => {
                handlePageChange(newPage)
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
        moduleName={'Roles'}
      />
    </>
  )
}

export default RoleCards
