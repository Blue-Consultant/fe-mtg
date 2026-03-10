import NProgress from 'nprogress'
import axios from '@/utils/axios'
import { notificationErrorMessage, notificationSuccesMessage } from '@/components/ToastNotification';

//TODO: Devuelve todos los registros
export const getModules = async (status) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.get( `modules/findAll-module/${status}` );

    NProgress.done();

    if (!response.data || response.data.length === 0) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('ERROR: getModules API', error);
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

//TODO: Devuelve todos los registros con paginación
export const getModulesPagination = async (status, params = {}) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.get(`modules/findAllPagination/${status}`, { 
      params 
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

    const message = 'Error de conexión con el servidor';
    notificationErrorMessage(message);
    return { message };
  }
};

export const createModule = async (module) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.post(`modules/add-module`, module);

    NProgress.done();

    notificationSuccesMessage('Módulo creado correctamente');
    return response.data;
  } catch (error) {
    NProgress.done();

    if (error.response) {
      const { data } = error.response;
      const message = data.message || 'Error al crear módulo';
      notificationErrorMessage(message);
      throw new Error(message);
    }

    const message = 'Error de conexión con el servidor';
    notificationErrorMessage(message);
    throw new Error(message);
  }
};

export const updateModule = async (moduleId, module) => {
  try {
    NProgress.configure({ showSpinner: false, minimum: 0.1, trickleSpeed: 50 });
    NProgress.start();

    const response = await axios.put(`modules/update-module/${moduleId}`, module);

    NProgress.done();

    notificationSuccesMessage('Módulo actualizado con éxito');
    return response.data;
  } catch (error) {
    NProgress.done();

    if (error.response) {
      const { data } = error.response;
      const message = data.message || 'Error al crear módulo';
      notificationErrorMessage(message);
      throw new Error(message);
    }

    const message = 'Error de conexión con el servidor';
    notificationErrorMessage(message);
    throw new Error(message);
  }
};

export const deleteModule = async (moduleId) => {
  try {
    const response = await axios.delete(`modules/delete-module/${moduleId}`);
    notificationSuccesMessage('Módulo desactivado correctamente');
    return response.data;
  } catch (error) {
     const message =
      error.response?.data?.message || 'Error al desactivar el módulo';
    notificationErrorMessage(message)
  }
}