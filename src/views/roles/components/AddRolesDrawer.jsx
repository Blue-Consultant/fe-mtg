'use client'

// MUI Imports
import {
  Typography,
  Button,
  TextField,
  FormControl,
  IconButton,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Drawer,
  Box,
  useMediaQuery,
  useTheme,
  FormHelperText
} from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Third-party Imports
import { Controller } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { PermissionsChecks } from './permissions/PermissionsChecks'
import { useRolesForm } from '../hooks/useRolesForm'

const AddRolesDrawer = ({ open, handleClose, controller, rolesReducer, dictionary }) => {
  // Theme
  const theme = useTheme()
  const isBelowSmScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const ScrollWrapper = isBelowSmScreen ? 'div' : PerfectScrollbar

  const {
    onSubmit,
    handlePermissionToggle,
    handleSelectAll,
    selectedPermissions,
    permissionsList,
    loadingPermissions,
    watchBranch,
    errors,
    isSubmitting,
    control,
    handleSubmit,
    branchesOwner,
    dataProp,
    handleModalClose,
    setValue
  } = useRolesForm(controller, rolesReducer, handleClose)

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleModalClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 500] } }}
    >
      {/* Header */}
      <Box className='flex justify-between items-center sidebar-header pli-5 plb-4 border-be'>
        <Typography variant='h5'>
          {dataProp?.action === 'add'
            ? dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.addRole || 'Crear Rol'
            : dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.updateRole || 'Actualizar Rol'}
        </Typography>
        <IconButton size='small' onClick={handleModalClose}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </Box>

      {/* Body con Scroll */}
      <ScrollWrapper
        {...(isBelowSmScreen
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true }, className: 'bs-full' })}
      >
        <Box className='sidebar-body plb-5 pli-6'>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Nombre */}
            <FormControl fullWidth className='mbe-6'>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'El nombre es obligatorio' }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.name || 'Nombre'}
                    placeholder={
                      dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.placeholder_name ||
                      'Ingrese el nombre'
                    }
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </FormControl>

            {/* Sucursal */}
            <FormControl fullWidth className='mbe-6' error={Boolean(errors.branch_id)}>
              <InputLabel id='branch_id'>Sucursal</InputLabel>
              <Controller
                name='branch_id'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select {...field} labelId='branch_id' label='Sucursal' value={field.value || ''}>
                    {branchesOwner.map(branch => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.branch_id && <FormHelperText>La sucursal es obligatoria</FormHelperText>}
            </FormControl>

            {/* Descripción */}
            <FormControl fullWidth className='mbe-6'>
              <Controller
                name='description'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label={
                      dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.description || 'Descripción'
                    }
                    placeholder={
                      dictionary.modules.roles?.components?.drawerRoles?.formAddRoles?.placeholder_description ||
                      'Ingrese la descripción'
                    }
                    sx={{ '& .MuiOutlinedInput-root': { alignItems: 'baseline' } }}
                  />
                )}
              />
            </FormControl>

            {/* Switches - Es estudiante / Es titular (mutuamente excluyentes) */}
            <FormControl fullWidth className='mbe-6'>
              <div className='flex items-center gap-6'>
                <Controller
                  name='is_student'
                  control={control}
                  render={({ field }) => (
                    <div className='flex items-center gap-1'>
                      <Switch
                        checked={field.value}
                        onChange={e => {
                          field.onChange(e.target.checked)
                          if (e.target.checked) setValue('is_holder', false)
                        }}
                        size='small'
                      />
                      <Typography variant='body2'>¿Es estudiante?</Typography>
                    </div>
                  )}
                />
                <Controller
                  name='is_holder'
                  control={control}
                  render={({ field }) => (
                    <div className='flex items-center gap-1'>
                      <Switch
                        checked={field.value}
                        onChange={e => {
                          field.onChange(e.target.checked)
                          if (e.target.checked) setValue('is_student', false)
                        }}
                        size='small'
                      />
                      <Typography variant='body2'>¿Es titular?</Typography>
                    </div>
                  )}
                />
              </div>
            </FormControl>

            {/* Permisos */}
            <FormControl fullWidth className='mbe-6'>
              <PermissionsChecks
                permissionsList={permissionsList}
                selectedPermissions={selectedPermissions}
                onPermissionToggle={handlePermissionToggle}
                onSelectAll={handleSelectAll}
                loading={loadingPermissions}
                hasBranch={!!watchBranch}
                dictionary={dictionary || {}}
              />
            </FormControl>

            {/* Botones */}
            <div className='flex gap-4'>
              <LoadingButton
                variant='contained'
                loading={isSubmitting}
                type='submit'
                sx={{ '& .MuiCircularProgress-root': { color: 'white' } }}
              >
                {dataProp?.action === 'add' ? 'Guardar' : 'Actualizar'}
              </LoadingButton>
              <Button variant='outlined' color='secondary' onClick={handleModalClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </Box>
      </ScrollWrapper>
    </Drawer>
  )
}

export default AddRolesDrawer
