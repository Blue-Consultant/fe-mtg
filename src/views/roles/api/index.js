// Axios helper Imports

import { toast } from 'react-toastify'

import NProgress from 'nprogress'

import axios from '@/utils/axios'

import { notificationErrorMessage, notificationSuccesMessage, notificationWarningMessage } from '@/components/ToastNotification'

/*_______________________________________________
│   * METHOD LIST ROLES - BRANCHES PAGINATION    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listAllRolesPagination = async (user_id, params) => {
  try {
    const { data } = await axios.get(`roles/findAllPagination/${user_id}/${true}`, {
      params
    })

    return data
  } catch (error) {
    console.error(error)
    return null
  }
}

/*_______________________________________________
│   * METHOD LIST ROLES - BRANCHES PAGINATION    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listAllRolesRolesBranches = async (branch_id, status) => {
  try {
    // Si branch_id es 'null' o vacío, enviar 'null' para obtener roles globales
    const branchParam = (!branch_id || branch_id === 'null' || branch_id === '') ? 'null' : branch_id
    const { data } = await axios.get(`roles/findAllRolesByBranches/${branchParam}/${status}`)
    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

// NOTA: listAllRoles fue removido - usar listAllRolesForAssignment en su lugar

/*_____________________________________
│   * METHOD LIST ALL ROLES FOR ASSIGNMENT    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listAllRolesForAssignment = async (userId) => {
  try {
    const { data } = await axios.get(`roles/findAllRolesForAssignment/${userId}`)
    return data
  } catch (error) {
    console.error(error)
    return []
  }
}

/*___________________________________
│   * METHOD LIST ROLES FILTERED     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listAllStudenTeacherRoles = async () => {

  try {

    const { data } = await axios.get(`roles/findRolesStudenTeacher`)

    return data

  } catch (error) {

    console.error(error)

  }

}

/*___________________________________
│   * METHOD LIST ROLES FILTERED     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const addRolesPermissions = async (formData) => {
  NProgress.configure({
    showSpinner: true,
    minimum: 0.8,
    trickleSpeed: 100
  })
  NProgress.start()
  try {
    const { data } = await axios.post(`roles/addRolesPermissions`, formData)
    NProgress.done()
    notificationSuccesMessage('Rol guardado con éxito')
    return data

  } catch (error) {
    NProgress.done()
    const errorMsg = error?.response?.data?.message || error?.response?.data || error?.message || ''
    console.log('Error roles:', errorMsg) // debug

    // Detectar error de constraint único de is_student
    if (String(errorMsg).includes('roles_uq_branch_student') || String(errorMsg).includes('P2002') || String(errorMsg).includes('Unique constraint')) {
      notificationWarningMessage('Ya existe rol en la empresa')
      return { message: 'Ya existe rol en la empresa', status: 409 }
    }

    notificationErrorMessage('Error al guardar el rol')
    return { message: 'Error al guardar el rol', status: 500 }
  } finally {
    NProgress.done()
  }

}

/*___________________________________
│   * METHOD LIST ROLES FILTERED     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const updateRolesPermissions = async (formData) => {
  NProgress.configure({
    showSpinner: true,
    minimum: 0.8,
    trickleSpeed: 100
  })
  NProgress.start()
  try {
    const { data } = await axios.put(`roles/updateRolesPermissions`, formData)
    NProgress.done()
    notificationSuccesMessage('Rol actualizado con éxito')
    return data

  } catch (error) {
    NProgress.done()
    const errorMsg = error?.response?.data?.message || error?.response?.data || error?.message || ''
    console.log('Error roles update:', errorMsg) // debug

    if (String(errorMsg).includes('roles_uq_branch_student') || String(errorMsg).includes('P2002') || String(errorMsg).includes('Unique constraint')) {
      notificationWarningMessage('Ya existe rol estudiante')
      return { message: 'Ya existe rol estudiante', status: 409 }
    }

    notificationErrorMessage('Error al actualizar el rol')
    return { message: 'Error al actualizar el rol', status: 500 }
  } finally {
    NProgress.done()
  }

}

export const deleteRolesPermissions = async (item) => {
  try {
    NProgress.configure({
      showSpinner: true,
      minimum: 0.8,
      trickleSpeed: 100
    });
    NProgress.start();

    const { data } = await axios.delete(`roles/deleteRolesPermissions/${item.id}`);

    NProgress.done()
    notificationSuccesMessage('Rol eliminado con éxito')

    return data;

  } catch (error) {
    NProgress.done()
    notificationErrorMessage('Error al eliminar el rol')
    console.log("deleteRoles", error)
    throw error;
  }
}
