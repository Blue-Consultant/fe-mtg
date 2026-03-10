import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Controller } from 'react-hook-form'
import { Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material'

import { useSubModulesForm } from '../hooks/useSubModulesForm'

const AddSubModulesDrawer = ({ open, handleClose, dictionary, customerUserData, fetchSubModulesData, modulesList }) => {
  const { control, errors, handleSubmit, isLoading, reset } = useSubModulesForm(
    customerUserData,
    handleClose,
    fetchSubModulesData
  )

  const handleReset = () => {
    reset()
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>
          {customerUserData?.action === 'Update'
            ? dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.editSubModule ||
              'Editar SubMódulo'
            : dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.addnewSubModules ||
              'Agregar SubMódulo'}
        </Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.name || 'Nombre'}
                placeholder='Ingrese el nombre'
                error={Boolean(errors.name)}
                helperText={errors.name ? dictionary.rules.required : ''}
              />
            )}
          />
          <Controller
            name='translate'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={
                  dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.translate ||
                  'Traducción'
                }
                placeholder='Ingrese la traducción'
                error={Boolean(errors.translate)}
                helperText={errors.translate ? dictionary.rules.required : ''}
              />
            )}
          />
          <Controller
            name='icon'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.icon || 'Icono'}
                placeholder='Ej: ri-home-line'
                error={Boolean(errors.icon)}
                helperText={errors.icon?.message || ''}
              />
            )}
          />
          <Controller
            name='link'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.link || 'Enlace'}
                placeholder='/ruta-del-enlace'
                error={Boolean(errors.link)}
                helperText={errors.link ? dictionary.rules.required : ''}
                disabled={customerUserData?.action === 'Update'}
              />
            )}
          />
          <Controller
            name='order'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type='number'
                label={dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.order || 'Orden'}
                placeholder='Ingrese el orden'
                error={Boolean(errors.order)}
                helperText={errors.order ? dictionary.rules.required : ''}
              />
            )}
          />
          <FormControl fullWidth error={Boolean(errors.module_id)}>
            <InputLabel id='module-id-label'>
              {dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.module_id ||
                'Nombre del Módulo'}
            </InputLabel>
            <Controller
              name='module_id'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId='module-id-label'
                  label={
                    dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.module_id ||
                    'Nombre del Módulo'
                  }
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value)}
                >
                  {modulesList && modulesList.length > 0 ? (
                    modulesList.map(module => {
                      return (
                        <MenuItem key={module.id} value={Number(module.id)}>
                          {module.name}
                        </MenuItem>
                      )
                    })
                  ) : (
                    <MenuItem disabled>No hay módulos disponibles</MenuItem>
                  )}
                </Select>
              )}
            />
            {errors.module_id && <FormHelperText>{dictionary.rules.required}</FormHelperText>}
          </FormControl>
          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <div className='flex items-center gap-2'>
                <Switch checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                <Typography>
                  {field.value
                    ? dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.active || 'Activo'
                    : dictionary.modules.subModules?.components?.drawerSubModules?.formAddSubModules?.inactive ||
                      'Inactivo'}
                </Typography>
              </div>
            )}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={isLoading} sx={{ minWidth: 120, height: 40 }}>
              {isLoading ? (
                <Box display='flex' justifyContent='center' alignItems='center'>
                  <CircularProgress size={20} color='inherit' />
                </Box>
              ) : customerUserData?.action === 'Update' ? (
                dictionary.common.update || 'Actualizar'
              ) : (
                dictionary.common.add || 'Agregar'
              )}
            </Button>
            <Button variant='outlined' color='error' onClick={handleReset}>
              {dictionary.common.cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddSubModulesDrawer
