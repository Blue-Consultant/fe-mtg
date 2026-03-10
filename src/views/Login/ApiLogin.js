
import NProgress from 'nprogress'

import axios from '@/utils/axios'
import {notificationErrorMessage, notificationWarningMessage, notificationSuccesMessage} from '@components/ToastNotification'

/*___________________________________
│   * METHOD LOGIN USER TO SYSTEM    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const LoginUser = async params => {
  
  try {
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      trickleSpeed: 50
    })
  
    NProgress.start()

    const { data } = await axios.post('user/singin', params)

    NProgress.done()

    return data.object
  } catch (e) {
    console.error(e)
  }
}

export const changePassword = async(email, newPassword) => {
 
  try {
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      trickleSpeed: 50
    })
    NProgress.start()

    const currentPassword = '';
    const params = { email, currentPassword, newPassword }

    const { data } = await axios.put('user/forgotPassword', params);
    notificationSuccesMessage('User Password updated succesfully!')

    return data
  } catch (error) {
    console.log(error)
    notificationErrorMessage('We were unable to update user password.')
  }finally{
    NProgress.done();
  }
}

export const generateCodeOtp = async email => {
  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 50
  })

  NProgress.start()

  try {
    const data = await axios.post('user/generateCode', { email })

    NProgress.done()

    return data
  } catch (e) {
    console.error(e)
  }
}

export const verifyCodeOtp = async (email, otpCode) => {
  
  try {
    NProgress.configure({
    showSpinner: false,
      minimum: 0.1,
      trickleSpeed: 50
    })
  
    NProgress.start()
    const data = await axios.post('user/verifyCode', { email, otpCode })

    NProgress.done()

    return data
  } catch (e) {
    console.error(e)
  }
}
