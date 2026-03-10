import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'

const getDefaultValues = () => ({
  cancha_id: '',
  puntuacion: 5,
  comentario: '',
})

export const useRatingForm = ({ dataProp, addOrUpdateRating, handleSetDefautProps, courtsList, usuario }) => {
  const isEditMode = dataProp?.action === 'edit'
  const ratingData = dataProp?.data

  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: getDefaultValues()
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const buildJsonData = useCallback((formData) => {
    if (isEditMode) {
      // Update: solo enviar campos que acepta el backend (no usuario_id)
      return {
        cancha_id: Number(formData.cancha_id),
        puntuacion: Number(formData.puntuacion),
        comentario: formData.comentario?.trim() || null,
      }
    }
    // Create: incluir usuario_id
    return {
      usuario_id: Number(usuario?.id),
      cancha_id: Number(formData.cancha_id),
      puntuacion: Number(formData.puntuacion),
      comentario: formData.comentario?.trim() || null,
    }
  }, [isEditMode, usuario?.id])

  const onSubmit = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)
      const dataToSend = buildJsonData({ ...formData, usuario_id: ratingData?.usuario_id })
      await addOrUpdateRating({
        formData: dataToSend,
        isEditMode,
        ratingId: ratingData?.id
      })
      handleSetDefautProps()
    } catch (error) {
      console.error('Error saving rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [buildJsonData, addOrUpdateRating, isEditMode, ratingData?.id, ratingData?.usuario_id, handleSetDefautProps])

  const resetForm = useCallback(() => {
    reset(getDefaultValues())
  }, [reset])

  useEffect(() => {
    if (isEditMode && ratingData) {
      reset({
        cancha_id: ratingData.cancha_id || '',
        puntuacion: ratingData.puntuacion ?? 5,
        comentario: ratingData.comentario || '',
      })
    } else {
      resetForm()
    }
  }, [isEditMode, ratingData, reset, resetForm])

  return {
    control,
    handleSubmit,
    setValue,
    register,
    errors,
    reset,
    isSubmitting,
    isEditMode,
    onSubmit,
    resetForm,
  }
}
