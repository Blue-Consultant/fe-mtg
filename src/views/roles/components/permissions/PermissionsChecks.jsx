'use client'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import PermissionsChecksSkeleton from './PermissionsChecksSkeleton'

export const PermissionsChecks = ({
  permissionsList = [],
  selectedPermissions = [],
  onPermissionToggle,
  onSelectAll,
  loading = false,
  hasBranch = false,
  dictionary
}) => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(true) // Expandido por defecto

  // Si no hay sucursal seleccionada
  if (!hasBranch) {
    return (
      <div className='flex items-center gap-3 p-4 border rounded-lg' style={{ borderColor: theme.palette.divider, backgroundColor: theme.palette.action.hover }}>
        <i className='ri-information-line' style={{ fontSize: '1.25rem', color: theme.palette.text.secondary }} />
        <Typography variant='body2' color='text.secondary'>
          Seleccione una sucursal para ver los permisos
        </Typography>
      </div>
    )
  }

  // Si está cargando, mostrar skeleton
  if (loading) {
    return <PermissionsChecksSkeleton count={4} />
  }

  return (
    <Grid container spacing={2} sx={{
      mt: 2,
      p: 3,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: 'action.hover'
    }}>
      <Grid item xs={12}>
        <div className='flex items-center justify-between mb-3'>
          <Typography variant='h6' className='font-semibold' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className='ri-shield-check-line' style={{ fontSize: '1.25rem' }} />
            {dictionary.modules.roles?.components?.permissions?.title || 'Permisos'}
          </Typography>
          {permissionsList.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedPermissions.length === permissionsList.length && permissionsList.length > 0}
                  indeterminate={selectedPermissions.length > 0 && selectedPermissions.length < permissionsList.length}
                  onChange={onSelectAll}
                  color="primary"
                />
              }
              label={
                <Typography variant='body2' className='font-medium'>
                  {dictionary?.common?.selectAll || 'Seleccionar todos'}
                </Typography>
              }
            />
          )}
        </div>
      </Grid>

      <Grid item xs={12}>
        {permissionsList.length === 0 ? (
          <Typography color='textSecondary' className='text-center p-6' sx={{
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}>
            <i className='ri-information-line' />
            {dictionary.modules.roles?.components?.permissions?.no_data || 'No hay permisos disponibles. Seleccione una sucursal primero.'}
          </Typography>
        ) : (
          <div className='space-y-4'>
            <div
              className='flex items-center gap-2 mb-2 pb-2 border-b-2 cursor-pointer'
              style={{ borderColor: theme.palette.primary.main }}
              onClick={() => setIsExpanded(!isExpanded)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${theme.palette.primary.main}0D`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <i
                className={isExpanded ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'}
                color='text.primary'
                style={{
                  fontSize: '1.5rem',
                  transition: 'transform 0.3s ease'
                }}
              />
              <i className='ri-folder-shield-line' style={{ fontSize: '1.25rem', color: theme.palette.primary.main }} />
              <Typography className='font-medium' style={{ color: theme.palette.primary.main }}>
                Lista de Permisos
              </Typography>
              <Typography className='font-medium' color='text.primary'>
                ({permissionsList.length} {permissionsList.length === 1 ? 'permiso' : 'permisos'})
              </Typography>
            </div>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <div className='flex flex-col gap-2 mt-2'>
                {permissionsList.map((permission) => (
                  <div key={permission.id}>
                    <div
                      className='cursor-pointer'
                      onClick={() => onPermissionToggle(permission.id)}
                      style={{
                        padding: '12px 14px',
                        border: '1.5px solid',
                        borderColor: selectedPermissions.includes(permission.id) ? theme.palette.primary.main : '#E0E0E0',
                        borderRadius: '8px',
                        backgroundColor: selectedPermissions.includes(permission.id) ? `${theme.palette.primary.main}14` : 'white',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        minHeight: '60px'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedPermissions.includes(permission.id)) {
                          e.currentTarget.style.borderColor = theme.palette.primary.light
                          e.currentTarget.style.backgroundColor = `${theme.palette.primary.main}0A`
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedPermissions.includes(permission.id)) {
                          e.currentTarget.style.borderColor = '#E0E0E0'
                          e.currentTarget.style.backgroundColor = 'white'
                        }
                      }}
                    >
                      <Checkbox
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => onPermissionToggle(permission.id)}
                        size="small"
                        sx={{
                          padding: 0,
                          marginTop: '2px',
                          '& .MuiSvgIcon-root': { fontSize: 20 }
                        }}
                      />
                      <div className='flex-1'>
                        <Typography
                          variant='body2'
                          sx={{
                            fontWeight: selectedPermissions.includes(permission.id) ? 600 : 500,
                            color: selectedPermissions.includes(permission.id) ? 'primary.main' : 'text.primary',
                            fontSize: '0.875rem',
                            lineHeight: 1.4,
                            marginBottom: '4px'
                          }}
                        >
                          {permission.name}
                        </Typography>
                        {permission.description && (
                          <Typography
                            variant='caption'
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {permission.description}
                          </Typography>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Collapse>
          </div>
        )}
      </Grid>
    </Grid>
  )
}
