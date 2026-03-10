import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import { debounce } from 'lodash';
import { deletePermissionThunk, fetchRolePermissionsPaginationThunk } from "@/redux-store/thunks/roles-modules-submodules-thunk"
import { listBranchesByOwner } from "@/views/branches/api/index"
import { listAllRolesForAssignment } from "@/views/roles/api"
// Configura el socket una sola vez
const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 20000,
})

export const useRelationHome = (dictionary) => {
  const dispatch = useDispatch()
  const userDataReducer = useSelector((state) => state.loginReducer.user)
  const [viewModeToggle, setViewModeToggle] = useState(false);
  const [modulesList, setModulesList] = useState([])
  const [branchList, setBranchList] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [customerUserData, setCustomerUserData] = useState({ data: {}, action: '' })
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const debouncedSearch = useCallback(
    debounce(value => {
      // Implementar búsqueda si es necesario
    }, 500),
    []
  )

  const changerViewer = () => {
    setViewModeToggle(prev => !prev);
  };

  const memoizedDictionary = useMemo(() => dictionary, [JSON.stringify(dictionary)])

  /*__________________________________
  │   * FETCH ROLES LIST (NOT RELATIONS)   │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const fetchRolesList = useCallback(async () => {
    if (!userDataReducer?.id) return
    try {
      setLoading(true)
      // Obtener todos los roles disponibles para asignar módulos
      // (globales + por sede según el usuario)
      const rolesData = await listAllRolesForAssignment(userDataReducer.id)
      setRolesList(rolesData || [])
    } catch (error) {
      console.error("Error fetching roles list:", error)
      setRolesList([])
    } finally {
      setLoading(false)
    }
  }, [userDataReducer?.id])


  /*_______________________________
  │   * INIT + SOCKET LISTENER     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    socket.on("notificationListening", fetchRolesList)
    return () => socket.off("notificationListening", fetchRolesList)
  }, [fetchRolesList])

  useEffect(() => {
    fetchRolesList()
  }, [fetchRolesList])

  /*_____________________
  │   * FETCH BRANCHES    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    const fetchBranchesData = async () => {
      try {
        const branchesData = await listBranchesByOwner(userDataReducer?.id)
        setBranchList(branchesData || [])
      } catch (error) {
        console.error("Error fetching branches:", error)
        setBranchList([])
      }
    }

    if (userDataReducer?.id) {
      fetchBranchesData()
    }
  }, [userDataReducer?.id])

  const handleDelete = async isConfirmed => {
    if (isConfirmed && selectedId) {
      try {
        await dispatch(deletePermissionThunk(selectedId))
        await dispatch(fetchRolePermissionsPaginationThunk({ status: true, params: {} }))
      } catch (error) {
        console.error("Error al eliminar permiso: ", error)
      }
    }
  }

  const openDeleteDialog = id => {
    setSelectedId(id)
    setOpenConfirmDialog(true)
  }

  return {
    memoizedDictionary,
    userDataReducer,
    branchList,
    rolesList,
    modulesList,
    loading,
    viewModeToggle,
    changerViewer,
    selectedBranch,
    setSelectedBranch,
    selectedRole,
    setSelectedRole,
    debouncedSearch,
    customerUserOpen,
    setCustomerUserOpen,
    customerUserData,
    setCustomerUserData,
    handleDelete,
    openDeleteDialog,
    openConfirmDialog,
    setOpenConfirmDialog,
    fetchRolesList,
  }
}
