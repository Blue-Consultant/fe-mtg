import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import usePagination from '@/hooks/usePagination'

import {
  setUsers,
  addUsers,
  updateUsers,
  deleteUsers
} from '@/redux-store/slices/user'

import {
  getUsersByBranchPaginationAction,
  getAllUsersPaginationAction,
  createStaffUserAction,
  getBranchesByOwnerAction,
  addUserAction,
  assignLicenseToUserAction
} from '@/app/server/userActions'

import { listAllRolesRolesBranches } from '@/views/roles/api'

import {
  notificationSuccesMessage,
  notificationErrorMessage
} from '@/components/ToastNotification'

export const useUsersClient = (dictionary) => {
  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const usersReducer = useSelector(state => state.userReducer)

  const [showform, setShowform] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [deleteUserData, setDeleteUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [branchList, setBranchList] = useState([])
  const [rolesData, setRolesData] = useState([])
  const [activeTab, setActiveTab] = useState(0) // 0 = Usuarios con sedes, 1 = Todos los usuarios
  const [allUsersData, setAllUsersData] = useState({ rows: [], totalRows: 0, totalPages: 0, currentPage: 1 })

  const {
    pagination,
    isReady: isPaginationReady,
    getParams,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = usePagination({
    pageSize: 10,
    orderBy: 'id',
    orderByMode: 'desc'
  })

  const memoizedDictionary = useMemo(
    () => dictionary,
    [JSON.stringify(dictionary)]
  )

  const loadUsers = useCallback(async () => {
    if (!isPaginationReady) {
      return
    }

    // Para usuarios con sedes, necesitamos usuario.id
    if (activeTab === 0 && !usuario?.id) {
      return
    }

    try {
      setIsLoading(true)
      const params = getParams(pagination)

      if (activeTab === 0) {
        // Usuarios con sedes
        const result = await getUsersByBranchPaginationAction(usuario.id, 2, params)
        if (result.success) {
          dispatch(setUsers(result.data))
        }
      } else {
        // Todos los usuarios (no requiere usuario.id)
        const result = await getAllUsersPaginationAction(params)
        if (result.success) {
          setAllUsersData(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, isPaginationReady, pagination, getParams, dispatch, activeTab])

  const loadBranches = useCallback(async () => {
    if (!usuario?.id) return

    try {
      const result = await getBranchesByOwnerAction(usuario.id)
      if (result.success) {
        setBranchList(result.data)
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }, [usuario?.id])

  const getRolesByBranch = useCallback(async (branchId) => {
    if (!branchId) {
      setRolesData([])
      return
    }

    const roles = await listAllRolesRolesBranches(branchId, true)
    setRolesData(roles || [])
  }, [])

  const handleCreateStaffUser = useCallback(async (formData) => {
    try {
      const result = await createStaffUserAction(formData)

      if (result.success) {
        const branchId = formData.get('branch_id')
        const rolId = formData.get('rol_id')
        const licenseId = formData.get('license_id')
        const licenseType = formData.get('license_type')

        if (branchId && rolId && !formData.get('id')) {
          const branchUserResult = await addUserAction(Number(branchId), result.data.id, Number(rolId))

          // Asignar licencia si existe
          if (licenseId && licenseType && branchUserResult.success) {
            await assignLicenseToUserAction(
              branchUserResult.data.id,
              Number(licenseId),
              licenseType
            )
          }
        }

        notificationSuccesMessage(result.message)
        loadUsers()
        setShowform(false)
        return result
      } else {
        notificationErrorMessage(result.error)
        return result
      }
    } catch (error) {
      console.error('Error creating staff user:', error)
      notificationErrorMessage('Error al crear usuario')
      throw error
    }
  }, [loadUsers])

  const handleDeleteUser = useCallback(async (isConfirmed) => {
    if (!isConfirmed || !deleteUserData) return

    try {
      const params = { branch_id: deleteUserData.branch_id, user_id: deleteUserData.user_id }
      dispatch(deleteUsers(params))
      notificationSuccesMessage('Usuario eliminado exitosamente')
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      notificationErrorMessage('Error al eliminar usuario')
    }
  }, [deleteUserData, dispatch, loadUsers])

  const onDeleteAction = useCallback((branch_id, user_id, rol_id, action, status_id) => {
    setDeleteUserData({ branch_id, user_id, rol_id, action, status_id })
    setOpenConfirmDialog(true)
  }, [])

  useEffect(() => {
    if (isPaginationReady) {
      loadUsers()
    }
  }, [loadUsers, activeTab, isPaginationReady])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  return {
    memoizedDictionary,
    dictionary,
    usersReducer,
    usuario,
    isLoading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    searchValue,
    setSearchValue,
    branchList,
    rolesData,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    loadUsers,
    loadBranches,
    getRolesByBranch,
    handleCreateStaffUser,
    handleDeleteUser,
    onDeleteAction,
    activeTab,
    setActiveTab,
    allUsersData
  }
}
