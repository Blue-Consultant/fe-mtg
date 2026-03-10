'use client'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Button,
  Typography,
} from '@mui/material'
import CustomIconButton from '@/@core/components/mui/IconButton'
import CanAccess from '@/components/permissions/CanAccess'

const RelationFilters = ({
  dictionary,
  onOpenRoleDialog,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:justify-end">
      <div className='md:w-auto'>
        <Typography variant='h4' className='mbe-1'>
          {dictionary?.modules?.rolesModulesSubmodules?.title || 'Relación de Submódulos a Roles'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {dictionary?.modules?.rolesModulesSubmodules?.subtitle || 'Asigna los submódulos a los roles del sistema'}
        </Typography>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:w-auto md:ml-auto">
      <CanAccess permission="crear">
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<i className="ri-shield-check-line" />}
        onClick={onOpenRoleDialog}
        sx={{ minWidth: 'max-content', whiteSpace: 'nowrap' }}
        className={``}
      >
        {dictionary.modules?.rolesModulesSubmodules?.assignPermissions || 'Asignar Roles'}
      </Button>
      </CanAccess>
      </div>
    </div>
  )
}

export default RelationFilters
