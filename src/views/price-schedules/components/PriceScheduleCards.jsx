// MUI Imports
import { Alert, Grid, Chip, Button, Pagination, Typography, CardContent, IconButton } from '@mui/material'

// Components Imports
import { usePermissions } from '@/contexts/permissionsContext'
// Third-party Imports
import SkeletonCard from '@/components/skeletonCard'

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const PriceScheduleCards = ({ controller, priceSchedulesReducer }) => {
  const { loading, pagination, setShowform, setOpenConfirmDialog, setDataProp, handlePageChange } = controller
  const { rows = [], currentPage = 1, totalRows = 0, totalPages = 0 } = priceSchedulesReducer?.priceSchedulesPagination || {}
  const { hasPermission } = usePermissions()

  const editPriceSchedule = data => {
    setDataProp({
      action: 'edit',
      data: data
    })
    setShowform(true)
  }

  return (
    <CardContent className='flex flex-col gap-6'>
      <Grid container spacing={6}>
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
              <Typography variant='h6'>No hay horarios de precios disponibles</Typography>
            </Alert>
          </Grid>
        ) : (
          rows.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <div className='border rounded bs-full p-5'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between'>
                    <Chip
                      label={item.estado ? 'Activo' : 'Inactivo'}
                      variant='tonal'
                      size='small'
                      color={item.estado ? 'success' : 'error'}
                    />
                    <Chip
                      label={DAYS_OF_WEEK[item.dia_semana] || `Día ${item.dia_semana}`}
                      variant='outlined'
                      size='small'
                      color='primary'
                    />
                  </div>
                  <div className='flex flex-col gap-1'>
                    <Typography variant='h6' className='hover:text-primary'>
                      {item.Courts?.nombre || 'Cancha desconocida'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {item.Courts?.SportsVenue?.name || 'Sin sucursal'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Horario: {item.hora_inicio} - {item.hora_fin}
                    </Typography>
                    <Typography variant='h6' color='primary'>
                      S/ {Number(item.precio).toFixed(2)}
                    </Typography>
                  </div>
                  <div className='flex flex-wrap gap-4'>
                    <Button
                      fullWidth
                      variant='outlined'
                      color='primary'
                      startIcon={<i className='ri-edit-box-line' />}
                      onClick={() => editPriceSchedule(item)}
                      className={`is-auto flex-auto`}
                      disabled={!hasPermission('editar')}
                    >
                      Editar
                    </Button>
                    <Button
                      fullWidth
                      variant='outlined'
                      color='error'
                      startIcon={<i className='ri-delete-bin-line' />}
                      onClick={() => {
                        setDataProp({
                          action: 'deactivate',
                          data: item.id
                        })
                        setOpenConfirmDialog(true)
                      }}
                      className={`is-auto flex-auto`}
                      disabled={!hasPermission('eliminar')}
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
              onChange={(_, newPage) => {
                handlePageChange(newPage)
              }}
            />
          </div>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default PriceScheduleCards
