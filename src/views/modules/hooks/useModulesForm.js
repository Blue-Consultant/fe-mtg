import { useState, useEffect } from 'react'

import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'

import { notificationErrorMessage } from '@/components/ToastNotification'
import { validateDescripcion, validateLink, validateName, validateOrder } from '../functions/validate_form'
import { createModuleThunk, updateModuleThunk } from '@/redux-store/thunks/modulesThunk'

export const useModulesForm = (customerUserData, handleClose, fetchModulesData) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      translate: '',
      icon: '',
      descripcion: '',
      link: '',
      order: '',
      status: true
    },
    mode: 'onBlur'
  })

  useEffect(() => {
    if (customerUserData?.action === 'Update' && customerUserData.data) {
      reset({
        name: customerUserData.data.name || '',
        descripcion: customerUserData.data.descripcion || '',
        icon: customerUserData.data.icon || '',
        link: customerUserData.data.link || '',
        order: customerUserData.data.order || '',
        translate: customerUserData.data.translate || '',
        status: customerUserData.data.status ?? true
      })
    } else if (customerUserData?.action === 'Create') {
      reset({
        name: '',
        descripcion: '',
        icon: '',
        link: '',
        order: '',
        translate: '',
        status: true
      })
    }
  }, [customerUserData, reset])

  const onSubmit = async data => {
    const validations = [
      validateName(data.name),
      validateDescripcion(data.descripcion),
      validateLink(data.link),
      validateName(data.translate),
      validateOrder(data.order)
    ]

    const firstError = validations.find(Boolean)

    if (firstError) {
      notificationErrorMessage(firstError)

      return
    }

    try {
      setIsLoading(true)

      // Limpiar y transformar los datos antes de enviar
      const cleanedData = {
        name: data.name,
        descripcion: data.descripcion || undefined,
        icon: data.icon || undefined,
        link: data.link,
        order: data.order ? Number(data.order) : undefined,
        translate: data.translate,
        status: data.status
      }

      if (customerUserData?.action === 'Update') {
        await dispatch(
          updateModuleThunk({
            moduleId: customerUserData.data.id,
            module: cleanedData
          })
        )
        fetchModulesData()
      } else {
        await dispatch(createModuleThunk({ module: cleanedData }))
      }

      reset()
      handleClose()
    } catch (error) {
      console.error('Error al guardar el módulo:', error)
      notificationErrorMessage('Hubo un error al guardar el módulo.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    control,
    errors,
    handleSubmit: handleSubmit(onSubmit),
    isLoading,
    reset
  }
}
