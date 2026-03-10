import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { notificationErrorMessage } from '@/components/ToastNotification';
import { validateDescription, validateName } from '../functions/validate_form';
import { createPermissionThunk, updatePermissionThunk } from '@/redux-store/thunks/permissionsThunks';

export const usePermissionsForm = (customerUserData, handleClose, fetchPermissionsData) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      status: true
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (customerUserData?.action === 'Update' && customerUserData.data) {
      reset({
        name: customerUserData.data.name || '',
        description: customerUserData.data.description || '',
        status: customerUserData.data.status ?? true,
      });
    } else if (customerUserData?.action === 'Create') {
      reset({
        name: '',
        description: '',
        status: true,
      });
    }
  }, [customerUserData, reset]);

  const onSubmit = async (data) => {
    if (!data.name || !data.name.trim()) {
      notificationErrorMessage('El nombre es obligatorio');
      return;
    }

    const validations = [
      validateName(data.name),
      validateDescription(data.description),
    ];

    const firstError = validations.find(Boolean);
    if (firstError) {
      notificationErrorMessage(firstError);
      return;
    }

    try {
      setIsLoading(true);

      if (customerUserData?.action === 'Update') {
        const updateData = {
          name: data.name.trim(),
          description: data.description?.trim() || '',
          status: data.status,
        };
        await dispatch(updatePermissionThunk(customerUserData.data.id, updateData));
      } else {
        const createData = {
          name: data.name.trim(),
          description: data.description?.trim() || '',
        };
        await dispatch(createPermissionThunk(createData));
      }

      fetchPermissionsData();
      reset();
      handleClose();
    } catch (error) {
      console.error('Error al guardar el permiso:', error);
      notificationErrorMessage('Hubo un error al guardar el permiso.');
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
