import { useMemo, useState, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { TablePagination, IconButton, Grid, Box, Collapse } from '@mui/material'

import tableStyles from '@core/styles/table.module.css'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useRoleLazyLoad } from '../hooks/useRoleLazyLoad'
import SkeletonTable from '@/components/skeletonTable'
import RelationForm from './RelationForm'
import RelationFilters from './RelationFilters'
import { usePermissions } from '@/contexts/permissionsContext'

const RelationTable = ({
  branchList,
  rolesList,
  modulesList,
  dictionary,
  handleDelete,
  openDeleteDialog,
  setOpenConfirmDialog,
  openConfirmDialog,
  selectedBranch,
  setSelectedBranch,
  selectedRole,
  setSelectedRole,
  loading
}) => {
  const [openRoleDialog, setOpenRoleDialog] = useState(false)

  const {
    roleDataCache,
    loadingRoles,
    rolePagination,
    loadRoleData,
    handleRolePageChange,
    handleRolePageSizeChange,
    initializeRolePagination,
    clearRoleCache
  } = useRoleLazyLoad()

  // Función mejorada de eliminación que limpia el caché
  const handleDeleteWithCacheUpdate = async isConfirmed => {
    await handleDelete(isConfirmed)

    if (isConfirmed) {
      clearRoleCache()

      if (expandedRoleId) {
        const pagination = rolePagination[expandedRoleId] || { currentPage: 0, pageSize: 8 }

        await loadRoleData(expandedRoleId, pagination.currentPage + 1, pagination.pageSize)
      }
    }
  }

  const { hasPermission } = usePermissions()

  const [expandedRoleId, setExpandedRoleId] = useState(null)

  const toggleRoleExpansion = async roleId => {
    if (expandedRoleId === roleId) {
      setExpandedRoleId(null)

      return
    }

    setExpandedRoleId(roleId)
    initializeRolePagination(roleId)

    if (!roleDataCache[roleId]) {
      await loadRoleData(roleId, 1, 8)
    } else {
      // Si ya hay datos en caché, recargar para asegurar que estén actualizados
      await loadRoleData(roleId, 1, 8)
    }
  }

  // Función mejorada para cerrar el diálogo y limpiar caché
  const handleCloseRoleDialog = useCallback(
    (shouldReload = false) => {
      setOpenRoleDialog(false)

      // Limpiar caché y recargar si se creó/actualizó algo
      if (shouldReload) {
        clearRoleCache()

        if (expandedRoleId) {
          const pagination = rolePagination[expandedRoleId] || { currentPage: 0, pageSize: 8 }

          loadRoleData(expandedRoleId, pagination.currentPage + 1, pagination.pageSize)
        }
      }
    },
    [clearRoleCache, expandedRoleId, rolePagination, loadRoleData]
  )

  const groupedDataByRole = useMemo(() => {
    return (rolesList || []).map(role => ({
      roleId: role.id,
      roleName: role.name,
      roleTranslate: role.description || '',
      totalRelations: 0
    }))
  }, [rolesList])

  useEffect(() => {
    const reloadExpandedRole = async () => {
      if (expandedRoleId && roleDataCache[expandedRoleId]) {
        const pagination = rolePagination[expandedRoleId] || { currentPage: 0, pageSize: 8 }

        clearRoleCache(expandedRoleId)
        await loadRoleData(expandedRoleId, pagination.currentPage + 1, pagination.pageSize)
      }
    }

    reloadExpandedRole()
  }, [expandedRoleId])

  const getExpandedRoleData = roleId => {
    return roleDataCache[roleId]?.rows || []
  }

  const getExpandedRolePaginationInfo = roleId => {
    return roleDataCache[roleId] || { totalRows: 0, currentPage: 1, totalPages: 1 }
  }

  return (
    <Card>
      <Grid item xs={12} sx={{ p: 5, pt: 6 }}>
        <RelationFilters dictionary={dictionary} onOpenRoleDialog={() => setOpenRoleDialog(true)} />
      </Grid>
      <div className='overflow-x-auto'>
        {loading ? (
          <Box className='p-4'>
            <table className={tableStyles.table}>
              <tbody>
                <SkeletonTable rowsNum={8} colNum={6} />
              </tbody>
            </table>
          </Box>
        ) : rolesList.length === 0 ? (
          <Box className='p-8 text-center'>
            <Typography variant='h6' color='text.secondary'>
              No hay datos disponibles
            </Typography>
          </Box>
        ) : (
          <div className='space-y-2 p-2'>
            {groupedDataByRole.map(roleGroup => {
              const isExpanded = expandedRoleId === roleGroup.roleId
              const isLoading = loadingRoles[roleGroup.roleId]
              const roleData = getExpandedRoleData(roleGroup.roleId)
              const paginationInfo = getExpandedRolePaginationInfo(roleGroup.roleId)

              return (
                <div key={roleGroup.roleId} className=''>
                  <div
                    className={`p-3 flex items-center justify-between bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors`}
                    onClick={() => toggleRoleExpansion(roleGroup.roleId)}
                  >
                    <div className='flex items-center gap-4'>
                      <IconButton size='small'>
                        <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line`} />
                      </IconButton>
                      <div>
                        <Typography variant='h6' className='font-medium'>
                          {roleGroup.roleName}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {roleGroup.roleTranslate}
                          {/* • {paginationInfo.totalRows || roleGroup.totalRelations} relación(es) */}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  <Collapse in={isExpanded}>
                    <div className='p-4'>
                      {isLoading ? (
                        <Box className='p-4'>
                          <table className={tableStyles.table}>
                            <tbody>
                              <SkeletonTable rowsNum={8} colNum={6} />
                            </tbody>
                          </table>
                        </Box>
                      ) : roleData.length === 0 ? (
                        <Box className='p-8 text-center'>
                          <Typography variant='body1' color='text.secondary'>
                            No hay relaciones para este rol
                          </Typography>
                        </Box>
                      ) : (
                        <>
                          <table className={tableStyles.table}>
                            <thead>
                              <tr>
                                <th>
                                  {dictionary.modules?.rolesModulesSubmodules?.components?.table?.module_id || 'Módulo'}
                                </th>
                                <th>
                                  {dictionary.modules?.rolesModulesSubmodules?.components?.table?.submodule_id ||
                                    'Submódulo'}
                                </th>
                                <th>
                                  {dictionary.modules?.rolesModulesSubmodules?.components?.table?.icon || 'Icono'}
                                </th>
                                <th>
                                  {dictionary.modules?.rolesModulesSubmodules?.components?.table?.link || 'Enlace'}
                                </th>
                                <th>
                                  {dictionary.modules?.rolesModulesSubmodules?.components?.table?.order || 'Orden'}
                                </th>
                                <th className='text-center'>
                                  {dictionary.modules?.rolesModulesSubmodules?.components?.table?.actions || 'Acciones'}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {roleData.map(relation => (
                                <tr key={relation.permission_id}>
                                  <td>
                                    <div>
                                      <Typography color='text.primary' className='font-medium'>
                                        {relation.module_name || 'N/A'}
                                      </Typography>
                                      <Typography variant='caption' color='textSecondary'>
                                        {relation.module_translate || ''}
                                      </Typography>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <Typography color='text.primary' className='font-medium'>
                                        {relation.submodule_name || 'N/A'}
                                      </Typography>
                                      <Typography variant='caption' color='textSecondary'>
                                        {relation.submodule_translate || ''}
                                      </Typography>
                                    </div>
                                  </td>
                                  <td>
                                    <div className='flex items-center gap-2'>
                                      <i className={relation.submodule_icon} style={{ fontSize: '20px' }} />
                                      <Typography className='text-xs'>{relation.submodule_icon || 'N/A'}</Typography>
                                    </div>
                                  </td>
                                  <td>
                                    <Typography className='text-xs' sx={{ fontFamily: 'monospace' }}>
                                      {relation.submodule_link || 'N/A'}
                                    </Typography>
                                  </td>
                                  <td>
                                    <Typography className='text-center font-medium'>
                                      {relation.submodule_order !== null && relation.submodule_order !== undefined
                                        ? relation.submodule_order
                                        : 'N/A'}
                                    </Typography>
                                  </td>
                                  <td>
                                    <Box
                                      display='flex'
                                      justifyContent='center'
                                      alignItems='center'
                                      gap={1}
                                      width='100%'
                                      py={1}
                                    >
                                      <IconButton
                                        size='small'
                                        disabled={!hasPermission('eliminar')}
                                        onClick={() => openDeleteDialog(relation.permission_id)}
                                        title='Eliminar Relación de Permisos'
                                        sx={{
                                          '&:hover': {
                                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                            transform: 'scale(1.05)'
                                          },
                                          transition: 'all 0.2s ease-in-out'
                                        }}
                                      >
                                        <i
                                          className='ri-delete-bin-6-line'
                                          style={{ color: '#F44336', fontSize: '24px' }}
                                        />
                                      </IconButton>
                                    </Box>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <TablePagination
                            rowsPerPageOptions={[8, 15, 20]}
                            component='div'
                            count={paginationInfo.totalRows}
                            rowsPerPage={rolePagination[roleGroup.roleId]?.pageSize || 8}
                            page={paginationInfo.currentPage - 1 || 0}
                            SelectProps={{ inputProps: { 'aria-label': 'filas por página' } }}
                            onPageChange={(_, page) => handleRolePageChange(roleGroup.roleId, page)}
                            onRowsPerPageChange={e =>
                              handleRolePageSizeChange(roleGroup.roleId, Number(e.target.value))
                            }
                            labelRowsPerPage='Filas por página:'
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                          />
                        </>
                      )}
                    </div>
                  </Collapse>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDeleteWithCacheUpdate}
        moduleName={'Permiso'}
      />

      <RelationForm
        open={openRoleDialog}
        setOpen={setOpenRoleDialog}
        dictionary={dictionary}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onSuccessCallback={() => {
          clearRoleCache()

          if (expandedRoleId) {
            const pagination = rolePagination[expandedRoleId] || { currentPage: 0, pageSize: 8 }

            loadRoleData(expandedRoleId, pagination.currentPage + 1, pagination.pageSize)
          }
        }}
      />
    </Card>
  )
}

export default RelationTable
