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
import AddEntitiesDrawer from './AddSubModulesDrawer'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { useSubModulesTable } from '../hooks/useSubModulesTable'
import SubModulesFilters from './SubModulesFilters'
import SkeletonTable from '@/components/skeletonTable'
import { usePermissions } from '@/contexts/permissionsContext'

const columnHelper = createColumnHelper()

const SubModulesListTable = ({
  modulesList,
  dictionary,
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
  fetchSubModulesData,
  selectedBranch,
  handleSelectFilterChange,
  debouncedSearch,
  changerViewer,
  viewModeToggle
}) => {
  const {
    subModulesPagination,
    loadingEntities,
    rowSelection,
    setRowSelection,
    filteredData,
    globalFilter,
    setGlobalFilter
  } = useSubModulesTable()

  const { hasPermission } = usePermissions()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: dictionary.modules.subModules?.components?.table?.name || 'Nombre',
        cell: ({ row }) => (
          <Typography color='text.primary' className='font-medium'>
            {row.original.name || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('translate', {
        header: dictionary.modules.subModules?.components?.table?.translate || 'Traducción',
        cell: ({ row }) => <Typography>{row.original.translate || 'N/A'}</Typography>
      }),
      columnHelper.accessor('Modules', {
        header: dictionary.modules.subModules?.components?.table?.module_id || 'Módulo',
        cell: ({ row }) => <Typography>{row.original.Modules?.name || 'N/A'}</Typography>
      }),
      columnHelper.accessor('icon', {
        header: 'Icono',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <i className={row.original.icon} style={{ fontSize: '20px' }} />
            <Typography className='text-xs'>{row.original.icon || 'N/A'}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('link', {
        header: dictionary.modules.subModules?.components?.table?.link || 'Enlace',
        cell: ({ row }) => <Typography className='text-xs'>{row.original.link || 'N/A'}</Typography>
      }),
      columnHelper.accessor('order', {
        header: dictionary.modules.subModules?.components?.table?.order || 'Orden',
        cell: ({ row }) => (
          <Typography className='text-center font-medium'>
            {row.original.order !== null && row.original.order !== undefined ? row.original.order : 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('status', {
        header: dictionary.modules.subModules?.components?.table?.status || 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.status ? 'Activo' : 'Inactivo'}
            color={row.original.status ? 'success' : 'error'}
            variant='tonal'
            size='small'
          />
        )
      }),
      columnHelper.accessor('Actions', {
        header: dictionary.modules.subModules?.components?.table?.actions || 'Acciones',
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
              size='medium'
              onClick={() => {
                ;(setCustomerUserOpen(!customerUserOpen), setCustomerUserData({ data: row.original, action: 'Update' }))
              }}
              disabled={!hasPermission('editar')}
              title='Editar Submódulo'
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
              size='medium'
              onClick={() => openDeleteDialog(row.original.id)}
              disabled={!hasPermission('eliminar')}
              title='Eliminar Submódulo'
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
    [customerUserOpen, setCustomerUserOpen, setCustomerUserData]
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      rowSelection,
      globalFilter,
      pagination: {
        pageIndex: valuesPagination.currentPage - 1, // React-table usa índice base 0
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
            <SubModulesFilters
              dictionary={dictionary}
              modulesList={modulesList}
              selectedBranch={selectedBranch}
              handleSelectFilterChange={handleSelectFilterChange}
              debouncedSearch={debouncedSearch}
              viewModeToggle={viewModeToggle}
              changerViewer={changerViewer}
              customerUserOpen={customerUserOpen}
              setCustomerUserOpen={setCustomerUserOpen}
              customerUserData={customerUserData}
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
          {loadingEntities ? (
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
        count={subModulesPagination.totalRows}
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

      <AddEntitiesDrawer
        open={customerUserOpen}
        customerUserData={customerUserData}
        handleClose={() => setCustomerUserOpen(!customerUserOpen)}
        dictionary={dictionary}
        fetchSubModulesData={fetchSubModulesData}
        modulesList={modulesList}
      />

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDelete}
        moduleName={'Submódulo'}
      />
    </Card>
  )
}

export default SubModulesListTable
