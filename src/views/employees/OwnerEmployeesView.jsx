'use client'

 import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TablePagination
} from '@mui/material'

import { motion } from 'framer-motion'
import classnames from 'classnames'

import CustomAvatar from '@core/components/mui/Avatar'
import tableStyles from '@core/styles/table.module.css'
import { getInitials } from '@/utils/getInitials'
import UserTableSkeleton from '@/views/users/components/UserTableSkeleton'
import CanAccess from '@/components/permissions/CanAccess'

import { getOwnerEmployees } from './api'
import { listBranchesByOwner } from '@/views/branches/api'
import { createStaffUserAction } from '@/app/server/userActions'
import { notificationSuccesMessage, notificationErrorMessage } from '@/components/ToastNotification'
import { useSelector } from 'react-redux'

const OwnerEmployeesView = ({ dictionary }) => {
  const memoizedDictionary = useMemo(() => dictionary, [JSON.stringify(dictionary)])
  const d = memoizedDictionary?.modules?.empleados ?? {}
  const usuario = useSelector(state => state.loginReducer.user)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState([])
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    dni: '',
    venue_id: ''
  })

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [emp, branchData] = await Promise.all([getOwnerEmployees(), listBranchesByOwner(usuario?.id)])
      setRows(emp)
      if (Array.isArray(branchData)) {
        const mapped = branchData
          .map(item => {
            const venue = item.SportsVenue || item.Branches
            if (!venue) return null
            return { id: venue.id, name: venue.name, company_name: venue.company_name }
          })
          .filter(Boolean)
          .filter((b, i, self) => i === self.findIndex(x => x.id === b.id))
        setBranches(mapped)
      } else {
        setBranches([])
      }
    } catch (e) {
      console.error(e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [usuario?.id])

  useEffect(() => {
    if (!usuario?.id) return
    load()
  }, [usuario?.id, load])

  useEffect(() => {
    setPage(0)
  }, [searchValue])

  const filteredRows = useMemo(() => {
    const q = searchValue.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => {
      const name = [r.first_name, r.last_name].filter(Boolean).join(' ').toLowerCase()
      const venuesStr = (r.venues || [])
        .map(v => `${v.name} ${v.company_name || ''}`.toLowerCase())
        .join(' ')
      return name.includes(q) || (r.email || '').toLowerCase().includes(q) || venuesStr.includes(q)
    })
  }, [rows, searchValue])

  const paginatedRows = useMemo(() => {
    const start = page * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, page, pageSize])

  const totalFiltered = filteredRows.length
  const colCount = 3

  useEffect(() => {
    const max = Math.max(0, Math.ceil(totalFiltered / pageSize) - 1)
    setPage(p => (p > max ? max : p))
  }, [totalFiltered, pageSize])

  const handleSubmit = async () => {
    if (!form.first_name?.trim() || !form.email?.trim() || !form.password || !form.dni?.trim() || !form.venue_id) {
      notificationErrorMessage(memoizedDictionary?.rules?.required ?? 'Completa los campos obligatorios')
      return
    }
    try {
      setSubmitting(true)
      const fd = new FormData()
      fd.append('first_name', form.first_name.trim())
      fd.append('last_name', (form.last_name || '').trim())
      fd.append('email', form.email.trim())
      fd.append('password', form.password)
      fd.append('dni', form.dni.trim())
      fd.append('venue_id', String(form.venue_id))
      fd.append('assign_employee_role', 'true')
      const res = await createStaffUserAction(fd)
      if (res.success) {
        notificationSuccesMessage(res.message)
        setOpen(false)
        setForm({ first_name: '', last_name: '', email: '', password: '', dni: '', venue_id: '' })
        await load()
      } else {
        notificationErrorMessage(res.error || 'Error')
      }
    } catch (e) {
      notificationErrorMessage(e.message || 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = row =>
    [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email || '—'

  return (
    <div>
      <motion.div
        key='empleados-table'
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ duration: 0.1 }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardContent className='flex justify-between flex-col gap-4 items-start sm:flex-row sm:items-center'>
                <div>
                  <Typography variant='h4' className='mbe-1'>
                    {d.title ?? 'Empleados'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {d.subtitle ?? ''}
                  </Typography>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    variant='outlined'
                    color='secondary'
                    startIcon={<i className='ri-refresh-line' />}
                    onClick={() => load()}
                    disabled={loading}
                  >
                    {d.refresh ?? 'Actualizar'}
                  </Button>
                  <CanAccess permission='crear'>
                    <Button
                      startIcon={<i className='ri-add-line' />}
                      variant='contained'
                      onClick={() => setOpen(true)}
                    >
                      {d.addEmployee ?? memoizedDictionary?.common?.add ?? 'Registrar'}
                    </Button>
                  </CanAccess>

                  <TextField
                    placeholder={memoizedDictionary?.common?.search ?? 'Buscar'}
                    size='small'
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    className='sm:is-[350px] max-sm:flex-1'
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <i className='ri-search-line text-textSecondary' />
                        </InputAdornment>
                      )
                    }}
                  />
                </div>
              </CardContent>

              <div className='overflow-x-auto'>
                <table className={tableStyles.table}>
                  <thead>
                    <tr>
                      <th>{d.tableName ?? 'Nombre'}</th>
                      <th>{d.tableEmail ?? 'Correo'}</th>
                      <th>{d.tableVenues ?? 'Sucursales'}</th>
                    </tr>
                  </thead>
                  {loading ? (
                    <tbody>
                      <UserTableSkeleton rowsNum={pageSize > 10 ? 10 : pageSize} colNum={colCount} />
                    </tbody>
                  ) : totalFiltered === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={colCount} className='text-center'>
                          {rows.length === 0
                            ? d.empty ?? memoizedDictionary?.common?.nothereData
                            : d.noSearchResults ?? memoizedDictionary?.common?.nothereData}
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {paginatedRows.map(row => (
                        <tr key={row.id} className={classnames({ selected: false })}>
                          <td>
                            <div className='flex items-center gap-3'>
                              <CustomAvatar skin='light' size={34}>
                                {getInitials(displayName(row))}
                              </CustomAvatar>
                              <Typography color='text.primary' className='font-medium'>
                                {displayName(row)}
                              </Typography>
                            </div>
                          </td>
                          <td>
                            <Typography color='text.primary'>{row.email}</Typography>
                          </td>
                          <td>
                            <div className='flex flex-wrap gap-1'>
                              {(row.venues || []).map(v => (
                                <Chip
                                  key={v.id}
                                  size='small'
                                  label={v.company_name ? `${v.name} — ${v.company_name}` : v.name}
                                  color='primary'
                                  variant='tonal'
                                />
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>

              <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component='div'
                className='border-bs'
                count={totalFiltered}
                page={loading ? 0 : page}
                rowsPerPage={pageSize}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={e => {
                  setPageSize(+e.target.value)
                  setPage(0)
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      <Dialog open={open} onClose={() => !submitting && setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{d.dialogTitle ?? 'Nuevo empleado'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant='caption' color='text.secondary'>
            {d.hint ?? ''}
          </Typography>
          <TextField
            label={d.firstName ?? 'Nombre'}
            value={form.first_name}
            onChange={e => setForm(s => ({ ...s, first_name: e.target.value }))}
            size='small'
            fullWidth
            required
          />
          <TextField
            label={d.lastName ?? 'Apellido'}
            value={form.last_name}
            onChange={e => setForm(s => ({ ...s, last_name: e.target.value }))}
            size='small'
            fullWidth
          />
          <TextField
            label={d.email ?? 'Correo'}
            type='email'
            value={form.email}
            onChange={e => setForm(s => ({ ...s, email: e.target.value }))}
            size='small'
            fullWidth
            required
          />
          <TextField
            label={d.password ?? 'Contraseña'}
            type='password'
            value={form.password}
            onChange={e => setForm(s => ({ ...s, password: e.target.value }))}
            size='small'
            fullWidth
            required
          />
          <TextField
            label={d.dni ?? 'DNI'}
            value={form.dni}
            onChange={e => setForm(s => ({ ...s, dni: e.target.value }))}
            size='small'
            fullWidth
            required
          />
          <TextField
            select
            label={d.venue ?? 'Sucursal'}
            value={form.venue_id}
            onChange={e => setForm(s => ({ ...s, venue_id: e.target.value }))}
            size='small'
            fullWidth
            required
          >
            {branches.map(b => (
              <MenuItem key={b.id} value={b.id}>
                {b.name} {b.company_name ? `— ${b.company_name}` : ''}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={submitting}>
            {memoizedDictionary?.common?.cancel ?? 'Cancelar'}
          </Button>
          <Button variant='contained' onClick={handleSubmit} disabled={submitting}>
            {memoizedDictionary?.common?.save ?? 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default OwnerEmployeesView
