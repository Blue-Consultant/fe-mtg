import { useEffect, useState, useCallback } from 'react'

import { useDispatch, useSelector } from 'react-redux'

import { setCourtTypesList, addCourtType, updateCourtType, deleteCourtType } from '@/redux-store/slices/court-types'
import {
  getCourtTypes,
  createCourtType,
  updateCourtType as updateCourtTypeApi,
  deleteCourtType as deleteCourtTypeApi
} from '../api'

export const useCourtTypesClient = dictionary => {
  const dispatch = useDispatch()
  const courtTypesReducer = useSelector(state => state.courtTypesReducer)
  const [loading, setLoading] = useState(false)
  const [showform, setShowform] = useState(false)
  const [dataProp, setDataProp] = useState({ action: '', data: null })
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const fetchCourtTypes = useCallback(
    async (activeOnly = false) => {
      setLoading(true)

      try {
        const list = await getCourtTypes(activeOnly)

        dispatch(setCourtTypesList(Array.isArray(list) ? list : []))
      } catch (e) {
        console.error('fetchCourtTypes', e)
      } finally {
        setLoading(false)
      }
    },
    [dispatch]
  )

  const handleSetDefautProps = useCallback(() => {
    setShowform(false)
    setDataProp({ action: '', data: null })
  }, [])

  const addOrUpdateCourtType = useCallback(
    async ({ payload, isEditMode, id }) => {
      if (isEditMode && id) {
        const updated = await updateCourtTypeApi(id, payload)

        if (updated) dispatch(updateCourtType(updated))

        return updated
      } else {
        const created = await createCourtType(payload)

        if (created) dispatch(addCourtType(created))

        return created
      }
    },
    [dispatch]
  )

  const deactivateCourtType = useCallback(
    async isConfirmed => {
      if (!isConfirmed || !dataProp.data) return
      const id = typeof dataProp.data === 'number' ? dataProp.data : dataProp.data?.id

      if (!id) return

      try {
        await deleteCourtTypeApi(id)
        dispatch(deleteCourtType(id))
      } catch (e) {
        console.error('deactivateCourtType', e)
      }
    },
    [dataProp.data, dispatch]
  )

  useEffect(() => {
    fetchCourtTypes(false)
  }, [fetchCourtTypes])

  return {
    dictionary,
    courtTypesReducer,
    loading,
    showform,
    setShowform,
    dataProp,
    setDataProp,
    openConfirmDialog,
    setOpenConfirmDialog,
    handleSetDefautProps,
    addOrUpdateCourtType,
    deactivateCourtType,
    fetchCourtTypes
  }
}
