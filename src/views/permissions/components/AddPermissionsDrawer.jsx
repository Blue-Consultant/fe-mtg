import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller } from 'react-hook-form';
import { Box, CircularProgress } from '@mui/material';
import { usePermissionsForm } from '../hooks/usePermissionsForm';

const AddPermissionsDrawer = ({ open, handleClose, dictionary, customerUserData, fetchPermissionsData }) => {
  const { control, errors, handleSubmit, isLoading, reset } =
    usePermissionsForm(customerUserData, handleClose, fetchPermissionsData)

  const handleReset = () => {
    reset()
    handleClose()
  }

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={handleReset}
      ModalProps={{
        keepMounted: true,
        disableEnforceFocus: true,
        disableRestoreFocus: false
      }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between pli-5 plb-4">
        <Typography variant="h5">
          {dictionary?.permissions?.permissions?.components?.drawerPermissions?.formAddPermissions?.addnewPermission || 'Crear'}
          </Typography>
        <IconButton size="small" onClick={handleReset}>
          <i className="ri-close-line text-2xl" />
        </IconButton>
      </div>
      <Divider />
      <div className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary?.permissions?.permissions?.components?.drawerPermissions?.formAddPermissions?.name || 'Nombre'}
                placeholder="Ingrese el nombre"
                error={Boolean(errors.name)}
                helperText={errors.name ? dictionary.rules.required : ''}
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                label={dictionary?.permissions?.permissions?.components?.drawerPermissions?.formAddPermissions?.description || 'Descripción'}
                placeholder="Ingrese la descripción"
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
                <Typography>
                  {field.value
                    ? dictionary?.permissions?.permissions?.components?.drawerModules?.formAddModules?.active || 'Activo'
                    : dictionary?.permissions?.permissions?.components?.drawerModules?.formAddModules?.inactive || 'Inactivo'}
                </Typography>
              </div>
            )}
          />
          <div className="flex items-center gap-4">
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading}
              sx={{ minWidth: 120, height: 40 }}
            >
              {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                </Box>
              ) : (
                dictionary?.common?.create || 'Crear'
              )}
            </Button>
            <Button variant="outlined" color="error" onClick={handleReset}>
              {dictionary?.common?.cancel || 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddPermissionsDrawer
