import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'

const getDefaultValues = () => ({
  cancha_id: '',
  fecha_inicio_date: '',
  hora_inicio: '08:00',
  fecha_fin_date: '',
  hora_fin: '18:00',
  motivo: '',
  estado: true,
})

const formatDateLocal = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const formatTimeLocal = (date) => {
  if (!date) return '08:00'
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const useDateBlockForm = ({ dataProp, addOrUpdateDateBlock, handleSetDefautProps, courtsList }) => {
  const isEditMode = dataProp?.action === 'edit'
  const dateBlockData = dataProp?.data

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
    const dataToSend = {
      cancha_id: Number(formData.cancha_id),
      motivo: formData.motivo || null,
      estado: Boolean(formData.estado),
    }
    const fechaInicio = formData.fecha_inicio_date && formData.hora_inicio
      ? new Date(`${formData.fecha_inicio_date}T${formData.hora_inicio}:00`).toISOString()
      : null
    const fechaFin = formData.fecha_fin_date && formData.hora_fin
      ? new Date(`${formData.fecha_fin_date}T${formData.hora_fin}:00`).toISOString()
      : null
    dataToSend.fecha_inicio = fechaInicio
    dataToSend.fecha_fin = fechaFin
    return dataToSend
  }, [])

  const onSubmit = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)
      const dataToSend = buildJsonData(formData)
      await addOrUpdateDateBlock({
        formData: dataToSend,
        isEditMode,
        dateBlockId: dateBlockData?.id
      })
      handleSetDefautProps()
    } catch (error) {
      console.error('Error saving date block:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [buildJsonData, addOrUpdateDateBlock, isEditMode, dateBlockData?.id, handleSetDefautProps])

  const resetForm = useCallback(() => {
    reset(getDefaultValues())
  }, [reset])

  useEffect(() => {
    if (isEditMode && dateBlockData) {
      reset({
        cancha_id: dateBlockData.cancha_id || '',
        fecha_inicio_date: formatDateLocal(dateBlockData.fecha_inicio),
        hora_inicio: formatTimeLocal(dateBlockData.fecha_inicio),
        fecha_fin_date: formatDateLocal(dateBlockData.fecha_fin),
        hora_fin: formatTimeLocal(dateBlockData.fecha_fin),
        motivo: dateBlockData.motivo || '',
        estado: dateBlockData.estado !== undefined ? dateBlockData.estado : true,
      })
    } else {
      resetForm()
    }
  }, [isEditMode, dateBlockData, reset, resetForm])

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
