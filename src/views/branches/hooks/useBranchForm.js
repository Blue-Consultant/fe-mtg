import { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { updateCompaniesPagination } from '@/redux-store/slices/companies'
import { startUpload, uploadToS3 } from '../api'

const NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT = process.env.NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT

/*_____________________________________
│ HELPER FUNCTIONS                     │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const getAvatarSrcValidator = (img) => {
  const allowedAvatars = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png']

  if (!img) return '/images/avatars/1.png'
  // URL absoluta http/https
  if (/^https?:\/\//i.test(img)) return img
  // URL local en memoria (preview con URL.createObjectURL)
  if (img.startsWith('blob:')) return img
  // Base64
  if (img.startsWith('data:')) return img
  if (img.startsWith('/')) return img
  if (allowedAvatars.includes(img)) return `/images/avatars/${img}`

  const sanitizedBase = NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT?.replace(/\/$/, '')
  const sanitizedKey = img.replace(/^\//, '')

  if (sanitizedBase) return `${sanitizedBase}/${sanitizedKey}`

  return img
}

export const getLogoKey = (value) => {
  if (!value) return ''
  const base = NEXT_PUBLIC_AWS_BUCKET_ORIGIN_ENDPOINT?.replace(/\/$/, '')

  if (/^https?:\/\//i.test(value)) {
    if (base && value.startsWith(base)) {
      return value.replace(`${base}/`, '')
    }
    return value
  }

  return value.replace(/^\//, '')
}

/*_____________________________________
│ CONVERT FILE TO BASE64               │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
const fileToBase64 = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo no es una imagen'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Redimensionar si es muy grande
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir a base64
        const base64 = canvas.toDataURL('image/jpeg', quality)

        // Calcular tamaños
        const originalSizeKB = (file.size / 1024).toFixed(0)
        const base64SizeKB = ((base64.length * 3) / 4 / 1024).toFixed(0)

        console.log(`📦 Compresión: ${originalSizeKB}KB → ${base64SizeKB}KB (base64)`)

        resolve(base64)
      }
      img.onerror = () => reject(new Error('Error al cargar la imagen'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo'))
    reader.readAsDataURL(file)
  })
}

/*_____________________________________
│ DEFAULT FORM VALUES                  │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
const getDefaultValues = (userData) => ({
  is_headquarters: false,
  name: '',
  company_name: '',
  email: '',
  phone_number: '',
  address: '',
  city: '',
  postal_code: '',
  country: '',
  parent_venue_id: '',
  domain: '',
  logo: '',
  user_id: userData?.id || '',
  status_conditions_id: 1,
  venue_settings: {
    public_holidays: [],
    periodic_event_restrictions: 3,
    notification_time_before_class: 0,
    notification_time_after_class: 0,
    reset_warnings: 30
  }
})

/*_____________________________________
│ HOOK: useBranchForm                  │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const useBranchForm = ({ dataProp, usuario, addOrUpdateBranch, handleSetDefautProps, branchShortList }) => {
  const isEditMode = dataProp?.action === 'edit'
  const branchData = dataProp?.data
  const dispatch = useDispatch()

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
    watch
  } = useForm({
    defaultValues: getDefaultValues(usuario)
  })

  /*_____________________________________
  │ LOCAL STATE                          │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const [fileInput, setFileInput] = useState(null)
  const [isDisabled, setIsDisabled] = useState(false)
  const [imgSrc, setImgSrc] = useState('/images/logos/logomtg2.png')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingLogoKey, setUploadingLogoKey] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const initialLogoRef = useRef('')

  const isHeadquarters = watch('is_headquarters')

  /*_____________________________________
  │ HANDLE FILE INPUT CHANGE             │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleFileInputChange = useCallback(async (event) => {
    const { files } = event.target
    if (!files || files.length === 0) return

    const file = files[0]

    try {
      // Preview rápida local
      const objectUrl = URL.createObjectURL(file)
      setImgSrc(objectUrl)
      setFileInput(file)
      setLogoPreview(objectUrl)

      // Subir a S3 usando presigned URL (como en levels)
      const { objectKey, uploadUrl } = await startUpload(file.name, file.type)
      await uploadToS3(uploadUrl, file)

      // Guardar solo el objectKey (ruta en el bucket) para enviar al backend
      setUploadingLogoKey(objectKey)
      setValue('logo', objectKey)

      console.log('✅ Logo subido a S3 con presigned URL:', objectKey)
    } catch (error) {
      console.error('❌ Error subiendo logo a S3:', error)
      alert('Error subiendo la imagen. Por favor intenta de nuevo.')
    }
  }, [setValue, isEditMode, branchData, dispatch])

  /*_____________________________________
  │ HANDLE FILE INPUT RESET              │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const handleFileInputReset = useCallback(() => {
    setFileInput('')
    setUploadingLogoKey(null)
    setLogoPreview(null)
    setImgSrc(branchData?.logo || '/images/logos/logomtg2.png')
    if (isEditMode) {
      setValue('logo', initialLogoRef.current)
    } else {
      setValue('logo', '')
    }
  }, [branchData?.logo, isEditMode, setValue])

  /*_____________________________________
  │ BUILD JSON DATA                      │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const buildJsonData = useCallback((formData) => {
    const excludeKeys = isEditMode
      ? ['venue_settings', 'status', 'logo'] // En edición, mantener user_id y status_conditions_id
      : ['venue_settings', 'status', 'logo'] // En creación, también mantenerlos

    const dataToSend = {}

    // Campos requeridos que siempre deben enviarse
    // En modo edición, NO incluir user_id ni status_conditions_id (no son parte del DTO de actualización)
    if (!isEditMode) {
      // En modo creación, estos campos son requeridos
      dataToSend.user_id = Number(formData.user_id || usuario?.id)
      dataToSend.status_conditions_id = Number(formData.status_conditions_id || 1) // Default: 1 (pendiente)
    }
    // En modo edición, no incluimos user_id ni status_conditions_id porque no son parte del DTO de actualización

    // Solo enviar rol_id en modo creación si existe
    // Si no existe, el backend buscará el rol de Propietario automáticamente
    if (!isEditMode) {
      // Buscar el rol_id del usuario en sus sucursales
      const rolId = usuario?.SportsVenueUsers?.[0]?.rol_id
      if (rolId && Number(rolId)) {
        dataToSend.rol_id = Number(rolId)
      }
      // Si no hay rol_id, no lo enviamos para que el backend use su lógica por defecto
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (excludeKeys.includes(key)) return

      // Convertir strings vacíos en null para campos opcionales
      if (key === 'parent_venue_id') {
        if (value === '' || value === null || value === undefined) {
          dataToSend[key] = null
        } else {
          dataToSend[key] = Number(value)
        }
        return
      }

      // Convertir campos opcionales vacíos a null
      if (['address', 'city', 'postal_code', 'country', 'domain'].includes(key)) {
        if (value === '' || value === null || value === undefined) {
          dataToSend[key] = null
        } else {
          dataToSend[key] = value
        }
        return
      }

      // Asegurar que is_headquarters sea boolean
      if (key === 'is_headquarters') {
        dataToSend[key] = Boolean(value)
        return
      }

      // Asegurar que postal_code sea string o null
      if (key === 'postal_code' && value !== null && value !== undefined) {
        dataToSend[key] = String(value)
        return
      }

      dataToSend[key] = value
    })

    // Preferir flujo moderno: logo ya subido a S3 vía presigned URL
    if (uploadingLogoKey) {
      dataToSend.logo = uploadingLogoKey
    }
    // Si no hay upload nuevo pero hay logo existente, mantenerlo
    else if (initialLogoRef.current) {
      dataToSend.logo = getLogoKey(initialLogoRef.current)
    }
    // Si no hay logo, enviar null
    else if (!dataToSend.logo) {
      dataToSend.logo = null
    }

    // Enviar venue_settings como objeto JSON
    // Asegurar que los valores numéricos sean números
    if (formData.venue_settings) {
      dataToSend.venue_settings = {
        ...formData.venue_settings,
        periodic_event_restrictions: Number(formData.venue_settings.periodic_event_restrictions) || 3,
        notification_time_before_class: Number(formData.venue_settings.notification_time_before_class) || 0,
        notification_time_after_class: Number(formData.venue_settings.notification_time_after_class) || 0,
        reset_warnings: Number(formData.venue_settings.reset_warnings) || 30,
        public_holidays: Array.isArray(formData.venue_settings.public_holidays)
          ? formData.venue_settings.public_holidays
          : []
      }
    }

    // Validar campos requeridos antes de enviar
    // En modo edición, user_id y status_conditions_id no son requeridos para la actualización
    const requiredFields = isEditMode
      ? ['is_headquarters', 'phone_number', 'email', 'name', 'company_name'] // En edición, no requerir user_id ni status_conditions_id
      : ['user_id', 'is_headquarters', 'phone_number', 'email', 'name', 'company_name', 'status_conditions_id'] // En creación, todos son requeridos

    const missingFields = requiredFields.filter(field => {
      const value = dataToSend[field]
      return value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value))
    })

    if (missingFields.length > 0) {
      console.error('❌ Campos requeridos faltantes:', missingFields)
      console.error('📋 Datos actuales:', dataToSend)
      throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`)
    }

    // Log para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 Datos a enviar al backend:', JSON.stringify(dataToSend, null, 2))
    }

    return dataToSend
  }, [isEditMode, usuario, uploadingLogoKey])

  /*_____________________________________
  │ ON SUBMIT                            │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const onSubmit = useCallback(async (formData) => {
    try {
      const startTotal = performance.now()
      console.log('⏱️ [START] Iniciando submit...')

      setIsSubmitting(true)

      // 1. Build JSON data (incluye base64 si hay imagen nueva)
      let t1 = performance.now()
      const dataToSend = buildJsonData(formData)
      console.log(`⏱️ [1] buildJsonData: ${(performance.now() - t1).toFixed(0)}ms`)

      // 2. API call (create/update)
      t1 = performance.now()
      const result = await addOrUpdateBranch({
        formData: dataToSend,
        isEditMode,
        branchId: branchData?.id
      })
      console.log(`⏱️ [2] addOrUpdateBranch (API): ${(performance.now() - t1).toFixed(0)}ms`)

      // 2.1. Después de guardar, aplicar preview local (tanto para crear como editar)
      if (result?.id && logoPreview) {
        dispatch(updateCompaniesPagination({ id: result.id, logoPreview }))
      }

      // 3. Limpiar y cerrar
      t1 = performance.now()
      setUploadingLogoKey(null)
      handleSetDefautProps()
      console.log(`⏱️ [3] handleSetDefautProps: ${(performance.now() - t1).toFixed(0)}ms`)

      console.log(`⏱️ [TOTAL] Tiempo total: ${(performance.now() - startTotal).toFixed(0)}ms`)
    } catch (error) {
      console.error('Error saving branch:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [buildJsonData, addOrUpdateBranch, isEditMode, branchData?.id, handleSetDefautProps, logoPreview, dispatch])

  /*_____________________________________
  │ RESET FORM                           │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  const resetForm = useCallback(() => {
    reset(getDefaultValues(usuario))
    setImgSrc('/images/logos/logomtg2.png')
    setFileInput('')
    setUploadingLogoKey(null)
    setLogoPreview(null)
    initialLogoRef.current = ''
  }, [reset, usuario])

  /*_____________________________________
  │ EFFECTS                              │
  ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
  // Effect: Load data when editing
  useEffect(() => {
    if (isEditMode && branchData) {
      const settingsBranch = branchData.venue_settings || {}
      setImgSrc(branchData.logo || '/images/logos/logomtg2.png')
      setFileInput('')
      setLogoPreview(null)
      initialLogoRef.current = getLogoKey(branchData.logo)
      reset({
        is_headquarters: branchData.is_headquarters,
        name: branchData.name,
        company_name: branchData.company_name,
        email: branchData.email,
        phone_number: branchData.phone_number,
        address: branchData.address,
        city: branchData.city,
        postal_code: branchData.postal_code,
        country: branchData.country,
        parent_venue_id: branchData.parent_venue_id || '',
        domain: branchData.domain,
        logo: getLogoKey(branchData.logo),
        user_id: branchData.user_id,
        status_conditions_id: branchData.status_conditions_id,
        venue_settings: {
          public_holidays: settingsBranch.public_holidays || [],
          periodic_event_restrictions: settingsBranch.periodic_event_restrictions ?? 3,
          notification_time_before_class: settingsBranch.notification_time_before_class ?? 0,
          notification_time_after_class: settingsBranch.notification_time_after_class ?? 0,
          reset_warnings: settingsBranch.reset_warnings ?? 30
        }
      })
    }

    if (!isEditMode) {
      resetForm()
    }
  }, [isEditMode, branchData, reset, resetForm])

  // Effect: Disable headquarters switch if no branches
  useEffect(() => {
    if (!Array.isArray(branchShortList) || branchShortList.length === 0) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [branchShortList])

  // Effect: Clear parent_venue_id when not headquarters
  useEffect(() => {
    if (!isHeadquarters) {
      setValue('parent_venue_id', '')
    }
  }, [isHeadquarters, setValue])

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
    watch,

    // State
    fileInput,
    isDisabled,
    imgSrc,
    isSubmitting,
    isEditMode,
    isHeadquarters,

    // Methods
    handleFileInputChange,
    handleFileInputReset,
    onSubmit,
    resetForm,

    // Helpers
    getAvatarSrcValidator,
    getLogoKey,
  }
}

