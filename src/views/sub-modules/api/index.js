import NProgress from 'nprogress'
import axios from '@/utils/axios'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification';

//TODO: Devuelve todos los registros con paginación
export const getSubModules = async (status, params = {}) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.get(`sub-modules/findAllPagination/sub-module/${status}`, {
      params
    });

    NProgress.done();

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('ERROR: getSubModules API', error);
    NProgress.done();

    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Error del servidor';
      notificationErrorMessage(message);
      return { message, status };
    }

    const message = 'Error de conexión con el servidor';
    notificationErrorMessage(message);
    return { message };
  }
};

export const getSubModulesByModule = async (module_id, status) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.get(`sub-modules/find-one/sub-module/${module_id}/${status}`);
    console.log('response getSubModulesByModule', response.data)

    NProgress.done();

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('ERROR: getSubModulesByModule API', error);
    NProgress.done();

    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Error del servidor';
      notificationErrorMessage(message);
      return { message, status };
    }

    notificationErrorMessage('Error de conexión con el servidor');
    return { message };
  }
};

export const getAllSubModules = async (status) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();
    const response = await axios.get(`sub-modules/find-all/sub-module/${status}`);
    console.log('response getAllSubModules', response.data)
    NProgress.done();
    if (!response.data || response.data.length === 0) {
      return [];
    }
    return response.data;
  } catch (error) {
    console.error('ERROR: getAllSubModules API', error);
    NProgress.done();
    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Error del servidor';
      notificationErrorMessage(message);
      return { message, status };
    }
    notificationErrorMessage('Error de conexión con el servidor');
    return { message };
  }
};

export const getSubModulesByMultipleModules = async (module_ids, status) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.post(`sub-modules/find-by-multiple-modules/${status}`, {
      module_ids
    });

    NProgress.done();

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch (error) {
    NProgress.done();

    if (error.response) {
      const { status, data } = error.response;
      const message = data.message || 'Error del servidor';
      notificationErrorMessage(message);
      return { message, status };
    }

    notificationErrorMessage('Error de conexión con el servidor');
    return { message };
  }
};

export const createSubModule = async (subModule) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.post(`sub-modules/add/sub-module`, subModule);

    NProgress.done();

    notificationSuccesMessage('Submódulo creado correctamente');
    return response.data;
  } catch (error) {
    NProgress.done();

    if (error.response) {
      const { data } = error.response;
      const message = data.message || 'Error al crear submódulo';
      notificationErrorMessage(message);
      throw new Error(message);
    }

    const message = 'Error de conexión con el servidor';
    notificationErrorMessage(message);
    throw new Error(message);
  }
};

export const updateSubModule = async (subModuleId, subModule) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.put(`sub-modules/update-sub-module/${subModuleId}`, subModule);

    NProgress.done();

    notificationSuccesMessage('Submódulo actualizado con éxito');
    return response.data;
  } catch (error) {
    console.error('ERROR: updateSubModule API', error);
    NProgress.done();

    if (error.response) {
      const { data } = error.response;
      const message = data.message || 'Error al actualizar submódulo';
      notificationErrorMessage(message);
      throw new Error(message);
    }

    const message = 'Error de conexión con el servidor';
    notificationErrorMessage(message);
    throw new Error(message);
  }
};

export const deleteSubModule = async (subModuleId) => {
  try {
    const response = await axios.delete(`sub-modules/delete-sub-module/${subModuleId}`);
    notificationSuccesMessage('Submódulo desactivado correctamente');
    return response.data;
  } catch (error) {
     const message =
      error.response?.data?.message || 'Error al desactivar el submódulo';
    notificationErrorMessage(message)
  }
}
