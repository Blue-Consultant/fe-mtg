'use client'

import { Alert, Grid, Chip, Button, Typography, CardContent } from '@mui/material'

import SkeletonCard from '@/components/skeletonCard'
import { usePermissions } from '@/contexts/permissionsContext'

const CourtTypeCards = ({ controller, courtTypesReducer }) => {
  const { loading, setShowform, setDataProp, setOpenConfirmDialog } = controller

  const list = courtTypesReducer?.courtTypesList ?? []
  const { hasPermission } = usePermissions()

  const editType = item => {
    setDataProp({ action: 'edit', data: item })
    setShowform(true)
  }

  return (
    <CardContent className='flex flex-col gap-6'>
      <Grid container spacing={3}>
        {loading ? (
          <SkeletonCard rowsNum={2} />
        ) : list.length === 0 ? (
          <Grid item xs={12} container justifyContent='center' alignItems='center'>
            <Alert severity='info'>
              <Typography variant='h6'>No hay tipos de cancha</Typography>
              <Typography variant='body2'>Crea uno con el botón Agregar</Typography>
            </Alert>
          </Grid>
        ) : (
          list.map(item => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <div className='border rounded p-4 flex flex-col gap-3'>
                <div className='flex items-center justify-between flex-wrap gap-1'>
                  <Chip
                    label={item.estado ? 'Activo' : 'Inactivo'}
                    size='small'
                    color={item.estado ? 'success' : 'default'}
                    variant='tonal'
                  />
                </div>
                <Typography variant='h6'>{item.nombre}</Typography>
                {item.descripcion && (
                  <Typography variant='body2' color='text.secondary'>
                    {item.descripcion}
                  </Typography>
                )}
                <div className='flex gap-2 mt-auto'>
                  <Button
                    variant='outlined'
                    color='primary'
                    size='small'
                    startIcon={<i className='ri-edit-box-line' />}
                    onClick={() => editType(item)}
                    disabled={!hasPermission('editar')}
                  >
                    Editar
                  </Button>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    startIcon={<i className='ri-delete-bin-line' />}
                    onClick={() => {
                      setDataProp({ action: 'deactivate', data: item.id })
                      setOpenConfirmDialog(true)
                    }}
                    disabled={!hasPermission('eliminar')}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Grid>
          ))
        )}
      </Grid>
    </CardContent>
  )
}

export default CourtTypeCards
