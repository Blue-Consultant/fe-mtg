import { useEffect, useState, useMemo, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import { debounce } from 'lodash';
import { fetchSubModulesPaginationThunks, deleteSubModuleThunk } from "@/redux-store/thunks/sub-modulesThunk"
import { fetchModulesThunks } from "@/redux-store/thunks/modulesThunk"
// Configura el socket una sola vez
const socket = io(process.env.NEXT_PUBLIC_SERVER_API, {
  transports: ["websocket"],
  reconnectionAttempts: 5,
  timeout: 20000,
})

export const useSubModules = (dictionary) => {
  const dispatch = useDispatch()
  const userDataReducer = useSelector((state) => state.loginReducer.user)
  const subModulesReducer = useSelector((state) => state.subModule)
  const [viewModeToggle, setViewModeToggle] = useState(false);
  const [modulesList, setModulesList] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState('')
  const [customerUserOpen, setCustomerUserOpen] = useState(false)
  const [customerUserData, setCustomerUserData] = useState({ data: {}, action: '' })
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [valuesPagination, setValuesPagination] = useState({
    searchValue: "",
    currentPage: 1,
    pageSize: 8,
    totalPages: 1,
    orderBy: "id",
    orderByMode: "desc",
    custom_value: undefined,
  })

  //agregado reciente
  const handleSelectFilterChange = event => {
    const value = event.target.value
    setSelectedBranch(value)
    setValuesPagination(prevState => ({
      ...prevState,
      custom_value: value === 'all' ? undefined : Number(value),
      currentPage: 1
    }))
  }

  const debouncedSearch = useCallback(
    debounce(value => {
      setSelectedBranch('')
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
    if (subModulesReducer.subModulesPagination?.totalRows && valuesPagination.pageSize) {
      setValuesPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(
          subModulesReducer.subModulesPagination.totalRows / valuesPagination.pageSize
        )
      }))
    }
  }, [subModulesReducer.subModulesPagination?.totalRows, valuesPagination.pageSize])


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
  const fetchSubModulesData = useCallback(() => {
    if (!userDataReducer?.id) return
    try {
      setLoading(true)
      const { searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value } = valuesPagination
      const params = getParams(searchValue, currentPage, pageSize, orderBy, orderByMode, custom_value )

      dispatch(
        fetchSubModulesPaginationThunks({
          status: true,
          params,
        })
      )
    } catch (error) {
      console.error("Error fetching sub modules:", error)
    } finally {
      setLoading(false)
    }
  }, [dispatch, userDataReducer?.id, valuesPagination])

  /*_______________________________
  │   * INIT + SOCKET LISTENER     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    socket.on("notificationListening", fetchSubModulesData)
    return () => socket.off("notificationListening", fetchSubModulesData)
  }, [])

  useEffect(() => {
    fetchSubModulesData()
  }, [valuesPagination, userDataReducer?.id])

  /*_____________________
  │   * FETCH MODULES     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
  const fetchModulesData = async () => {
    try {
      const modulesData = await dispatch(
        fetchModulesThunks({ status: true })
      )
      setModulesList(modulesData || [])
    } catch (error) {
      setModulesList([])
    }
  }

  if (userDataReducer?.id) {
    fetchModulesData()
  }
}, [userDataReducer?.id, dispatch])


  const handleDelete = async isConfirmed => {
    if (isConfirmed && selectedId) {
      try {
        await dispatch(deleteSubModuleThunk(selectedId))

        const totalRowsAfterDelete = subModulesReducer.subModulesPagination.totalRows - 1
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
          fetchSubModulesData()
        }
      } catch (error) {
        console.error("Error al eliminar submódulo: ", error)
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
    // branchList,
    modulesList,
    loading,
    valuesPagination,fetchSubModulesData,
    setValuesPagination,
    subModulesPagination: subModulesReducer.subModulesPagination,
    viewModeToggle,changerViewer,
    selectedBranch, setSelectedBranch,
    handleSelectFilterChange, debouncedSearch,
    customerUserOpen, setCustomerUserOpen,
    customerUserData, setCustomerUserData,
    handleDelete, openDeleteDialog,
    openConfirmDialog, setOpenConfirmDialog

  }
}
