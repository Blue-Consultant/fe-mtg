'use client'

import { useState, useEffect, useMemo } from 'react'
import { Chip, IconButton, TablePagination } from '@mui/material'
import Typography from '@mui/material/Typography'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

import CustomAvatar from '@core/components/mui/Avatar'
import ReactCountryFlag from 'react-country-flag'
import UserTableSkeleton from './UserTableSkeleton'
import { getInitials } from '@/utils/getInitials'
import tableStyles from '@core/styles/table.module.css'
import { usePermissions } from '@/contexts/permissionsContext'

const NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT

function getAvatarSrcValidator(img) {
  const allowedAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png']
  if (img?.includes('APP_MTG')) {
    return `${NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT}/${img}`
  } else if (allowedAvatars.includes(img)) {
    return `/images/avatars/${img}`
  } else if (img) {
    return img
  } else {
    return '/images/avatars/1.png'
  }
}

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

const columnHelper = createColumnHelper()

const UserTable = ({ controller, usersReducer }) => {
  const {
    isLoading,
    pagination,
    memoizedDictionary,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    onDeleteAction,
    setShowform,
    setDataProp,
    activeTab = 0,
  } = controller

  const { rows = [], currentPage = 1, totalRows = 0, totalPages = 1 } = usersReducer?.usersPagination || {}
  const { hasPermission } = usePermissions()

  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  // Inicializar vacío para evitar error de columna inexistente
  // El sorting real se hace en el backend con pagination.orderBy
  const [sorting, setSorting] = useState([])

  useEffect(() => {
    if (sorting.length > 0) {
      const { id, desc } = sorting[0]
      handleSortChange(id, desc ? 'desc' : 'asc')
    }
  }, [sorting, handleSortChange])

  const columns = useMemo(
    () => [
      columnHelper.accessor('Users.first_name', {
        header: memoizedDictionary.modules.users.components.table.name,
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            {getAvatar({
              avatar: getAvatarSrcValidator(row.original?.Users.avatar),
              customer: `${row.original.Users.first_name && row.original.Users.last_name
                ? row.original.Users.first_name + ' ' + row.original.Users.last_name
                : row.original.Users.first_name || row.original.Users.last_name
                }`
            })}
            <div className='flex flex-col items-start'>
              <Typography color='text.primary' className='font-medium hover:text-primary'>
                {`${row.original.Users.first_name} ${row.original.Users.last_name ? row.original.Users.last_name : ''}`}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('Users.email', {
        header: memoizedDictionary.modules.users.components.table.email,
        cell: ({ row }) => <Typography color='text.primary'>{row.original.Users.email}</Typography>,
        enableSorting: true
      }),
      columnHelper.accessor('Users.phone_number', {
        header: memoizedDictionary.modules.users.components.table.phone,
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Typography>{row.original.Users.phone_number ? row.original.Users.phone_number : 'N/A'}</Typography>
          </div>
        )
      }),
      columnHelper.accessor('Users.country', {
        header: memoizedDictionary.modules.users.components.table.country,
        cell: ({ row }) => {
          // Mapeo de nombres de países a códigos ISO
          const countryCodeMap = {
            'perú': 'PE',
            'peru': 'PE',
            'méxico': 'MX',
            'mexico': 'MX',
            'colombia': 'CO',
            'argentina': 'AR',
            'chile': 'CL',
            'ecuador': 'EC',
            'bolivia': 'BO',
            'paraguay': 'PY',
            'uruguay': 'UY',
            'venezuela': 'VE',
            'españa': 'ES',
            'espana': 'ES',
            'estados unidos': 'US',
            'usa': 'US'
          }

          const countryName = row.original.Users.country || ''
          const normalizedName = countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          const countryCode = countryCodeMap[normalizedName] || countryCodeMap[countryName.toLowerCase()]

          return (
            <div className='flex items-center gap-2'>
              {countryCode && (
                <ReactCountryFlag
                  countryCode={countryCode}
                  svg
                  style={{ width: 22, height: 16, borderRadius: 2 }}
                />
              )}
              <Typography>{countryName || 'N/A'}</Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('Branches.name', {
        header: memoizedDictionary.modules.users.components.table.branch,
        cell: ({ row }) => <Typography>{row.original.Branches?.name ? row.original.Branches?.name : 'N/A'}</Typography>
      }),
      columnHelper.accessor('Roles.name', {
        header: memoizedDictionary.modules.users.components.table.roles,
        cell: ({ row }) => <Typography>{row.original.Roles?.name ? row.original.Roles.name : 'N/A'}</Typography>
      }),
      columnHelper.accessor('Status_conditions.name', {
        header: memoizedDictionary.modules.users.components.table.status,
        cell: ({ row }) => (
          <div className='font-medium' color='text.primary'>
            <Chip
              label={`${row.original.Status_conditions.name ? row.original.Status_conditions.name : ''}`}
              color={`${row.original.Status_conditions.name === 'Pendiente' ? 'warning' : 'success'}`}
              variant='tonal'
            />
          </div>
        )
      }),
      columnHelper.accessor('Actions', {
        header: memoizedDictionary.modules.users.components.table.actions,
        cell: ({ row }) => (
          <div>
            <IconButton
              className={``}
              onClick={() => {
                setDataProp({ action: 'edit', data: row.original })
                setShowform(true)
              }}
              disabled={!hasPermission('editar')}
            >
              <i className='ri-pencil-fill text-secondary' style={{ color: 'rgba(255, 214, 1, 0.6)' }} />
            </IconButton>

            <IconButton
              onClick={() =>
                onDeleteAction(
                  row.original.Branches?.id || null,
                  row.original.Users.id,
                  row.original.Roles?.id || null,
                  'Delete',
                  row.original.Status_conditions?.id || null
                )
              }
              disabled={!hasPermission('eliminar') || activeTab === 1}
            >
              <i className='ri-delete-bin-line' style={{ color: 'rgba(255, 0, 0, 0.6)' }}></i>
            </IconButton>
          </div>
        )
      })
    ],
    [rows, memoizedDictionary, hasPermission, setShowform, setDataProp, onDeleteAction]
  )

  const table = useReactTable({
    data: rows,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    manualSorting: true,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    initialState: {},
    state: {
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: pagination.pageSize
      },
      rowSelection,
      globalFilter,
      sorting
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting
  })

  const getAvatar = params => {
    const { avatar, customer } = params

    if (avatar) {
      return <CustomAvatar src={avatar} skin='light' size={34} />
    } else {
      return (
        <CustomAvatar skin='light' size={34}>
          {getInitials(customer)}
        </CustomAvatar>
      )
    }
  }

  return (
    <>
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
          {isLoading ? (
            <tbody>
              <UserTableSkeleton rowsNum={table.getFilteredRowModel().rows.length || 4} colNum={table.getVisibleFlatColumns().length} />
            </tbody>
          ) : rows.length === 0 && !isLoading ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  {memoizedDictionary.common.nothereData || 'No data available'}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => {
                  return (
                    <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  )
                })}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={totalRows}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        onPageChange={(_, newPage) => handlePageChange(newPage + 1)}
        onRowsPerPageChange={e => handlePageSizeChange(+e.target.value)}
      />
    </>
  )
}

export default UserTable

