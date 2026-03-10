import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import { debounce } from 'lodash';
import { deleteModuleThunks, fetchModulesPagination } from "@/redux-store/thunks/modulesThunk"
// Configura el socket una sola vez
const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 20000,
})

export const useModules = (dictionary) => {
  const dispatch = useDispatch()
  const userDataReducer = useSelector((state) => state.loginReducer.user)
  const modulesReducer = useSelector((state) => state.modules)
  const [viewModeToggle, setViewModeToggle] = useState(false);
  const [branchList, setBranchList] = useState([])
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

  const debouncedSearch = useCallback(
    debounce(value => {
      // setSelectedBranch('')
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
    if (modulesReducer.modulesPagination?.totalRows && valuesPagination.pageSize) {
      setValuesPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(
          modulesReducer.modulesPagination.totalRows / valuesPagination.pageSize
        )
      }))
    }
  }, [modulesReducer.modulesPagination?.totalRows, valuesPagination.pageSize])


  const changerViewer = () => {
    setViewModeToggle(prev => !prev);
  };

  const memoizedDictionary = useMemo(() => dictionary, [JSON.stringify(dictionary)])

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
  const fetchModulesData = useCallback(() => {
    if (!userDataReducer?.id) return
    try {
      setLoading(true)
      const { searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value } = valuesPagination
      const params = getParams(searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value )

      dispatch(
        fetchModulesPagination({
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
    socket.on("notificationListening", fetchModulesData)
    return () => socket.off("notificationListening", fetchModulesData)
  }, [])

  useEffect(() => {
    fetchModulesData()
  }, [valuesPagination])

  const handleDelete = async isConfirmed => {
    if (isConfirmed && selectedId) {
      try {
        await dispatch(deleteModuleThunks(selectedId))

        const totalRowsAfterDelete = modulesReducer.modulesPagination.totalRows - 1
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
          fetchModulesData()
        }
      } catch (error) {
        console.error("Error al eliminar entidad: ", error)
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
    loading,
    valuesPagination,fetchModulesData,
    setValuesPagination,
    modulesPagination: modulesReducer.modulesPagination,
    viewModeToggle,changerViewer,
    debouncedSearch,
    customerUserOpen, setCustomerUserOpen,
    customerUserData, setCustomerUserData,
    handleDelete, openDeleteDialog,
    openConfirmDialog, setOpenConfirmDialog

  }
}
