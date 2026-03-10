import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import { debounce } from 'lodash';
import { deletePermissionThunk, fetchPermissionsPaginationThunk } from "@/redux-store/thunks/permissionsThunks";

export const usePermissions = (dictionary) => {
  const dispatch = useDispatch()
  const userDataReducer = useSelector((state) => state.loginReducer.user)
  const permissionsReducer = useSelector((state) => state.permissionsReducer)
  const socketRef = useRef(null)
  const [viewModeToggle, setViewModeToggle] = useState(false)
  const [loading, setLoading] = useState(false)
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [customerUserData, setCustomerUserData] = useState({ data: {}, action: '' })
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [valuesPagination, setValuesPagination] = useState({
    searchValue: "",
    currentPage: 1,
    pageSize: 8,
    orderBy: "id",
    orderByMode: "desc",
    custom_value: undefined,
  })

  const debouncedSearch = useMemo(
    () => debounce((value) => {
      setValuesPagination(prevState => ({
        ...prevState,
        searchValue: value,
        currentPage: 1
      }))
    }, 500),
    []
  )

  //encargado de calcular el número total de páginas
  useEffect(() => {
    if (permissionsReducer.permissionsPagination?.totalRows && valuesPagination.pageSize) {
      setValuesPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(
          permissionsReducer.permissionsPagination.totalRows / valuesPagination.pageSize
        )
      }))
    }
  }, [permissionsReducer.permissionsPagination?.totalRows, valuesPagination.pageSize])


  const changerViewer = useCallback(() => {
    setViewModeToggle(prev => !prev)
  }, [])

  const memoizedDictionary = useMemo(() => dictionary, [dictionary])

  /*____________________________________
  │   * METHOD PAGINATION PARAMETERS    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const getParams = (searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value) => {
    const parameters = {}

    if (searchValue) parameters.searchValue = searchValue
    if (currentPage) parameters.currentPage = currentPage
    if (pageSize) parameters.pageSize = pageSize
    if (orderBy) parameters.orderBy = orderBy
    if (orderByMode) parameters.orderByMode = orderByMode
    if (custom_value) parameters.custom_value = custom_value

    return parameters
  }

  /*__________________________
  │   * FETCH ENTITIES DATA   │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const fetchPermissionsData = useCallback(() => {
    if (!userDataReducer?.id) return
    try {
      setLoading(true)
      const { searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value } = valuesPagination
      const params = getParams(searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value )

      dispatch(
        fetchPermissionsPaginationThunk({
          status: true,
          params,
        })
      )
    } catch (error) {
      console.error("Error fetching modules:", error)
    } finally {
      setLoading(false)
    }
  }, [dispatch, valuesPagination])

  /*_______________________________
  │   * INIT + SOCKET LISTENER     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    // Inicializar socket solo una vez
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SERVER_API, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        timeout: 20000,
      })
    }

    const socket = socketRef.current
    socket.on("notificationListening", fetchPermissionsData)

    return () => {
      if (socket) {
        socket.off("notificationListening", fetchPermissionsData)
      }
    }
  }, [fetchPermissionsData])

  useEffect(() => {
    fetchPermissionsData()
  }, [fetchPermissionsData])

  const handleDelete = async isConfirmed => {
    if (isConfirmed && selectedId) {
      try {
        await dispatch(deletePermissionThunk(selectedId))

        const totalRowsAfterDelete = permissionsReducer.permissionsPagination.totalRows - 1
        const newTotalPages = Math.ceil(totalRowsAfterDelete / valuesPagination.pageSize)
        if (
          valuesPagination.currentPage > newTotalPages &&
          valuesPagination.currentPage > 1
        ) {
          setValuesPagination(prev => ({
            ...prev,
            currentPage: newTotalPages
          }))
        } else {
          fetchPermissionsData()
        }
      } catch (error) {
        console.error("Error al eliminar permiso: ", error)
      } finally {
        setOpenConfirmDialog(false)
        setSelectedId(null)
      }
    } else {
      setOpenConfirmDialog(false)
      setSelectedId(null)
    }
  }

  const openDeleteDialog = id => {
    setSelectedId(id)
    setOpenConfirmDialog(true)
  }

  return {
    memoizedDictionary,
    userDataReducer,
    loading,
    valuesPagination,
    fetchPermissionsData,
    setValuesPagination,
    permissionsPagination: permissionsReducer.permissionsPagination,
    viewModeToggle,
    changerViewer,
    debouncedSearch,
    customerUserOpen,
    setCustomerUserOpen,
    customerUserData,
    setCustomerUserData,
    handleDelete,
    openDeleteDialog,
    openConfirmDialog,
    setOpenConfirmDialog
  }
}
