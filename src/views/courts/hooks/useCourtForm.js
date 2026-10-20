import { useState, useEffect, useCallback } from 'react'

import { useForm } from 'react-hook-form'

import { uploadCourtImage } from '../api'

const ENDPOINT = (process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT || '').replace(/\/+$/, '')

const resolveImageSrc = value => {
  if (!value) return ''
  if (/^(https?:|blob:|data:)/i.test(value)) return value
  if (!ENDPOINT) return ''

  return `${ENDPOINT}/${String(value).replace(/^\/+/, '')}`
}

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
  encargado_usuario_id: ''
})

/*_____________________________________
│ HOOK: useCourtForm                   │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const useCourtForm = ({ dataProp, addOrUpdateCourt, handleSetDefautProps, branchesList, courtTypesList }) => {
  const isEditMode = dataProp?.action === 'edit'
  const courtData = dataProp?.data

  const {
    control,
    handleSubmit,
    setValue,
    register,
    getValues,
    trigger,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: getDefaultValues()
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const imagenValue = watch('imagen')

  const buildJsonData = useCallback(formData => {
    const dataToSend = {}

    Object.entries(formData).forEach(([key, value]) => {
      if (['descripcion', 'imagen'].includes(key) && (value === '' || value === null || value === undefined)) {
        dataToSend[key] = null

        return
      }

      if (key === 'capacidad') {
        if (value === '' || value === null || value === undefined) {
          dataToSend[key] = null
        } else {
          dataToSend[key] = Number(value)
        }

        return
      }

      if (key === 'estado') {
        dataToSend[key] = Boolean(value)

        return
      }

      if (key === 'sede_id') {
        dataToSend[key] = Number(value)

        return
      }

      if (key === 'court_type_id') {
        if (value === '' || value === null || value === undefined) {
          dataToSend[key] = null
        } else {
          dataToSend[key] = Number(value)
        }

        return
      }

      if (key === 'encargado_usuario_id') {
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

  const handleImageInputChange = useCallback(
    async event => {
      const input = event.target
      const file = input.files?.[0]

      if (!file) return

      if (!/^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)) {
        alert('Solo se permiten imágenes JPG, PNG, WEBP o GIF.')
        input.value = ''

        return
      }

      if (file.size > 800 * 1024) {
        alert('La imagen no puede superar 800 KB.')
        input.value = ''

        return
      }

      const localUrl = URL.createObjectURL(file)

      setImagePreview(localUrl)
      setIsUploadingImage(true)

      try {
        const { objectKey } = await uploadCourtImage(file)

        setValue('imagen', objectKey, { shouldDirty: true })
      } catch (error) {
        console.error('Error subiendo imagen de cancha:', error)
        setImagePreview(resolveImageSrc(courtData?.imagen))
        setValue('imagen', courtData?.imagen || null)
        alert(error?.message || 'Error subiendo la imagen. Intenta de nuevo.')
      } finally {
        setIsUploadingImage(false)
        input.value = ''
      }
    },
    [setValue, courtData?.imagen]
  )

  const handleImageReset = useCallback(() => {
    setImagePreview('')
    setValue('imagen', null, { shouldDirty: true })
  }, [setValue])

  const onSubmit = useCallback(
    async formData => {
      try {
        setIsSubmitting(true)

        const dataToSend = buildJsonData(formData)

        await addOrUpdateCourt({
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
    },
    [buildJsonData, addOrUpdateCourt, isEditMode, courtData?.id, handleSetDefautProps]
  )

  const resetForm = useCallback(() => {
    reset(getDefaultValues())
    setImagePreview('')
  }, [reset])

  useEffect(() => {
    if (isEditMode && courtData) {
      reset({
        sede_id: courtData.sede_id != null ? Number(courtData.sede_id) : '',
        nombre: courtData.nombre || '',
        court_type_id: courtData.court_type_id ?? '',
        capacidad: courtData.capacidad || null,
        estado: courtData.estado !== undefined ? courtData.estado : true,
        descripcion: courtData.descripcion || '',
        imagen: courtData.imagen || null,
        encargado_usuario_id:
          courtData.encargado_usuario_id != null
            ? Number(courtData.encargado_usuario_id)
            : courtData.Encargado?.id != null
              ? Number(courtData.Encargado.id)
              : ''
      })
      setImagePreview(resolveImageSrc(courtData.imagen))

      return
    }

    if (!isEditMode) {
      resetForm()
    }
  }, [isEditMode, courtData, reset, resetForm])

  useEffect(() => {
    if (isEditMode) return
    if (!Array.isArray(branchesList) || branchesList.length !== 1) return

    const current = getValues('sede_id')

    if (current === '' || current == null) {
      setValue('sede_id', Number(branchesList[0].id))
    }
  }, [isEditMode, branchesList, getValues, setValue])

  return {
    control,
    handleSubmit,
    setValue,
    register,
    getValues,
    trigger,
    errors,
    reset,
    isSubmitting,
    setIsSubmitting,
    isUploadingImage,
    isEditMode,
    imagePreview: imagePreview || resolveImageSrc(imagenValue),
    handleImageInputChange,
    handleImageReset,
    onSubmit,
    resetForm,
    buildJsonData
  }
}
