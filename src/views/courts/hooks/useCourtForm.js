import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'

/*_____________________________________
│ DEFAULT FORM VALUES                  │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
const getDefaultValues = () => ({
  sede_id: '',
  nombre: '',
  court_type_id: '',
  capacidad: null,
  estado: true,
  descripcion: '',
  imagen: null,
})

/*_____________________________________
│ HOOK: useCourtForm                   │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const useCourtForm = ({ dataProp, addOrUpdateCourt, handleSetDefautProps, branchesList, courtTypesList }) => {
  const isEditMode = dataProp?.action === 'edit'
  const courtData = dataProp?.data

  /*_____________________________________
  │ FORM HOOK                            │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const {
    control,
    handleSubmit,
    setValue,
    register,
    getValues,
    trigger,
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
    const dataToSend = {}

    Object.entries(formData).forEach(([key, value]) => {
      // Convertir strings vacíos en null para campos opcionales
      if (['descripcion', 'imagen'].includes(key) && (value === '' || value === null || value === undefined)) {
        dataToSend[key] = null
        return
      }

      // Convertir capacidad a número o null
      if (key === 'capacidad') {
        if (value === '' || value === null || value === undefined) {
          dataToSend[key] = null
        } else {
          dataToSend[key] = Number(value)
        }
        return
      }

      // Asegurar que estado sea boolean
      if (key === 'estado') {
        dataToSend[key] = Boolean(value)
        return
      }

      // Asegurar que sede_id sea número
      if (key === 'sede_id') {
        dataToSend[key] = Number(value)
        return
      }

      // court_type_id: número o null
      if (key === 'court_type_id') {
        if (value === '' || value === null || value === undefined) {
          dataToSend[key] = null
        } else {
          dataToSend[key] = Number(value)
        }
        return
      }

      dataToSend[key] = value
    })

    return dataToSend
  }, [])

  /*_____________________________________
  │ ON SUBMIT                            │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const onSubmit = useCallback(async (formData) => {
    try {
      setIsSubmitting(true)

      const dataToSend = buildJsonData(formData)

      const result = await addOrUpdateCourt({
        formData: dataToSend,
        isEditMode,
        courtId: courtData?.id
      })

      handleSetDefautProps()
    } catch (error) {
      console.error('Error saving court:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [buildJsonData, addOrUpdateCourt, isEditMode, courtData?.id, handleSetDefautProps])

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
    if (isEditMode && courtData) {
      reset({
        sede_id: courtData.sede_id || '',
        nombre: courtData.nombre || '',
        court_type_id: courtData.court_type_id ?? '',
        capacidad: courtData.capacidad || null,
        estado: courtData.estado !== undefined ? courtData.estado : true,
        descripcion: courtData.descripcion || '',
        imagen: courtData.imagen || null,
      })
    }

    if (!isEditMode) {
      resetForm()
    }
  }, [isEditMode, courtData, reset, resetForm])

  /*_____________________________________
  │ RETURN                               │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  return {
    // Form
    control,
    handleSubmit,
    setValue,
    register,
    getValues,
    trigger,
    errors,
    reset,

    // State
    isSubmitting,
    isEditMode,

    // Methods
    onSubmit,
    resetForm,
    buildJsonData,
  }
}
