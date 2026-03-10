'use client'
import { useCallback, useEffect, useState } from 'react'
import {
  listAllRolesPagination,
  addRolesPermissions,
  updateRolesPermissions,
  deleteRolesPermissions
} from '../api'
import { useDispatch, useSelector } from 'react-redux'
import { setRolesPagination, setBranchesOwnerRoles } from '@/redux-store/slices/roles'
import { listBranchesByOwner, listBranchesByUser } from '@/views/branches/api/index'
import usePagination from '@/hooks/usePagination'

export const useRoles = () => {
  const [showform, setShowform] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [isLoading, setIsLoading] = useState(false)
  const [viewModeToggle, setViewModeToggle] = useState(false)

  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const rolesReducer = useSelector(state => state.rolReducer)

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
    orderBy: 'name',
    orderByMode: 'asc'
  })

  const getRoles = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) return

    try {
      setIsLoading(true)
      const params = getParams({
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        orderBy: pagination.orderBy,
        orderByMode: pagination.orderByMode,
        searchValue: pagination.searchValue
      })

      const rolesData = await listAllRolesPagination(usuario.id, params)
      dispatch(setRolesPagination(rolesData))
    } catch (error) {
      console.error('Error loading roles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, isPaginationReady, pagination, getParams, dispatch])

  const getBranchOwner = useCallback(async () => {
    if (!usuario?.id) return

    console.log('usuario', usuario);


    const dataOwner = await listBranchesByUser(usuario.id, null)
    dispatch(setBranchesOwnerRoles(dataOwner))
  }, [usuario?.id, dispatch])

  const changerViewer = useCallback(() => {
    setViewModeToggle(prev => !prev)
  }, [])

  useEffect(() => {
    getBranchOwner()
  }, [getBranchOwner])

  useEffect(() => {
    if (usuario?.id && isPaginationReady) {
      getRoles()
    }
  }, [usuario?.id, isPaginationReady, getRoles])

  const addRoles = useCallback(async formData => {
    await addRolesPermissions(formData)
    getRoles() // refresh sin await para no bloquear
  }, [getRoles])

  const updateRoles = useCallback(async formData => {
    await updateRolesPermissions(formData)
    getRoles() // refresh sin await para no bloquear
  }, [getRoles])

  const deleteRoles = useCallback(async role => {
    await deleteRolesPermissions(role)
    await getRoles()
  }, [getRoles])

  return {
    dataProp,
    isLoading,
    usuario,
    rolesReducer,
    showform,
    viewModeToggle,
    changerViewer,
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    setShowform,
    setDataProp,
    addRoles,
    updateRoles,
    deleteRoles
  }
}
