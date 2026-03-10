'use client'
import {
  FormControl,
  TextField,
  Tooltip,
  Button,
  Typography,
} from '@mui/material'
import CustomIconButton from '@/@core/components/mui/IconButton'
import CanAccess from '@/components/permissions/CanAccess'

const PermissionsFilters = ({
  dictionary,
  debouncedSearch,
  viewModeToggle,
  changerViewer,
  customerUserOpen,
  setCustomerUserOpen,
  setCustomerUserData
}) => {

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
      <div className='md:w-auto'>
        <Typography variant='h4' className='mbe-1'>
          {dictionary?.permissions?.permissions?.title || 'Permisos'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {dictionary?.permissions?.permissions?.subtitle || 'Gestiona los permisos del sistema'}
        </Typography>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:w-auto md:ml-auto">
        <div className="w-full md:w-auto">
          <CanAccess permission="crear">
            <Button
              className={`h-[38px]`}
              variant="contained"
              color="primary"
              size="medium"
              fullWidth
              startIcon={<i className="ri-add-line" />}
              onClick={() => {
                setCustomerUserOpen(!customerUserOpen)
                setCustomerUserData({ data: {}, action: 'Create' })
              }}
            >
              {dictionary?.permissions?.permissions?.components?.drawerModules?.formAddModules?.addnewModule || 'Crear'}
            </Button>
          </CanAccess>
        </div>
        {/* Tooltip SOLO visible en móvil */}
        <div className="w-[20%] md:hidden">
          <Tooltip title={viewModeToggle ? 'Vista de tabla' : 'Vista de tarjetas'} placement="right">
            <CustomIconButton
              onClick={changerViewer}
              variant="contained"
              color="primary"
              className="w-full h-[38px]"
            >
              <i className={viewModeToggle ? 'ri-list-check' : 'ri-layout-grid-line'}></i>
            </CustomIconButton>
          </Tooltip>
        </div>
        <FormControl size="small" sx={{ minWidth: 200 }} className={'w-full md:w-auto'}>
          <TextField
            fullWidth
            placeholder={dictionary?.permissions?.permissions?.components?.table?.search || 'Buscar permisos'}
            size="small"
            onChange={e => debouncedSearch(e.target.value)}
          />
        </FormControl>

        <div className="hidden md:block">
          <Tooltip title={viewModeToggle ? 'Vista de tabla' : 'Vista de tarjetas'} placement="top">
            <CustomIconButton
              onClick={changerViewer}
              variant="contained"
              color="primary"
              className={``}
            >
              <i className={viewModeToggle ? 'ri-list-check' : 'ri-layout-grid-line'}></i>
            </CustomIconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default PermissionsFilters
