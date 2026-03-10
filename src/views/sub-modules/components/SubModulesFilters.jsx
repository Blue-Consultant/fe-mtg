'use client'
import { FormControl, InputLabel, Select, MenuItem, TextField, Tooltip, Button, Typography } from '@mui/material'

import CustomIconButton from '@/@core/components/mui/IconButton'
import CanAccess from '@/components/permissions/CanAccess'

const SubModulesFilters = ({
  dictionary,
  modulesList,
  selectedBranch,
  handleSelectFilterChange,
  debouncedSearch,
  viewModeToggle,
  changerViewer,
  customerUserOpen,
  setCustomerUserOpen,
  customerUserData,
  setCustomerUserData
}) => {
  return (
    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full'>
      <div className='md:w-auto'>
        <Typography variant='h4' className='mbe-1'>
          {dictionary?.modules?.subModules?.title || 'Submódulos'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {dictionary?.modules?.subModules?.subtitle || 'Gestiona los submódulos del sistema'}
        </Typography>
      </div>
      <div className='flex flex-col md:flex-row items-stretch md:items-center gap-2 md:w-auto md:ml-auto'>
        <div className='w-[80%] md:w-auto'>
          <CanAccess permission='crear'>
            <Button
              className={`h-[38px]`}
              variant='contained'
              color='primary'
              size='medium'
              fullWidth
              startIcon={<i className='ri-add-line' />}
              onClick={() => {
                setCustomerUserOpen(!customerUserOpen)
                setCustomerUserData({ data: {}, action: 'Create' })
              }}
            >
              {dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.addnewSubModules ||
                'Crear'}
            </Button>
          </CanAccess>
        </div>
        {/* Tooltip SOLO visible en móvil */}
        <div className='w-[20%] md:hidden'>
          <Tooltip title={viewModeToggle ? 'Vista de tabla' : 'Vista de tarjetas'} placement='right'>
            <CustomIconButton
              onClick={changerViewer}
              variant='contained'
              color='primary'
              size='medium'
              className='w-full h-[38px]'
            >
              <i className={viewModeToggle ? 'ri-list-check' : 'ri-layout-grid-line'}></i>
            </CustomIconButton>
          </Tooltip>
        </div>
      </div>
      <FormControl size='small' sx={{ minWidth: 200 }} className='w-full md:w-auto'>
        <InputLabel id='branch-id-label'>
          {dictionary.modules.subModules?.components?.table?.filterByModule || 'Filtrar por Módulo'}
        </InputLabel>
        <Select
          labelId='branch-id-label'
          value={selectedBranch}
          onChange={handleSelectFilterChange}
          label={dictionary.modules.subModules?.components?.table?.filterByModule || 'Filtrar por Módulo'}
        >
          <MenuItem value='all'>{dictionary.common.all}</MenuItem>
          {modulesList.map(module => (
            <MenuItem key={module.id} value={Number(module.id)}>
              {module.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size='small' sx={{ minWidth: 200 }} className='w-full md:w-auto'>
        <TextField
          fullWidth
          placeholder={dictionary.modules.subModules?.components?.table?.filterByWhite || 'Buscar submódulos'}
          size='small'
          onChange={e => debouncedSearch(e.target.value)}
        />
      </FormControl>

      <div className='hidden md:block'>
        <Tooltip title={viewModeToggle ? 'Vista de tabla' : 'Vista de tarjetas'} placement='top'>
          <CustomIconButton onClick={changerViewer} variant='contained' color='primary' className={``}>
            <i className={viewModeToggle ? 'ri-list-check' : 'ri-layout-grid-line'}></i>
          </CustomIconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default SubModulesFilters
