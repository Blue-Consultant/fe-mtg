'use client'
import { useState, useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'

import { Chip, TablePagination, IconButton, Grid, Collapse, Box } from '@mui/material'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel
} from '@tanstack/react-table'

import SkeletonTable from '@/components/skeletonTable'
import CustomAvatar from '@core/components/mui/Avatar'
import { getInitials } from '@/utils/getInitials'
import tableStyles from '@core/styles/table.module.css'
import RolesFilters from './filters/RolesFilter'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'

import { usePermissions } from '@/contexts/permissionsContext'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({
    itemRank
  })

  return itemRank.passed
}

// Column Definitions
const columnHelper = createColumnHelper()

const RolesTable = ({ controller, rolesReducer, dictionary = {} }) => {
  const {
    setShowform,
    setDataProp,
    handleSearchChange,
    viewModeToggle,
    changerViewer,
    deleteRoles,
    pagination,
    handlePageChange,
    handlePageSizeChange
  } = controller

  const pageSize = pagination?.pageSize ?? 10
  const currentPage = pagination?.currentPage ?? 1

  const { rows = [], totalRows = 0, totalPages = 0 } = rolesReducer?.rolesPagination || {}
  const branchesOwner = rolesReducer?.branchesOwnerRoles || []

  // States
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [grouping, setGrouping] = useState(['branch_id']) // Agrupar por sucursal por defecto
  const [expanded, setExpanded] = useState(true) // true = todo expandido
  const { hasPermission } = usePermissions()

  const branchNameMap = useMemo(() => {
    const map = new Map()

    branchesOwner.forEach(branch => {
      const branchData = branch?.Branches || branch

      if (branchData?.id) {
        map.set(Number(branchData.id), branchData.name || '')
      }
    })

    return map
  }, [branchesOwner])

  const branchHeaderLabel = dictionary?.modules?.roles?.components?.table?.branch || 'Sucursal'
  const branchFallbackLabel = dictionary?.modules?.roles?.components?.table?.noBranch || 'Sin sucursal'

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: dictionary?.modules?.roles?.components?.table?.name || 'Rol',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {getAvatar({ avatar: null, fullName: row.original.name })}
            <div className='flex flex-col'>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
              <Typography variant='body2'>{row.original.name}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('description', {
        header: dictionary?.modules?.roles?.components?.table?.description || 'Descripción',
        cell: ({ row }) => <Typography>{row.original.description ? row.original.description : '-'}</Typography>
      }),
      columnHelper.accessor('branch_id', {
        header: branchHeaderLabel,
        cell: ({ row, getValue }) => {
          // Si es una fila agrupada, mostrar el nombre de la sucursal con icono expandible
          if (row.getIsGrouped()) {
            return (
              <Box
                className='flex items-center gap-2 cursor-pointer font-semibold'
                onClick={row.getToggleExpandedHandler()}
              >
                <i className={row.getIsExpanded() ? 'ri-arrow-down-s-line' : 'ri-arrow-right-s-line'} />
                {/* <i className='ri-building-line text-primary' /> */}
                <Typography fontWeight={600}>{branchNameMap.get(Number(getValue())) || branchFallbackLabel}</Typography>
                <Chip label={`${row.subRows.length} roles`} size='small' color='primary' variant='outlined' />
              </Box>
            )
          }

          // Fila normal
          return <Typography>{branchNameMap.get(Number(row.original.branch_id)) || branchFallbackLabel}</Typography>
        },
        enableGrouping: true
      }),
      columnHelper.accessor('created_at', {
        header: dictionary?.modules?.roles?.components?.table?.status || 'Estado',
        cell: ({ row }) => (
          <div className='font-medium' color='text.primary'>
            {
              <Chip
                label={`${row.original.status ? dictionary?.modules?.roles?.components?.table?.active || 'Activo' : dictionary?.modules?.roles?.components?.table?.inactive || 'Inactivo'}`}
                color={`${row.original.status ? 'success' : 'warning'}`}
                variant='tonal'
              />
            }
          </div>
        )
      }),
      columnHelper.accessor('id', {
        header: dictionary?.modules?.roles?.components?.table?.actions || 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton className={``} onClick={() => editRoles(row.original)} disabled={!hasPermission('editar')}>
              <i className='ri-pencil-fill text-secondary' style={{ color: 'rgba(255, 214, 1, 0.6)' }} />
            </IconButton>
            <IconButton
              className={``}
              onClick={() => openDeleteDialog(row.original)}
              disabled={!hasPermission('eliminar')}
            >
              <i className='ri-delete-bin-line' style={{ color: 'rgba(255, 0, 0, 0.6)' }}></i>
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [branchFallbackLabel, branchHeaderLabel, branchNameMap, dictionary, hasPermission]
  )

  const table = useReactTable({
    data: rows,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter,
      grouping,
      expanded
    },
    enableRowSelection: true,
    enableGrouping: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const editRoles = data => {
    setShowform(true)
    setDataProp({
      action: 'edit',
      data: data
    })
  }

  const openDeleteDialog = role => {
    setSelectedRole(role)
    setOpenConfirmDialog(true)
  }

  const handleDelete = async isConfirmed => {
    if (isConfirmed && selectedRole) {
      try {
        await deleteRoles(selectedRole)
      } catch (error) {
        console.error('Error al eliminar rol:', error)
      } finally {
        setOpenConfirmDialog(false)
        setSelectedRole(null)
      }
    } else {
      setOpenConfirmDialog(false)
      setSelectedRole(null)
    }
  }

  const getAvatar = params => {
    const { avatar, fullName } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(fullName)}
        </CustomAvatar>
      )
    }
  }

  return (
    <Card>
      <Grid item xs={12} sx={{ p: 5, pt: 6 }}>
        <Grid container alignItems='center' justifyContent='space-between'>
          <Grid item xs={12}>
            <RolesFilters
              dictionary={dictionary}
              onSearchChange={handleSearchChange}
              viewModeToggle={viewModeToggle}
              changerViewer={changerViewer}
              setShowform={setShowform}
              setDataProp={setDataProp}
            />
          </Grid>
        </Grid>
      </Grid>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {!controller.loading ? (
            rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {dictionary.modules.roles?.components?.table?.no_data || 'No hay datos disponibles'}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => {
                  // Si es una fila agrupada (header de grupo)
                  if (row.getIsGrouped()) {
                    return (
                      <tr
                        key={row.id}
                        className='bg-actionHover'
                        style={{ backgroundColor: 'rgba(99, 99, 99, 0.021)' }}
                      >
                        <td colSpan={columns.length}>
                          {flexRender(
                            row.getVisibleCells().find(cell => cell.column.id === 'branch_id')?.column.columnDef.cell,
                            row
                              .getVisibleCells()
                              .find(cell => cell.column.id === 'branch_id')
                              ?.getContext()
                          )}
                        </td>
                      </tr>
                    )
                  }

                  // Fila normal (hijo de un grupo)
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => {
                        // No mostrar la columna branch_id en filas hijas (ya está en el header)
                        if (cell.column.id === 'branch_id') {
                          return <td key={cell.id}></td>
                        }

                        return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      })}
                    </tr>
                  )
                })}
              </tbody>
            )
          ) : (
            <tbody>
              <SkeletonTable rowsNum={6} colNum={table.getVisibleFlatColumns().length} />
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={totalRows}
        rowsPerPage={pageSize}
        page={Math.max(0, currentPage - 1)}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          handlePageChange(page + 1)
        }}
        onRowsPerPageChange={e => handlePageSizeChange(Number(e.target.value))}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDelete}
        moduleName={'Roles'}
      />
    </Card>
  )
}

export default RolesTable
