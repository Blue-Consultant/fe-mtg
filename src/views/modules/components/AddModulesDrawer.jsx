import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Controller } from 'react-hook-form';
import { Box, CircularProgress } from '@mui/material';
import { useModulesForm } from '../hooks/useModulesForm';

const AddModulesDrawer = ({ open, handleClose, userDataReducer, dictionary, customerUserData, fetchModulesData}) => {
  
  const { control, errors, handleSubmit, isLoading, reset } =
    useModulesForm(customerUserData, handleClose, fetchModulesData);

  const handleReset = () => {
    reset();
    handleClose();
  };

  return (
    <Drawer
      open={open}
      anchor="right"
      variant="temporary"
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className="flex items-center justify-between pli-5 plb-4">
        <Typography variant="h5">
          {dictionary.modules.modules?.components?.drawerModules?.formAddModules?.addnewModule || 'Crear'}
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
                label={dictionary.modules.modules?.components?.drawerModules?.formAddModules?.name || 'Nombre'}
                placeholder="Ingrese el nombre"
                error={Boolean(errors.name)}
                helperText={errors.name ? dictionary.rules.required : ''}
              />
            )}
          />
          <Controller
            name="translate"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary.modules.modules?.components?.drawerModules?.formAddModules?.translate || 'Traducción'}
                placeholder="Ingrese la traducción"
                error={Boolean(errors.translate)}
                helperText={errors.translate ? dictionary.rules.required : ''}
              />
            )}
          />
          <Controller
            name="descripcion"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                label={dictionary.modules.modules?.components?.drawerModules?.formAddModules?.description || 'Descripción'}
                placeholder="Ingrese la descripción"
              />
            )}
          />
          <Controller
            name="link"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary.modules.modules?.components?.drawerModules?.formAddModules?.link || 'Link'}
                placeholder="Ingrese el link"
                error={Boolean(errors.link)}
                helperText={errors.link ? dictionary.rules.required : ''}
              />
            )}
          />
          <Controller
            name="icon"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={dictionary.modules.modules?.components?.drawerModules?.formAddModules?.icon || 'Ícono'}
                placeholder="ej: ri-home-line o mdi-account (opcional)"
              />
            )}
          />
          <Controller
            name="order"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={dictionary.modules.modules?.components?.drawerModules?.formAddModules?.order || 'Orden'}
                placeholder="Ingrese el orden numérico"
                error={Boolean(errors.order)}
                helperText={errors.order ? dictionary.rules.required : ''}
                inputProps={{ min: 0, step: 1 }}
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
                    ? dictionary.modules.modules?.components?.drawerModules?.formAddModules?.active || 'Activo'
                    : dictionary.modules.modules?.components?.drawerModules?.formAddModules?.inactive || 'Inactivo'}
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
                dictionary.common.add
              )}
            </Button>
            <Button variant="outlined" color="error" onClick={handleReset}>
              {dictionary.common.cancel}
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddModulesDrawer;