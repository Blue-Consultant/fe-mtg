import { toast } from 'react-toastify'
import NProgress from 'nprogress'

import axios from '@/utils/axios'

export const getUserSettings = async userId => {
  try {
    const response = await axios.get(`user/${userId}/settings`)

    return response.data
  } catch (error) {
    console.error('[getUserSettings] Error fetching user settings:', error)
    throw new Error('Unable to fetch user settings')
  }
}

export const saveUserSettings = async settings => {
  try {
    NProgress.configure({
      showSpinner: true,
      minimum: 0.8,
      trickleSpeed: 100
    })
    NProgress.start()

    const transformSettings = {
      id: settings.userId,
      user_id: settings.userId,
      theme_primary_color: settings.primaryColor,
      theme_mode: settings.mode,
      theme_skin: settings.skin,
      theme_semi_dark: settings.semiDark,
      layout: settings.layout,
      layout_content: settings.contentWidth,
      layout_direction: settings.direction,
      additional_custom_settings: settings.additional_custom_settings
    }

    const response = await axios.put(`user/save/settings`, transformSettings)

    NProgress.done()

    if (response.data && (response.data.success || response.status === 200)) {
      notificationSuccesMessage('User settings updated successfully')
    } else {
      notificationErrorMessage('Unable to update user settings try again later')
    }

    return response.data
  } catch (error) {
    console.log('[saveUserSettings] Error saving user settings:', error)
  }
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
