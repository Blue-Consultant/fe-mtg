'use client'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Pagination from '@mui/material/Pagination'
import CustomAvatar from '@core/components/mui/Avatar'
import SkeletonCard from '@/components/skeletonCard'
import AddModulesDrawer from './AddModulesDrawer'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { Box, Button, Chip } from '@mui/material'
import ModulesFilters from './ModulesFilters'
import { usePermissions } from '@/contexts/permissionsContext'

const ModulesCards = ({
  loading,
  valuesPagination,
  setValuesPagination,
  customerUserOpen,
  setCustomerUserOpen,
  userDataReducer,
  searchedUserList,
  setSearchedUserList,
  customerUserData,
  setCustomerUserData,
  dictionary,
  modulesReducer,
  handleDelete,
  openDeleteDialog,
  setOpenConfirmDialog,
  openConfirmDialog,
  fetchModulesData,
  debouncedSearch,
  changerViewer,
  viewModeToggle
 }) => {

  const { rows = []} = modulesReducer?.modulesPagination || {}
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
                <ModulesFilters
                  dictionary={dictionary}
                  debouncedSearch={debouncedSearch}
                  viewModeToggle={viewModeToggle}
                  changerViewer={changerViewer}
                  customerUserOpen={customerUserOpen}
                  setCustomerUserOpen={setCustomerUserOpen}
                  customerUserData={customerUserData}
                  setCustomerUserData={setCustomerUserData}
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
                        <i className={item.icon || "ri-building-2-line"} />
                      </CustomAvatar>

                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            {item.name}
                          </Typography>
                          {(item.order !== null && item.order !== undefined) && (
                            <Chip
                              label={`#${item.order}`}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.translate}
                        </Typography>
                      </Box>

                      <Chip
                        label={item.status ? 'Activo' : 'Inactivo'}
                        color={item.status ? 'success' : 'error'}
                        variant="tonal"
                        sx={{ flexShrink: 0 }}
                      />
                    </Box>

                    {/* Descripción + sucursales */}
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body2"
                        // color="primary"
                        sx={{
                          pr: 2,
                          display: '-webkit-box',
                          overflow: 'hidden',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 2,
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.description}
                      </Typography>
                      <Typography variant="h6">
                        {item.descripcion}
                      </Typography>
                    </Box>

                    {/* Botones abajo siempre */}
                    <Box sx={{ display: 'flex', gap: 4, mt: 'auto' }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<i className='ri-edit-box-line' />}
                        className={`is-auto flex-auto`}
                        color="primary"
                        disabled={!hasPermission('editar')}
                        onClick={() => {
                          setCustomerUserOpen(!customerUserOpen)
                          setCustomerUserData({ data: item, action: 'Update' })
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<i className="ri-delete-bin-line" />}
                        className={`is-auto flex-auto`}
                        color="error"
                        onClick={() => openDeleteDialog(item.id)}
                        disabled={!hasPermission('eliminar')}
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
              count={valuesPagination.totalPages || 1} // totalPages desde el mismo estado que usa la tabla
              page={valuesPagination.currentPage}     // base 1
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

      <AddModulesDrawer
        open={customerUserOpen}
        customerUserData={customerUserData}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        userDataReducer={userDataReducer}
        searchedUserList={searchedUserList}
        setSearchedUserList={setSearchedUserList}
        dictionary={dictionary}
        valuesPagination={valuesPagination}
        fetchModulesData={fetchModulesData}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDelete}
        moduleName={'Módulos'}
      />
    </>
  )
}

export default ModulesCards
