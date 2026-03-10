'use client'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

import { useRelationForm } from '../hooks/useRelationForm'
import { RelationChecks } from './RelationChecks'

const RelationForm = ({ open, setOpen, dictionary, selectedRole, onSuccessCallback }) => {
  const {
    loadingRoles,
    localModule,
    localSubModulesList,
    expandedModules,
    selectedSubModules,
    loadingRegister,
    localModulesList,
    loadingModules,
    loadingSubModules,
    theme,
    localRolesList,
    localRole,
    existingSubModules,
    toggleModuleExpansion,
    handleSubmit,
    handleSelectAllSubModules,
    handleSubModuleToggle,
    handleClose,
    setLocalRole,
    setLocalModule
  } = useRelationForm(setOpen, selectedRole, onSuccessCallback)

  return (
    <Dialog
      fullWidth
      maxWidth='lg'
      scroll='body'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          margin: 2
        }
      }}
    >
      <DialogTitle variant='h4' className='flex flex-col gap-2 text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {dictionary.modules?.rolesModulesSubmodules?.assignPermissions || 'Asignar Permisos de Rol'}
        <Typography component='span' className='flex flex-col text-center text-sm'>
          {dictionary.modules?.rolesModulesSubmodules?.assignPermissionsSubtitle ||
            'Configure los permisos para el rol seleccionado'}
        </Typography>
      </DialogTitle>
      <form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <DialogContent className='overflow-visible pbs-0 sm:pli-16'>
          <IconButton onClick={handleClose} className='absolute block-start-4 inline-end-4'>
            <i className='ri-close-line text-textSecondary' />
          </IconButton>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {/* Selector de Rol */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size='small'>
                <InputLabel id='modal-role-select-label'>{dictionary.common?.role || 'Rol'}</InputLabel>
                <Select
                  labelId='modal-role-select-label'
                  value={localRole}
                  onChange={e => setLocalRole(e.target.value)}
                  label={dictionary.common?.role || 'Rol'}
                  disabled={loadingRoles}
                  startAdornment={loadingRoles && <CircularProgress size={20} sx={{ mr: 1 }} />}
                >
                  <MenuItem value=''>
                    <em>{dictionary.common?.select || 'Seleccionar...'}</em>
                  </MenuItem>
                  {loadingRoles ? (
                    <MenuItem disabled>
                      <em>Cargando roles...</em>
                    </MenuItem>
                  ) : (
                    localRolesList &&
                    localRolesList.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name} {role.SportsVenue ? `(${role.SportsVenue.name})` : '(Global)'}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Selector de Módulo */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size='small'>
                <InputLabel id='modal-module-select-label'>{dictionary.common?.module || 'Módulo'}</InputLabel>
                <Select
                  labelId='modal-module-select-label'
                  value={localModule}
                  multiple
                  onChange={e => setLocalModule(e.target.value)}
                  label={dictionary.common?.module || 'Módulo'}
                  disabled={!localRole || loadingModules}
                  startAdornment={loadingModules && <CircularProgress size={20} sx={{ mr: 1 }} />}
                  renderValue={selected =>
                    selected.length > 0
                      ? `${selected.length} módulo${selected.length > 1 ? 's' : ''} seleccionado${selected.length > 1 ? 's' : ''}`
                      : ''
                  }
                >
                  {loadingModules ? (
                    <MenuItem disabled>
                      <em>Cargando módulos...</em>
                    </MenuItem>
                  ) : (
                    localModulesList &&
                    localModulesList.map(module => (
                      <MenuItem key={module.id} value={module.id}>
                        {/* <Checkbox checked={localModule.indexOf(module.id) > -1} /> */}
                        {module.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Sección de Submódulos con Checkboxes */}
          {localModule && localModule.length > 0 && (
            <RelationChecks
              dictionary={dictionary}
              localSubModulesList={localSubModulesList}
              selectedSubModules={selectedSubModules}
              handleSelectAllSubModules={handleSelectAllSubModules}
              toggleModuleExpansion={toggleModuleExpansion}
              handleSubModuleToggle={handleSubModuleToggle}
              theme={theme}
              loadingSubModules={loadingSubModules}
              localModulesList={localModulesList}
              localModule={localModule}
              expandedModules={expandedModules}
              existingSubModules={existingSubModules}
            />
          )}
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16 gap-2'>
          <Button
            variant='contained'
            type='submit'
            disabled={!localRole || localModule.length === 0 || selectedSubModules.length === 0}
            startIcon={<i className='ri-save-line' />}
          >
            {loadingRegister ? (
              <CircularProgress sx={{ color: '#ffffff' }} size={24} />
            ) : (
              dictionary.common?.create || 'Crear'
            )}
          </Button>
          <Button
            variant='outlined'
            type='button'
            color='secondary'
            onClick={handleClose}
            startIcon={<i className='ri-close-line' />}
          >
            {dictionary.common?.cancel || 'Cancelar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default RelationForm
