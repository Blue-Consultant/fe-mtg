import { toast } from 'react-toastify'
import NProgress from 'nprogress'

import axios from '@/utils/axios'

export const updateUser = async formData => {

  try {
    NProgress.configure({
      showSpinner: true,
      minimum: 0.8,
      trickleSpeed: 100
    })
    NProgress.start()
    const { data } = await axios.post('user/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    notificationSuccesMessage('User')
    NProgress.done()

    return data
  } catch (error) {
    console.error('Error updating user', error)

    if (error.response) {
      const { status, data } = error.response

      if (data.message === 'The field email is already in use.') {
        notificationErrorMessage(data.message)
      } else if (status === 400) {
        notificationErrorMessage('Error in the data sent. Please review the fields.')
      } else {
        notificationErrorMessage('An unexpected error occurred.')
      }
    } else {
      notificationErrorMessage('Connection error with the server.')
    }
  }
}

export const displayAvatar = () =>{
  const avatartList = [];

  for (let i = 1; i <= 8; i++) {
    avatartList.push(`/images/avatars/${i}.png`)
  }

  return avatartList
}

export const deactivateAccount = async (email, status) =>{
  const params = {
    email,
    status,
  }
  const response = await axios.post('user/DeactivateAccount', params)

  if(!response.data) return null

  return response
}


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

const notificationSuccesMessage = message => {
  return toast.success(`${message} updated succesfully!`, {
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
