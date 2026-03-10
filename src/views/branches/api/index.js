// Axios helper Imports
import { toast } from 'react-toastify'
import NProgress from 'nprogress'

import axiosNative from 'axios'

import axios from '@/utils/axios'

/*_____________________________________
│   * METHOD LIST BRANCH BY OWNERS     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listBranchesByOwner = async user_id => {
  try {
    const { data } = await axios.get(`branches/findAllbyOwner/${user_id}/${true}`)

    console.log('byowner', { data })

    return data
  } catch (error) {
    console.error(error)
  }
}

/*_________________________________________
│   * METHOD SELECT BRANCHS BY USER ID     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listBranchesByUser = async (user_id, rol_id) => {
  try {
    const { data } = await axios.get(`branches/findAllbyUser/${user_id}/${rol_id}`)

    console.log('byuser', { data })

    return data
  } catch (error) {
    console.error(error)
  }
}

/*___________________________________
│   * METHOD LIST BRANCH BY USER     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listBranchesUserId = async user_id => {
  try {
    const { data } = await axios.get(`branches/findAllbranchesUser/${user_id}`)

    return data
  } catch (error) {
    console.error(error)
  }
}

/*________________________________________
│   * METHOD START UPLOAD (Presigned URL) │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const startUpload = async (fileName, fileType) => {
  try {
    const response = await axios.post('branches/startUpload', {
      fileName,
      fileType
    })

    return response.data
  } catch (error) {
    console.error('Error getting presigned URL:', error)
    throw error
  }
}

/*_____________________________________________
│   * METHOD UPLOAD TO S3 (Direct upload)      │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const uploadToS3 = async (uploadUrl, file, onProgress) => {
  try {
    await axiosNative.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)

          if (onProgress) {
            onProgress(percentCompleted)
          }
        }
      }
    })

    return true
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw error
  }
}

/*___________________________________
│   * METHOD CREATE BRANCH           │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const createBranch = async data => {
  try {
    NProgress.start()

    const response = await axios.post('branches/add', data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to create a new branch')
    }

    const resData = response.data
    const { branch_user, branches } = resData

    const parsedData = {
      ...branches,
      SportsVenueUsers: [branch_user]
    }

    NProgress.done()
    notificationSuccesMessage('Branch created succesfully!')

    return parsedData
  } catch (error) {
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response

      // Manejar errores de validación de class-validator
      if (data?.message && Array.isArray(data.message)) {
        const validationErrors = data.message
          .map(err => {
            if (typeof err === 'string') return err

            if (err.constraints) {
              return Object.values(err.constraints).join(', ')
            }

            return err.property || 'Campo inválido'
          })
          .join('; ')

        notificationErrorMessage(`Errores de validación: ${validationErrors}`)
      }

      // Manejar errores de campos duplicados
      else if (data?.message?.includes('already in use')) {
        if (data.message.includes('name')) {
          notificationErrorMessage('El nombre de la sucursal ya existe.')
        } else if (data.message.includes('company_name')) {
          notificationErrorMessage('El nombre de la compañía ya existe.')
        } else if (data.message.includes('email')) {
          notificationErrorMessage('El email ya está registrado.')
        } else {
          notificationErrorMessage(data.message)
        }
      }

      // Manejar otros errores 400
      else if (status === 400 || status === 409) {
        const errorMessage = data?.message || data?.error || 'Error en los datos. Revisa los campos.'

        notificationErrorMessage(errorMessage)
      } else {
        notificationErrorMessage('Ocurrió un error inesperado.')
      }
    } else if (error.message) {
      // Error del frontend (validación)
      notificationErrorMessage(error.message)
    } else {
      notificationErrorMessage('Error de conexión con el servidor.')
    }

    throw error
  }
}

/*___________________________________
│   * METHOD UPDATE BRANCH           │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const updateBranch = async (id, data) => {
  try {
    NProgress.start()

    const response = await axios.put(`branches/update/${id}`, data)

    if (response.status !== 200 && response.status !== 201) {
      throw new Error('We were unable to update the branch')
    }

    const resData = response.data

    NProgress.done()
    notificationSuccesMessage('Branch updated succesfully!')

    return resData
  } catch (error) {
    NProgress.done()

    if (error.response) {
      const { status, data } = error.response

      // Manejar errores de campos duplicados
      if (data.message?.includes('already in use')) {
        if (data.message.includes('name')) {
          notificationErrorMessage('El nombre de la sucursal ya existe.')
        } else if (data.message.includes('company_name')) {
          notificationErrorMessage('El nombre de la compañía ya existe.')
        } else if (data.message.includes('email')) {
          notificationErrorMessage('El email ya está registrado.')
        } else {
          notificationErrorMessage(data.message)
        }
      } else if (status === 400 || status === 409) {
        notificationErrorMessage(data.message || 'Error en los datos. Revisa los campos.')
      } else {
        notificationErrorMessage('Ocurrió un error inesperado.')
      }
    } else {
      notificationErrorMessage('Error de conexión con el servidor.')
    }

    throw error
  }
}

/*___________________________________
│   * METHOD LIST BRANCH BY USER     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listBranchByIdWithPagination = async (user_id, params) => {
  try {
    const { data } = await axios.get(`branches/findAllPagination/${user_id}/${true}`, {
      params
    })

    console.log({ data })

    return data
  } catch (error) {
    console.error(error)
  }
}

/*______________________________________________________
│   * METHOD UPDATE USER BRANCH BY STATUS CONDITION     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const updateBranchUserStatusCondition = async (user_id, venue_id) => {
  try {
    NProgress.configure({
      showSpinner: true,
      minimum: 0.8,
      trickleSpeed: 100
    })
    NProgress.start()

    const { data } = await axios.put(`branches/update_sports_venue_user/status_condition/${user_id}/${venue_id}`)

    NProgress.done()
    notificationSuccesMessage('You are welcome to new branch !')

    return data
  } catch (error) {
    console.log(error)
  }
}

export const deleteBranchUser = async item => {
  try {
    NProgress.configure({
      showSpinner: true,
      minimum: 0.8,
      trickleSpeed: 100
    })
    NProgress.start()

    const { data } = await axios.delete(`branches/deleteBranch/${item.id}`)

    NProgress.done()
    notificationSuccesMessage('Your branch was deleted.!')

    return data
  } catch (error) {
    console.log('DeleteBranchUser', error)
    notificationErrorMessage('Unable to delete the branch, please try again.!')
  }
}

export const getTotalUsersParsed = async item => {}

const notificationErrorMessage = message => {
  return toast.error(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}

const notificationWarningMessage = message => {
  return toast.warning(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}

const notificationSuccesMessage = message => {
  return toast.success(`${message}`, {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light'
  })
}
