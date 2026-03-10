import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { createSubModuleThunk, updateSubModuleThunk } from '@/redux-store/thunks/sub-modulesThunk';
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification';
import { validateIcon, validateLink, validateName, validateOrder } from '../functions/validate_form';
import { createView } from '@/services/folder-generator';

export const useSubModulesForm = (customerUserData, handleClose, fetchSubModulesData) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      module_id: '',
      name: '',
      icon: '',
      link: '',
      order: '',
      translate: '',
      status: true,
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (customerUserData?.action === 'Update' && customerUserData.data) {
      reset({
        name: customerUserData.data.name || '',
        icon: customerUserData.data.icon || '',
        link: customerUserData.data.link || '',
        order: customerUserData.data.order || '',
        translate: customerUserData.data.translate || '',
        status: customerUserData.data.status ?? true,
        module_id: customerUserData.data.module_id ? Number(customerUserData.data.module_id) : '',
      });
    } else if (customerUserData?.action === 'Create') {
      reset({
        name: '',
        icon: '',
        link: '',
        order: '',
        translate: '',
        status: true,
        module_id: '',
      });
    }
  }, [customerUserData, reset]);

  const onSubmit = async (data) => {
    const validations = [
      validateName(data.name),
      validateLink(data.link),
      validateIcon(data.icon),
      validateName(data.translate),
      validateOrder(data.order),
    ];

    const firstError = validations.find(Boolean);
    if (firstError) {
      notificationErrorMessage(firstError);
      return;
    }

    try {
      setIsLoading(true);

      // Preparar los datos asegurando tipos correctos
      const submittedData = {
        ...data,
        module_id: Number(data.module_id),
        order: Number(data.order)
      };

      if (customerUserData?.action === 'Update') {
        await dispatch(updateSubModuleThunk({
          subModuleId: customerUserData.data.id,
          subModule: submittedData,
        }));
        fetchSubModulesData()
      } else {
        await dispatch(createSubModuleThunk(submittedData));
        fetchSubModulesData()
        const response = await createView(submittedData.name, submittedData.link)
        console.log('response createView', response)
      }

      reset();
      handleClose();
    } catch (error) {
      console.error('Error al guardar submódulo:', error);
      notificationErrorMessage('Hubo un error al guardar el submódulo.');
    } finally {
      setIsLoading(false);
    }
  };
    return {
      control,
      errors,
      handleSubmit: handleSubmit(onSubmit),
      isLoading,
      reset,
    };
};
