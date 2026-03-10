import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'

/*_____________________________________
│ DEFAULT FORM VALUES                  │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
const getDefaultValues = () => ({
  cancha_id: '',
  dia_semana: 0, // edit: un solo día
  dias_semana: [], // create: varios días [1,2,3,4,5,6]
  hora_inicio: '08:00',
  hora_fin: '09:00',
  precio: 0,
  estado: true,
})

/*_____________________________________
│ HOOK: usePriceScheduleForm            │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const usePriceScheduleForm = ({ dataProp, addOrUpdatePriceSchedule, handleSetDefautProps, courtsList }) => {
  const isEditMode = dataProp?.action === 'edit'
  const priceScheduleData = dataProp?.data

  /*_____________________________________
  │ FORM HOOK                            │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
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

  /*_____________________________________
  │ LOCAL STATE                          │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const [isSubmitting, setIsSubmitting] = useState(false)

  /*_____________________________________
  │ BUILD JSON DATA                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const buildJsonData = useCallback((formData) => {
    const dataToSend = {
      cancha_id: Number(formData.cancha_id),
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      precio: Number(formData.precio) || 0,
      estado: Boolean(formData.estado)
    }

    if (isEditMode) {
      dataToSend.dia_semana = Number(formData.dia_semana)
    } else {
      // Crear: enviar array de días (dias_semana del form → dia_semana para API)
      const dias = Array.isArray(formData.dias_semana) ? formData.dias_semana : []
      dataToSend.dia_semana = dias.map(d => Number(d))
    }

    return dataToSend
  }, [isEditMode])

  /*_____________________________________
  │ ON SUBMIT                            │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const onSubmit = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)

      const dataToSend = buildJsonData(formData)

      const result = await addOrUpdatePriceSchedule({
        formData: dataToSend,
        isEditMode,
        priceScheduleId: priceScheduleData?.id
      })

      handleSetDefautProps()
    } catch (error) {
      console.error('Error saving price schedule:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [buildJsonData, addOrUpdatePriceSchedule, isEditMode, priceScheduleData?.id, handleSetDefautProps])

  /*_____________________________________
  │ RESET FORM                           │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const resetForm = useCallback(() => {
    reset(getDefaultValues())
  }, [reset])

  /*_____________________________________
  │ EFFECTS                              │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  useEffect(() => {
    if (isEditMode && priceScheduleData) {
      reset({
        cancha_id: priceScheduleData.cancha_id || '',
        dia_semana: priceScheduleData.dia_semana ?? 0,
        dias_semana: [],
        hora_inicio: priceScheduleData.hora_inicio || '08:00',
        hora_fin: priceScheduleData.hora_fin || '09:00',
        precio: priceScheduleData.precio ? Number(priceScheduleData.precio) : 0,
        estado: priceScheduleData.estado !== undefined ? priceScheduleData.estado : true,
      })
    }

    if (!isEditMode) {
      resetForm()
    }
  }, [isEditMode, priceScheduleData, reset, resetForm])

  /*_____________________________________
  │ RETURN                               │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  return {
    // Form
    control,
    handleSubmit,
    setValue,
    register,
    errors,
    reset,

    // State
    isSubmitting,
    isEditMode,

    // Methods
    onSubmit,
    resetForm,
  }
}
