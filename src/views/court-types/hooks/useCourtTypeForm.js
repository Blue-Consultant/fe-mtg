import { useState, useEffect, useCallback } from 'react'

import { useForm } from 'react-hook-form'

const getDefaultValues = () => ({
  nombre: '',
  descripcion: '',
  estado: true
})

export const useCourtTypeForm = ({ dataProp, addOrUpdateCourtType, handleSetDefautProps }) => {
  const isEditMode = dataProp?.action === 'edit'
  const typeData = dataProp?.data

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    reset
  } = useForm({ defaultValues: getDefaultValues() })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildPayload = useCallback(
    formData => {
      const payload = {
        nombre: formData.nombre?.trim() || '',
        descripcion: formData.descripcion?.trim() || null
      }

      if (isEditMode) {
        payload.estado = Boolean(formData.estado)
      }

      return payload
    },
    [isEditMode]
  )

  const onSubmit = useCallback(
    async formData => {
      try {
        setIsSubmitting(true)
        const payload = buildPayload(formData)

        await addOrUpdateCourtType({
          payload,
          isEditMode,
          id: typeData?.id
        })
        handleSetDefautProps()
      } catch (err) {
        console.error('Error saving court type:', err)
      } finally {
        setIsSubmitting(false)
      }
    },
    [buildPayload, addOrUpdateCourtType, isEditMode, typeData?.id, handleSetDefautProps]
  )

  const resetForm = useCallback(() => reset(getDefaultValues()), [reset])

  useEffect(() => {
    if (isEditMode && typeData) {
      reset({
        nombre: typeData.nombre || '',
        descripcion: typeData.descripcion || '',
        estado: typeData.estado !== undefined ? typeData.estado : true
      })
    } else {
      resetForm()
    }
  }, [isEditMode, typeData, reset, resetForm])

  return {
    control,
    handleSubmit,
    register,
    errors,
    reset,
    isSubmitting,
    isEditMode,
    onSubmit,
    resetForm
  }
}
