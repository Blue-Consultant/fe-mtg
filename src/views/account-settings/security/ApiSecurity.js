import NProgress from 'nprogress'

import axios from '@/utils/axios'
import {
  notificationErrorMessage,
  notificationWarningMessage,
  notificationSuccesMessage
} from '@components/ToastNotification'

export const changePassword = async (email, currentPassword, newPassword) => {
  try {
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      trickleSpeed: 50
    })

    NProgress.start()
    const params = { email, currentPassword, newPassword }
    const { data } = await axios.put('user/forgotPassword', params)

    if (data.payload.length === 0) {
      notificationWarningMessage(`${data.message}`)

      return
    }

    notificationSuccesMessage(`${data.message}`)

    return data
  } catch (error) {
    console.log(error)
    notificationErrorMessage('We were unable to update user password.')
  } finally {
    NProgress.done()
  }
}
