import { useMemo } from 'react'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Chip, TablePagination, IconButton, Grid, Box } from '@mui/material'
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import tableStyles from '@core/styles/table.module.css'
import AddPermissionsDrawer from './AddPermissionsDrawer'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { usePermissionsTable } from '../hooks/usePermissionsTable'
import SkeletonTable from '@/components/skeletonTable'
import PermissionsFilters from './PermissionsFilters'
import { usePermissions } from '@/contexts/permissionsContext'

const columnHelper = createColumnHelper()

const PermissionsListTable = ({
  dictionary,
  permissionsPagination,
  valuesPagination,
  setValuesPagination,
  customerUserOpen,
  setCustomerUserOpen,
  setCustomerUserData,
  customerUserData,
  handleDelete,
  openDeleteDialog,
  setOpenConfirmDialog,
  openConfirmDialog,
  fetchPermissionsData,
  debouncedSearch,
  changerViewer,
  viewModeToggle
}) => {
  const {
    loadingPermissions,
    rowSelection,
    setRowSelection,
    filteredData,
    globalFilter,
    setGlobalFilter,
    truncateSmart
  } = usePermissionsTable()

  const { hasPermission } = usePermissions()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: dictionary?.permissions?.permissions?.components?.table?.name || 'Nombre',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {truncateSmart(row.original.name, 3, 20)}
          </Typography>
        )
      }),
      columnHelper.accessor('description', {
        header: dictionary?.permissions?.permissions?.components?.table?.description || 'Descripción',
        cell: ({ row }) => <Typography>{row.original.description || 'N/A'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: dictionary?.permissions?.permissions?.components?.table?.status || 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.status ? 'Activo' : 'Inactivo'}
            color={row.original.status ? 'success' : 'error'}
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('Actions', {
        header: dictionary?.permissions?.permissions?.components?.table?.actions || 'Acciones',
        cell: ({ row }) => (
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            gap={1}
            width='100%'
            py={1}
            sx={{
              margin: '0 auto',
              textAlign: 'center'
            }}
          >
            <IconButton
              size='small'
              disabled={!hasPermission('editar')}
              onClick={() => {
                ;(setCustomerUserOpen(!customerUserOpen), setCustomerUserData({ data: row.original, action: 'Update' }))
              }}
              title='Editar Permiso'
              className={``}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(32, 146, 236, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <i className='ri-edit-box-line' style={{ color: '#2092EC', fontSize: '24px' }} />
            </IconButton>
            <IconButton
              size='small'
              disabled={!hasPermission('eliminar')}
              onClick={() => openDeleteDialog(row.original.id)}
              title='Eliminar Permiso'
              className={``}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <i className='ri-delete-bin-6-line' style={{ color: '#F44336', fontSize: '24px' }} />
            </IconButton>
          </Box>
        )
      })
    ],
    [dictionary]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: valuesPagination.currentPage,
        pageSize: valuesPagination.pageSize
      }
    },
    manualPagination: true,
    pageCount: valuesPagination.totalPages,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  return (
    <Card>
      <Grid item xs={12} sx={{ p: 5, pt: 6 }}>
        <Grid container alignItems='center' justifyContent='space-between'>
          <Grid item xs={12}>
            <PermissionsFilters
              dictionary={dictionary}
              debouncedSearch={debouncedSearch}
              viewModeToggle={viewModeToggle}
              changerViewer={changerViewer}
              customerUserOpen={customerUserOpen}
              setCustomerUserOpen={setCustomerUserOpen}
              setCustomerUserData={setCustomerUserData}
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
                  <th key={header.id} style={header.column.id === 'Actions' ? { textAlign: 'center' } : {}}>
                    <div
                      className={classnames({
                        'flex items-center': header.column.getIsSorted(),
                        'cursor-pointer select-none': header.column.getCanSort(),
                        'justify-center': header.column.id === 'Actions'
                      })}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <i className='ri-arrow-up-s-line text-xl' />,
                        desc: <i className='ri-arrow-down-s-line text-xl' />
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {loadingPermissions ? (
            <tbody>
              <SkeletonTable rowsNum={valuesPagination.pageSize} colNum={table.getVisibleFlatColumns().length} />
            </tbody>
          ) : table.getFilteredRowModel().rows.length > 0 ? (
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={cell.column.id === 'Actions' ? { textAlign: 'center' } : {}}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  No hay datos disponibles
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[8, 15, 20]}
        component='div'
        className='border-bs'
        count={permissionsPagination.totalRows}
        rowsPerPage={valuesPagination.pageSize}
        page={valuesPagination.currentPage - 1}
        SelectProps={{
          inputProps: { 'aria-label': 'filas por página' }
        }}
        onPageChange={(_, page) =>
          setValuesPagination(prev => ({
            ...prev,
            currentPage: page + 1 //sumamos 1 para mantener consistente
          }))
        }
        onRowsPerPageChange={e =>
          setValuesPagination(prev => ({
            ...prev,
            pageSize: Number(e.target.value),
            currentPage: 1
          }))
        }
      />

      <AddPermissionsDrawer
        open={customerUserOpen}
        customerUserData={customerUserData}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        dictionary={dictionary}
        fetchPermissionsData={fetchPermissionsData}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDelete}
        moduleName={'Permisos'}
      />
    </Card>
  )
}

export default PermissionsListTable
