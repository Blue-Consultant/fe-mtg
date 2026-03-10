'use client'
import { FormControl, TextField, Tooltip, Typography, Button } from '@mui/material'

import CustomIconButton from '@/@core/components/mui/IconButton'
import CanAccess from '@/components/permissions/CanAccess'

const RolesFilters = ({ dictionary, onSearchChange, viewModeToggle, changerViewer, setShowform, setDataProp }) => {
  return (
    <div className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
      <div>
        <Typography variant='h4' className='mbe-1'>
          {dictionary.modules.roles?.title || 'Roles'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Gestiona los roles del sistema
        </Typography>
      </div>

      <div className='flex flex-wrap items-center gap-2 w-full md:w-auto'>
        <CanAccess permission='crear'>
          <Button
            startIcon={<i className='ri-add-line' />}
            variant='contained'
            className={``}
            onClick={() => {
              setDataProp({ action: 'add', data: null })
              setShowform(true)
            }}
          >
            {dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.addRole || 'Crear'}
          </Button>
        </CanAccess>

        <FormControl size='small' sx={{ minWidth: 200 }} className='w-full md:w-auto'>
          <TextField
            fullWidth
            placeholder={dictionary.modules.roles?.components?.table?.search || 'Buscar roles'}
            size='small'
            onChange={e => onSearchChange(e.target.value)}
          />
        </FormControl>

        {/* Tooltip visible en móvil */}
        <div className='w-[20%] md:hidden'>
          <Tooltip title={viewModeToggle ? 'Vista de tabla' : 'Vista de tarjetas'} placement='right'>
            <CustomIconButton onClick={changerViewer} variant='contained' color='primary' className='w-full h-[38px]'>
              <i className={viewModeToggle ? 'ri-list-check' : 'ri-layout-grid-line'}></i>
            </CustomIconButton>
          </Tooltip>
        </div>

        {/* Tooltip visible en escritorio */}
        <div className='hidden md:block'>
          <Tooltip title={viewModeToggle ? 'Vista de tabla' : 'Vista de tarjetas'} placement='top'>
            <CustomIconButton onClick={changerViewer} variant='contained' color='primary'>
              <i className={viewModeToggle ? 'ri-list-check' : 'ri-layout-grid-line'}></i>
            </CustomIconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default RolesFilters
