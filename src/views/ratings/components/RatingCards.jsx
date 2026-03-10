import { Alert, Grid, Button, Pagination, Typography, CardContent } from '@mui/material'
import Rating from '@mui/material/Rating'

import { usePermissions } from '@/contexts/permissionsContext'
import SkeletonCard from '@/components/skeletonCard'

const formatDate = dateStr => {
  if (!dateStr) return '-'

  return new Date(dateStr).toLocaleDateString('es', { dateStyle: 'short' })
}

const RatingCards = ({ controller, ratingsReducer }) => {
  const { loading, pagination, setShowform, setOpenConfirmDialog, setDataProp, handlePageChange } = controller
  const { rows = [], currentPage = 1, totalPages = 0 } = ratingsReducer?.ratingsPagination || {}
  const { hasPermission } = usePermissions()

  const editRating = data => {
    setDataProp({ action: 'edit', data })
    setShowform(true)
  }

  return (
    <CardContent className='flex flex-col gap-6'>
      <Grid container spacing={6}>
        {loading ? (
          <SkeletonCard rowsNum={3} />
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
              <Typography variant='h6'>No hay valoraciones</Typography>
            </Alert>
          </Grid>
        ) : (
          rows.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item.id || index}>
              <div className='border rounded bs-full p-5'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <Rating name='read-only' value={item.puntuacion} readOnly size='small' max={5} />
                    <Typography variant='caption' color='text.secondary'>
                      {formatDate(item.created_at)}
                    </Typography>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='h6' className='hover:text-primary'>
                      {item.Courts?.nombre || 'Cancha desconocida'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {item.Courts?.SportsVenue?.name || 'Sin sucursal'}
                    </Typography>
                    {item.Users && (
                      <Typography variant='body2' color='text.secondary'>
                        Por:{' '}
                        {[item.Users.first_name, item.Users.last_name].filter(Boolean).join(' ') || item.Users.email}
                      </Typography>
                    )}
                    {item.comentario && (
                      <Typography variant='body2' sx={{ mt: 1 }}>
                        {item.comentario}
                      </Typography>
                    )}
                  </div>
                  <div className='flex flex-row gap-2' style={{ width: '100%' }}>
                    <Button
                      variant='outlined'
                      color='primary'
                      startIcon={<i className='ri-edit-box-line' />}
                      onClick={() => editRating(item)}
                      disabled={!hasPermission('editar')}
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant='outlined'
                      color='error'
                      startIcon={<i className='ri-delete-bin-line' />}
                      onClick={() => {
                        setDataProp({ action: 'deactivate', data: item.id })
                        setOpenConfirmDialog(true)
                      }}
                      disabled={!hasPermission('eliminar')}
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Grid>
          ))
        )}
        <Grid item xs={12} sm={12} lg={12}>
          <div className='flex justify-center'>
            <Pagination
              count={Math.ceil(totalPages)}
              page={pagination.currentPage}
              showFirstButton
              showLastButton
              variant='tonal'
              color='primary'
              onChange={(_, newPage) => handlePageChange(newPage)}
            />
          </div>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default RatingCards
