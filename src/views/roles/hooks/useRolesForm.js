import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { getAllPermissions } from '@/views/permissions/api'


export const useRolesForm = (controller, rolesReducer, handleClose) => {
  const { dataProp, addRoles, updateRoles } = controller

  const branchesOwner = rolesReducer?.branchesOwnerRoles || []
  const [permissionsList, setPermissionsList] = useState([])
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [isLoadingData, setIsLoadingData] = useState(false)

  // useForm
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      id: '',
      name: '',
      description: '',
      status: true,
      is_student: false,
      is_holder: false,
      branch_id: '',
      permissions: []
    }
  })

  const watchBranch = watch('branch_id')

  // Función para cargar permisos (reutilizable)
  const loadPermissionsForBranch = useCallback(async (branchId) => {
    if (branchId) {
      setLoadingPermissions(true)
      setSelectedBranch(branchId)
      try {
        const permissions = await getAllPermissions()
        setPermissionsList(Array.isArray(permissions) ? permissions.filter(p => p.status) : [])
      } catch (error) {
        console.error('Error loading permissions:', error)
        setPermissionsList([])
      } finally {
        setLoadingPermissions(false)
      }
    } else {
      setPermissionsList([])
      setSelectedPermissions([])
    }
  }, [])

  // Cargar permisos cuando se selecciona una sucursal manualmente
  useEffect(() => {
    // Solo cargar si no estamos cargando datos de edición
    if (!isLoadingData && watchBranch) {
      loadPermissionsForBranch(watchBranch)
    }
  }, [watchBranch, loadPermissionsForBranch, isLoadingData])

  // cargar datos si es update
  useEffect(() => {
    const loadData = async () => {
      if (dataProp?.data) {
        setIsLoadingData(true)

        // Primero establecer los valores básicos
        setValue('id', dataProp.data.id || '')
        setValue('name', dataProp.data.name || '')
        setValue('description', dataProp.data.description || '')
        setValue('status', dataProp.data.status ?? true)
        setValue('is_student', dataProp.data.is_student ?? false)
        setValue('is_holder', dataProp.data.is_holder ?? false)

        const permissions = dataProp.data.Roles_permissions?.map(p => p.permission_id) || []
        setValue('permissions', permissions)

        // Cargar permisos si hay branch_id en modo edición
        if (dataProp.data.branch_id) {
          // Establecer branch_id
          setValue('branch_id', dataProp.data.branch_id)

          // Cargar permisos para esta sucursal
          await loadPermissionsForBranch(dataProp.data.branch_id)

          // Después de cargar permisos, establecer seleccionados
          setSelectedPermissions(permissions)
        }

        clearErrors()
        setIsLoadingData(false)
      } else {
        setIsLoadingData(false)
        reset({
          id: '',
          name: '',
          description: '',
          status: true,
          is_student: false,
          is_holder: false,
          branch_id: '',
          permissions: []
        })
        setSelectedPermissions([])
        setPermissionsList([])
      }
    }

    loadData()
  }, [dataProp, setValue, reset, clearErrors, loadPermissionsForBranch])

  // Manejar selección de permisos
  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      const newSelected = prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]

      setValue('permissions', newSelected)
      return newSelected
    })
  }

  // Seleccionar/deseleccionar todos los permisos
  const handleSelectAll = () => {
    const allPermissionIds = permissionsList.map(p => p.id)
    const isAllSelected = selectedPermissions.length === permissionsList.length

    if (isAllSelected) {
      setSelectedPermissions([])
      setValue('permissions', [])
    } else {
      setSelectedPermissions(allPermissionIds)
      setValue('permissions', allPermissionIds)
    }
  }

  // Limpiar formulario
  const resetForm = useCallback(() => {
    reset({
      id: '',
      name: '',
      description: '',
      status: true,
      is_student: false,
      is_holder: false,
      branch_id: '',
      permissions: []
    })
    setSelectedPermissions([])
    setPermissionsList([])
    setLoadingPermissions(false)
    setSelectedBranch('')
    setIsLoadingData(false)
  }, [reset])

  // Manejar cierre del modal
  const handleModalClose = useCallback(() => {
    resetForm()
    handleClose()
  }, [resetForm, handleClose])

  // submit
  const onSubmit = async formData => {
    const dataToSend = {
      ...formData,
      permissions: selectedPermissions
    }

    try {
      if (formData.id) {
        await updateRoles(dataToSend)
      } else {
        await addRoles(dataToSend)
      }

      resetForm()
      handleClose()
    } catch (error) {
      console.error('Error guardando el rol:', error)
      throw error
    }
  }

  return {
    onSubmit,
    handlePermissionToggle,
    handleSelectAll,
    selectedPermissions,
    permissionsList,
    loadingPermissions,
    selectedBranch,
    watchBranch,
    errors,
    isSubmitting,
    control,
    handleSubmit,
    branchesOwner,
    dataProp,
    handleModalClose,
    setValue
  };
};
