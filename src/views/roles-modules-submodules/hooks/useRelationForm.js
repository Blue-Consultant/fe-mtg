import { useTheme } from '@mui/material/styles'
import { listAllRolesForAssignment } from '@/views/roles/api'
import { getModules } from '@/views/modules/api'
import { getSubModulesByMultipleModules } from '@/views/sub-modules/api'
import { useDispatch, useSelector } from 'react-redux';
import { bulkAssignPermissionsThunk, fetchRolePermissionsPaginationThunk } from '@/redux-store/thunks/roles-modules-submodules-thunk'
import { getRolePermissions } from '@/views/roles-modules-submodules/api'
import { useEffect, useState } from 'react';
import { notificationSuccesMessage } from '@/components/ToastNotification';


export const useRelationForm = (setOpen, selectedRole, onSuccessCallback) => {
  const theme = useTheme()
  const dispatch = useDispatch();
  const userDataReducer = useSelector((state) => state.loginReducer.user)
  const [localRole, setLocalRole] = useState('')
  const [loadingRegister, setLoadingRegister] = useState('')
  const [localModule, setLocalModule] = useState([])
  const [selectedSubModules, setSelectedSubModules] = useState([])
  const [subModulesSelectionMap, setSubModulesSelectionMap] = useState({})
  const [localRolesList, setLocalRolesList] = useState([])
  const [localModulesList, setLocalModulesList] = useState([])
  const [localSubModulesList, setLocalSubModulesList] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [loadingModules, setLoadingModules] = useState(false)
  const [loadingSubModules, setLoadingSubModules] = useState(false)
  const [expandedModules, setExpandedModules] = useState({})
  const [selectedCheckbox, setSelectedCheckbox] = useState([])
  const [isIndeterminateCheckbox, setIsIndeterminateCheckbox] = useState(false)
  const [existingSubModules, setExistingSubModules] = useState([])

  const defaultData = [
    'User Management',
    'Content Management',
    'Disputes Management',
    'Database Management',
    'Financial Management',
    'Reporting',
    'API Control',
    'Repository Management',
    'Payroll'
  ]

  // Cargar todos los roles disponibles al abrir el modal
  useEffect(() => {
    const fetchAllRoles = async () => {
      if (!userDataReducer?.id) return

      setLoadingRoles(true)
      try {
        const roles = await listAllRolesForAssignment(userDataReducer.id)
        setLocalRolesList(roles || [])
      } catch (error) {
        console.error('Error al cargar roles:', error)
        setLocalRolesList([])
      } finally {
        setLoadingRoles(false)
      }
    }

    if (setOpen) {
      fetchAllRoles()
      setLocalRole(selectedRole || '')
      setLocalModule([])
      setSelectedSubModules([])
      setSubModulesSelectionMap({})
      setExpandedModules({})
    }
  }, [userDataReducer?.id, selectedRole])

  // Cargar módulos cuando se selecciona un rol
  useEffect(() => {
    const fetchModules = async () => {
      if (localRole) {
        setLoadingModules(true)
        setLocalModule([])
        try {
          const modules = await getModules(true)
          setLocalModulesList(modules || [])
        } catch (error) {
          console.error('Error al cargar módulos:', error)
          setLocalModulesList([])
        } finally {
          setLoadingModules(false)
        }
      } else {
        setLocalModulesList([])
        setLocalModule([])
      }
    }

    fetchModules()
  }, [localRole])

  // Cargar permisos existentes cuando se selecciona un rol
  useEffect(() => {
    const fetchExistingPermissions = async () => {
      if (localRole) {
        try {
          const permissions = await getRolePermissions(localRole)

          const existingSubModuleIds = []
          if (permissions.modules && Array.isArray(permissions.modules)) {
            permissions.modules.forEach(module => {
              if (module.submodules && Array.isArray(module.submodules)) {
                module.submodules.forEach(submodule => {
                  existingSubModuleIds.push(submodule.id)
                })
              }
            })
          }

          setExistingSubModules(existingSubModuleIds)
        } catch (error) {
          console.error('Error al cargar permisos existentes:', error)
          setExistingSubModules([])
        }
      } else {
        setExistingSubModules([])
      }
    }

    fetchExistingPermissions()
  }, [localRole])

  useEffect(() => {
    const fetchSubModules = async () => {
      if (localModule && localModule.length > 0) {
        setLoadingSubModules(true)

        try {
          const subModules = await getSubModulesByMultipleModules(localModule, true)
          setLocalSubModulesList(subModules || [])

          const allSelectedSubModules = []
          localModule.forEach(moduleId => {
            if (subModulesSelectionMap[moduleId]) {
              allSelectedSubModules.push(...subModulesSelectionMap[moduleId])
            }
          })
          setSelectedSubModules(allSelectedSubModules)

          const expanded = {}
          localModule.forEach(moduleId => {
            expanded[moduleId] = true
          })
          setExpandedModules(expanded)
        } catch (error) {
          console.error('Error al cargar submódulos:', error)
          setLocalSubModulesList([])
        } finally {
          setLoadingSubModules(false)
        }
      } else {
        setLocalSubModulesList([])
        setSelectedSubModules([])
        setExpandedModules({})
      }
    }

    fetchSubModules()
  }, [localModule])

  const toggleModuleExpansion = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const handleClose = () => {
    setOpen(false)
    setLocalRole('')
    setLocalModule([])
    setSelectedSubModules([])
    setSubModulesSelectionMap({})
    setLocalRolesList([])
    setLocalModulesList([])
    setLocalSubModulesList([])
    setSelectedCheckbox([])
    setExpandedModules({})
    setExistingSubModules([])
  }

  const handleSubmit = async () => {

    const assignments = selectedSubModules.map(subModuleId => {
      const subModule = localSubModulesList.find(subModule => subModule.id === subModuleId)
      return {
        module_id: subModule.module_id,
        submodule_id: subModule.id
      }
    })
    const payload = {
      role_id: localRole,
      assignments: assignments
    }

    try {
      setLoadingRegister(true)
      await dispatch(bulkAssignPermissionsThunk(payload))
      await dispatch(fetchRolePermissionsPaginationThunk({ status: true, params: {} }))
      handleClose()
      notificationSuccesMessage('Permisos asignados correctamente')
      if (onSuccessCallback && typeof onSuccessCallback === 'function') {
        onSuccessCallback()
      }
    } catch (error) {
      console.error('Error al guardar permisos:', error)
    } finally {
      setLoadingRegister(false)
    }
  }

  const handleSubModuleToggle = (subModuleId) => {
    const subModule = localSubModulesList.find(sm => sm.id === subModuleId)
    const moduleId = subModule?.module_id

    setSelectedSubModules(prev => {
      const newSelected = prev.includes(subModuleId)
        ? prev.filter(id => id !== subModuleId)
        : [...prev, subModuleId]

      if (moduleId) {
        setSubModulesSelectionMap(prevMap => {
          const moduleSubModules = localSubModulesList
            .filter(sm => sm.module_id === moduleId)
            .map(sm => sm.id)

          const selectedForThisModule = newSelected.filter(id =>
            moduleSubModules.includes(id)
          )

          return {
            ...prevMap,
            [moduleId]: selectedForThisModule
          }
        })
      }

      return newSelected
    })
  }

  const handleSelectAllSubModules = () => {
    // Filtrar solo los submódulos que NO están ya asignados
    const availableSubModules = localSubModulesList.filter(sm => !existingSubModules.includes(sm.id))
    const availableSubModuleIds = availableSubModules.map(sm => sm.id)
    const isAllSelected = selectedSubModules.length === availableSubModuleIds.length && availableSubModuleIds.length > 0

    if (isAllSelected) {
      setSelectedSubModules([])
      setSubModulesSelectionMap(prevMap => {
        const newMap = { ...prevMap }
        localModule.forEach(moduleId => {
          newMap[moduleId] = []
        })
        return newMap
      })
    } else {
      // Seleccionar todos los disponibles (excepto los ya asignados)
      setSelectedSubModules(availableSubModuleIds)

      setSubModulesSelectionMap(prevMap => {
        const newMap = { ...prevMap }
        localModule.forEach(moduleId => {
          const moduleSubModules = availableSubModules
            .filter(sm => sm.module_id === moduleId)
            .map(sm => sm.id)
          newMap[moduleId] = moduleSubModules
        })
        return newMap
      })
    }
  }

  useEffect(() => {
    if (selectedCheckbox.length > 0 && selectedCheckbox.length < defaultData.length * 3) {
      setIsIndeterminateCheckbox(true)
    } else {
      setIsIndeterminateCheckbox(false)
    }
  }, [selectedCheckbox])


    return {
        loadingRoles,
        localRolesList,
        localModule,
        localSubModulesList,
        expandedModules,
        selectedSubModules,
        isIndeterminateCheckbox,
        loadingRegister,
        localModulesList,
        loadingModules,
        loadingSubModules,
        theme,
        localRole,
        existingSubModules,
        toggleModuleExpansion,
        handleSubmit,
        handleSelectAllSubModules,
        handleSubModuleToggle,
        handleClose,
        setLocalRole,
        setLocalModule
    }
}
