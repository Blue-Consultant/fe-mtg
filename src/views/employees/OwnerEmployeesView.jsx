'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Card,
  TextField,
  IconButton,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material'

import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

import CanAccess from '@/components/permissions/CanAccess'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import UserTable from '@/views/users/components/UserTable'

import { getOwnerEmployees } from './api'
import { listBranchesByOwner } from '@/views/branches/api'
import { listAllRolesRolesBranches } from '@/views/roles/api'
import { createStaffUserAction, setUserStatusAction } from '@/app/server/userActions'
import { notificationSuccesMessage, notificationErrorMessage } from '@/components/ToastNotification'
import styles from './employees.module.css'

const emptyForm = () => ({
  id: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  dni: '',
  venue_id: ''
})

const mapEmployeeToUserRow = (employee, roleId) => {
  const venues = Array.isArray(employee.venues) ? employee.venues : []
  const firstVenue = venues[0]

  return {
    Users: {
      id: employee.id,
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      phone_number: employee.phone_number || '',
      country: employee.country || '',
      avatar: employee.avatar || '',
      dni: employee.dni || ''
    },
    Branches: {
      id: firstVenue?.id ?? null,
      name: venues.length
        ? venues.map(v => (v.company_name ? `${v.name} — ${v.company_name}` : v.name)).join(', ')
        : 'N/A'
    },
    Roles: { id: roleId || null, name: 'Empleado' },
    Status_conditions: { name: 'Activo', id: 5 },
    _venues: venues
  }
}

const OwnerEmployeesView = ({ dictionary }) => {
  const memoizedDictionary = useMemo(() => dictionary, [JSON.stringify(dictionary)])
  const d = memoizedDictionary?.modules?.empleados ?? {}
  const usuario = useSelector(state => state.loginReducer.user)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState([])
  const [employeeRoleId, setEmployeeRoleId] = useState(null)
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({})
  const [searchValue, setSearchValue] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form, setForm] = useState(emptyForm)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [deleteUserData, setDeleteUserData] = useState(null)
  const [deleting, setDeleting] = useState(false)

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

        const roleVenueId = mapped[0]?.id

        if (roleVenueId) {
          const roles = await listAllRolesRolesBranches(roleVenueId, true)
          const empRole = (roles || []).find(r => String(r.name || '').toLowerCase() === 'empleado')

          setEmployeeRoleId(empRole?.id ?? null)
        }
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
    setPage(1)
  }, [searchValue])

  const filteredRows = useMemo(() => {
    const q = searchValue.trim().toLowerCase()

    if (!q) return rows

    return rows.filter(r => {
      const name = [r.first_name, r.last_name].filter(Boolean).join(' ').toLowerCase()
      const venuesStr = (r.venues || []).map(v => `${v.name} ${v.company_name || ''}`.toLowerCase()).join(' ')

      return name.includes(q) || (r.email || '').toLowerCase().includes(q) || venuesStr.includes(q)
    })
  }, [rows, searchValue])

  const totalFiltered = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize) || 1)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const tableRows = useMemo(() => {
    const start = (page - 1) * pageSize

    return filteredRows.slice(start, start + pageSize).map(row => mapEmployeeToUserRow(row, employeeRoleId))
  }, [filteredRows, page, pageSize, employeeRoleId])

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((form.email || '').trim())
  const passwordOk = isEdit ? !form.password || form.password.length >= 6 : (form.password || '').length >= 6

  const fieldErrors = useMemo(
    () => ({
      first_name: !form.first_name?.trim() ? (d.errRequired ?? 'Obligatorio') : '',
      email: !form.email?.trim()
        ? (d.errRequired ?? 'Obligatorio')
        : !emailOk
          ? (d.errEmail ?? 'Correo no válido')
          : '',
      password:
        !isEdit && !form.password
          ? (d.errRequired ?? 'Obligatorio')
          : !passwordOk
            ? (d.errPassword ?? 'Mínimo 6 caracteres')
            : '',
      dni: !isEdit && !form.dni?.trim() ? (d.errRequired ?? 'Obligatorio') : '',
      venue_id: !form.venue_id ? (d.errRequired ?? 'Obligatorio') : ''
    }),
    [form, emailOk, passwordOk, isEdit, d.errRequired, d.errEmail, d.errPassword]
  )

  const formValid = Object.values(fieldErrors).every(v => !v)
  const setField = (key, value) => setForm(s => ({ ...s, [key]: value }))

  const openCreateDialog = () => {
    const next = emptyForm()

    if (branches.length === 1) next.venue_id = branches[0].id
    setForm(next)
    setIsEdit(false)
    setTouched({})
    setShowPassword(false)
    setOpen(true)
  }

  const openEditDialog = data => {
    const user = data?.Users || {}

    setForm({
      id: user.id || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
      dni: user.dni || '',
      venue_id: data?.Branches?.id || ''
    })
    setIsEdit(true)
    setTouched({})
    setShowPassword(false)
    setOpen(true)
  }

  const closeDialog = (force = false) => {
    if (submitting && !force) return
    setOpen(false)
    setForm(emptyForm())
    setIsEdit(false)
    setTouched({})
    setShowPassword(false)
  }

  const handleSubmit = async e => {
    e?.preventDefault?.()
    setTouched({ first_name: true, email: true, password: true, dni: true, venue_id: true })

    if (!formValid) {
      notificationErrorMessage(d.errForm ?? 'Revisa los campos marcados.')

      return
    }

    try {
      setSubmitting(true)
      const fd = new FormData()

      if (isEdit && form.id) fd.append('id', String(form.id))
      fd.append('first_name', form.first_name.trim())
      fd.append('last_name', (form.last_name || '').trim())
      fd.append('email', form.email.trim())
      if (form.password) fd.append('password', form.password)
      if (form.dni?.trim()) fd.append('dni', form.dni.trim())
      fd.append('venue_id', String(form.venue_id))
      fd.append('assign_employee_role', 'true')
      const res = await createStaffUserAction(fd)

      if (res.success) {
        notificationSuccesMessage(res.message)
        closeDialog(true)
        await load()
      } else {
        notificationErrorMessage(res.error || 'Error')
      }
    } catch (err) {
      notificationErrorMessage(err.message || 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  const onDeleteAction = useCallback((branchId, userId, roleId, action, statusId) => {
    setDeleteUserData({ branchId, userId, roleId, action, statusId })
    setOpenConfirmDialog(true)
  }, [])

  const handleDeleteUser = async confirmed => {
    if (!confirmed || !deleteUserData) return

    try {
      setDeleting(true)
      const target = rows.find(r => r.id === deleteUserData.userId)
      const venueIds = (target?.venues || []).map(v => v.id).filter(Boolean)
      const ids = venueIds.length ? venueIds : [deleteUserData.branchId].filter(Boolean)
      const roleId = deleteUserData.roleId || employeeRoleId

      for (const venueId of ids) {
        const res = await setUserStatusAction(venueId, deleteUserData.userId, roleId, 'Delete', deleteUserData.statusId)

        if (!res.success) throw new Error(res.error || 'No se pudo eliminar')
      }

      notificationSuccesMessage(d.deleted ?? 'Empleado eliminado')
      setOpenConfirmDialog(false)
      setDeleteUserData(null)
      await load()
    } catch (err) {
      notificationErrorMessage(err.message || 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  const tableController = useMemo(
    () => ({
      isLoading: loading,
      pagination: { currentPage: page, pageSize },
      memoizedDictionary,
      handlePageChange: nextPage => setPage(nextPage),
      handlePageSizeChange: nextSize => {
        setPageSize(nextSize)
        setPage(1)
      },
      handleSortChange: () => {},
      onDeleteAction,
      setShowform: () => {},
      setDataProp: prop => {
        if (prop?.action === 'edit' && prop.data) openEditDialog(prop.data)
      },
      activeTab: 0
    }),
    [loading, page, pageSize, memoizedDictionary, onDeleteAction]
  )

  const usersReducer = useMemo(
    () => ({
      usersPagination: {
        rows: tableRows,
        currentPage: page,
        totalRows: totalFiltered,
        totalPages
      }
    }),
    [tableRows, page, totalFiltered, totalPages]
  )

  return (
    <div className={styles.pageWrap}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.headerTitle}>{d.title ?? 'Empleados'}</h1>
            <p className={styles.headerSubtitle}>{d.subtitle ?? 'Personal de tus sucursales.'}</p>
          </div>
          <div className={styles.headerActions}>
            <button type='button' className={styles.btnGhost} onClick={() => load()} disabled={loading}>
              <i className='ri-refresh-line' aria-hidden />
              {d.refresh ?? 'Actualizar'}
            </button>
            <CanAccess permission='crear'>
              <button type='button' className={styles.btnPrimary} onClick={openCreateDialog}>
                <i className='ri-user-add-line' aria-hidden />
                {d.addEmployee ?? 'Registrar empleado'}
              </button>
            </CanAccess>
            <TextField
              placeholder={memoizedDictionary?.common?.search ?? 'Buscar…'}
              size='small'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className={styles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' style={{ color: '#5c6560' }} />
                  </InputAdornment>
                )
              }}
            />
          </div>
        </header>

        <Card className={styles.tableCard}>
          <UserTable controller={tableController} usersReducer={usersReducer} />
        </Card>
      </motion.div>

      <Dialog
        open={open}
        onClose={() => closeDialog()}
        maxWidth='sm'
        fullWidth
        scroll='paper'
        PaperProps={{
          className: styles.dialogPaper,
          component: 'form',
          onSubmit: handleSubmit,
          noValidate: true
        }}
      >
        <div className={styles.dialogHeader}>
          <div className={styles.dialogHeaderIcon} aria-hidden>
            <i className={isEdit ? 'ri-user-settings-line' : 'ri-user-add-line'} />
          </div>
          <div className={styles.dialogHeaderText}>
            <h2 className={styles.dialogTitle}>
              {isEdit ? (d.editTitle ?? 'Editar empleado') : (d.dialogTitle ?? 'Nuevo empleado')}
            </h2>
            <p className={styles.dialogHint}>
              {isEdit
                ? (d.editHint ?? 'Actualiza los datos del empleado.')
                : (d.hint ?? 'Crea un usuario con acceso de empleado para una sucursal.')}
            </p>
          </div>
          <button
            type='button'
            className={styles.dialogClose}
            onClick={() => closeDialog()}
            disabled={submitting}
            aria-label={memoizedDictionary?.common?.cancel ?? 'Cerrar'}
          >
            <i className='ri-close-line' aria-hidden />
          </button>
        </div>

        <DialogContent className={styles.dialogBody} dividers>
          <section className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>{d.sectionProfile ?? 'Datos personales'}</h3>
            <div className={styles.formGrid}>
              <TextField
                className={styles.dialogField}
                label={d.firstName ?? 'Nombre'}
                value={form.first_name}
                onChange={e => setField('first_name', e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, first_name: true }))}
                size='small'
                fullWidth
                required
                autoFocus
                error={Boolean(touched.first_name && fieldErrors.first_name)}
                helperText={(touched.first_name && fieldErrors.first_name) || undefined}
              />
              <TextField
                className={styles.dialogField}
                label={d.lastName ?? 'Apellido'}
                value={form.last_name}
                onChange={e => setField('last_name', e.target.value)}
                size='small'
                fullWidth
              />
            </div>
            <TextField
              className={styles.dialogField}
              label={d.dni ?? 'DNI / documento'}
              value={form.dni}
              onChange={e => setField('dni', e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, dni: true }))}
              size='small'
              fullWidth
              required={!isEdit}
              error={Boolean(touched.dni && fieldErrors.dni)}
              helperText={(touched.dni && fieldErrors.dni) || undefined}
            />
          </section>

          <section className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>{d.sectionAccess ?? 'Acceso'}</h3>
            <div className={styles.accessStack}>
              <TextField
                className={styles.dialogField}
                label={d.email ?? 'Correo'}
                type='email'
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                size='small'
                fullWidth
                required
                autoComplete='off'
                error={Boolean(touched.email && fieldErrors.email)}
                helperText={
                  touched.email && fieldErrors.email
                    ? fieldErrors.email
                    : (d.emailHelp ?? 'Con este correo iniciará sesión')
                }
              />
              <TextField
                className={styles.dialogField}
                label={d.password ?? 'Contraseña'}
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                size='small'
                fullWidth
                required={!isEdit}
                autoComplete='new-password'
                error={Boolean(touched.password && fieldErrors.password)}
                helperText={
                  touched.password && fieldErrors.password
                    ? fieldErrors.password
                    : isEdit
                      ? (d.passwordEditHelp ?? 'Déjala vacía si no quieres cambiarla')
                      : (d.passwordHelp ?? 'Mínimo 6 caracteres')
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        type='button'
                        edge='end'
                        size='small'
                        onClick={() => setShowPassword(v => !v)}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </div>
          </section>

          <section className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>{d.sectionVenue ?? 'Sucursal'}</h3>
            <TextField
              className={styles.dialogField}
              select
              label={d.venue ?? 'Sucursal'}
              value={form.venue_id}
              onChange={e => setField('venue_id', e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, venue_id: true }))}
              size='small'
              fullWidth
              required
              error={Boolean(touched.venue_id && fieldErrors.venue_id)}
              helperText={
                touched.venue_id && fieldErrors.venue_id
                  ? fieldErrors.venue_id
                  : (d.venueHelp ?? 'El empleado quedará vinculado a esta sede')
              }
              disabled={branches.length === 0}
            >
              {branches.length === 0 ? (
                <MenuItem value='' disabled>
                  {d.noBranches ?? 'No hay sucursales disponibles'}
                </MenuItem>
              ) : (
                branches.map(b => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name}
                    {b.company_name ? ` — ${b.company_name}` : ''}
                  </MenuItem>
                ))
              )}
            </TextField>
          </section>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <button type='button' className={styles.btnGhost} onClick={() => closeDialog()} disabled={submitting}>
            {memoizedDictionary?.common?.cancel ?? 'Cancelar'}
          </button>
          <button type='submit' className={styles.btnPrimary} disabled={submitting}>
            {submitting ? (
              <>
                <i className='ri-loader-4-line' aria-hidden />
                {d.saving ?? 'Guardando…'}
              </>
            ) : (
              <>
                <i className={isEdit ? 'ri-save-line' : 'ri-check-line'} aria-hidden />
                {isEdit ? (d.updateEmployee ?? 'Actualizar') : (d.saveEmployee ?? 'Crear empleado')}
              </>
            )}
          </button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={openConfirmDialog}
        setOpen={setOpenConfirmDialog}
        type='delete'
        onConfirmation={handleDeleteUser}
        moduleName={d.moduleName ?? 'empleado'}
        isLoading={deleting}
      />
    </div>
  )
}

export default OwnerEmployeesView
