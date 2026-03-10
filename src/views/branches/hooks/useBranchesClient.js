import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import usePagination from '@/hooks/usePagination'

// Redux Actions
import {
  setCompaniesPagination,
  addCompaniesPagination,
  updateCompaniesPagination,
  deleteCompanies,
} from '@/redux-store/slices/companies'

// API Methods
import {
  listBranchesByOwner,
  listBranchByIdWithPagination,
  deleteBranchUser,
  createBranch,
  updateBranch
} from '../api'


export const useBranchesClient = (dictionary) => {
  /*_____________________________________
  │ REDUX STATE                          │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const dispatch = useDispatch()
  const usuario = useSelector(state => state.loginReducer.user)
  const companiesReducer = useSelector(state => state.companiesReducer)

  /*_____________________________________
  │ LOCAL STATE - UI                     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const [showform, setShowform] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [isLoading, setIsLoading] = useState(false)
  const [branchShortList, setBranchShortList] = useState([])

  /*_____________________________________
  │ PAGINATION HOOK                     │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const {
    pagination,
    isReady: isPaginationReady,
    getParams,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = usePagination({
    pageSize: 5,
    orderBy: 'id',
    orderByMode: 'asc'
  })

  /*_____________________________________
  │ MEMOIZED VALUES                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const memoizedDictionary = useMemo(
    () => dictionary,
    [JSON.stringify(dictionary)]
  )

  /*_____________________________________
  │ GET BRANCHES DATA                    │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const getBranches = useCallback(async () => {
    if (!usuario?.id || !isPaginationReady) {
      console.warn('Usuario no autenticado')
      return
    }

    try {
      setIsLoading(true)
      const params = getParams(pagination)
      const branchesData = await listBranchByIdWithPagination(usuario.id, params)
      dispatch(setCompaniesPagination(branchesData))
    } catch (error) {
      console.error('Error fetching branches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [usuario?.id, isPaginationReady, pagination, getParams, dispatch])

  /*_____________________________________
  │ GET BRANCH OWNER LIST                │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const getBranchOwner = useCallback(async () => {
    if (!usuario?.id) return

    try {
      const dataBranchOwner = await listBranchesByOwner(usuario.id)
      if (!Array.isArray(dataBranchOwner)) {
        setBranchShortList([])
        return
      }

      const filterData = dataBranchOwner.filter(e => e.Branches.is_headquarters === false)
      setBranchShortList(filterData)
    } catch (error) {
      console.error('Error fetching branch owner:', error)
    }
  }, [usuario?.id])

  /*_____________________________________
  │ HANDLE SET DEFAULT PROPS             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleSetDefautProps = useCallback(() => {
    setShowform(false)
    setDataProp({ action: '', data: null })
  }, [])

  /*_____________________________________
  │ ADD OR UPDATE BRANCH                 │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const addOrUpdateBranch = useCallback(async ({ formData, isEditMode, branchId }) => {
    try {
      if (isEditMode && branchId) {
        const editData = await updateBranch(branchId, formData)
        if (editData) {
          dispatch(updateCompaniesPagination(editData))
        }
        return editData
      } else {
        // CREATE
        const createData = await createBranch(formData)
        if (createData) {
          dispatch(addCompaniesPagination(createData))
        }
        return createData
      }
    } catch (error) {
      console.error('Error saving branch:', error)
      throw error
    }
  }, [dispatch])

  /*_____________________________________
  │ DEACTIVATE BRANCHES                  │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const deactivateBranches = useCallback(async (isConfirmed) => {
    if (isConfirmed && dataProp.data) {
      try {
        await deleteBranchUser(dataProp.data)
        dispatch(deleteCompanies(dataProp.data.id))
      } catch (error) {
        console.error('Error deactivating branch:', error)
      }
    }
  }, [dataProp.data, dispatch])

  /*_____________________________________
  │ EFFECTS                              │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    if (!isPaginationReady || !usuario?.id) return
    getBranches()
  }, [isPaginationReady, usuario?.id, getBranches])

  useEffect(() => {
    getBranchOwner()
  }, [getBranchOwner])

  /*_____________________________________
  │ RETURN CONTROLLER OBJECT             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  return {
    // Dictionary
    memoizedDictionary,
    dictionary,

    // Redux State
    companiesReducer,
    usuario,

    // UI State
    loading: isLoading,
    showform,
    setShowform,

    // Form State
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,

    // Branch List
    branchShortList,

    // Pagination
    pagination,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,

    // Business Methods
    getBranches,
    getBranchOwner,
    handleSetDefautProps,
    addOrUpdateBranch,
    deactivateBranches,
  }
}
