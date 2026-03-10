// Axios helper Imports
import { toast } from 'react-toastify'
import NProgress from 'nprogress'

import axios from '@/utils/axios'

/*_____________________________________
│   * METHOD ADD NEW USER TO SYSTEM    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const singUpAddUser = async formData => {
  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 50
  })

  NProgress.start()

  try {
    const response = await axios.post('user/register', formData)
    if (!response || !response.data) {
      return { message: 'Error al registrar usuario', status: 400 }
    }

    return response
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response
      // Retornar el objeto completo del error para mejor manejo
      return {
        message: data.message || 'Error al registrar usuario.',
        status,
        errors: data.errors || null,
        data: null // No hay data en caso de error
      }
    } else {
      return {
        message: 'Error de conexión con el servidor.',
        status: 500,
        errors: null,
        data: null
      }
    }
  } finally {
    NProgress.done()
  }
}

/*_________________________________________
│   * METHOD GENERATE CODE OTP SENDMAIL    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const generateCodeOtp = async (email, mailMessage) => {
  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 50
  })

  NProgress.start()

  const normalizedEmail = typeof email === 'string' ? email : email?.email;

  if (!normalizedEmail) {
    throw new Error('The email is not valid');
  }

  try {
    const data = await axios.post('user/generateCode', { email: normalizedEmail, mailMessage })

    NProgress.done()

    return data
  } catch (e) {
    console.error(e)
  }
}

/*___________________________________________________
│   * METHOD VERIFY CODE OTP VALIDATE USER ACCOUNT   │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const verifyCodeOtp = async (email, otpCode) => {

  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 50
  })

  NProgress.start()

  const normalizedEmail = typeof email === 'string' ? email : email?.email;

  if (!normalizedEmail) {
    throw new Error('The email is not valid');
  }

  try {
    const data = await axios.post('user/verifyCode', { email: normalizedEmail, otpCode })

    NProgress.done()

    return data
  } catch (e) {
    console.error(e)
  }
}

export const verifyUserByEmailOrDni = async (emailOrDni) => {

  NProgress.configure({
    showSpinner: false,
    minimum: 0.1,
    trickleSpeed: 50
  })

  NProgress.start()

  try {
    const data = await axios.post('user/getUserByEmailOrDni', {
      email: emailOrDni.email,
      dni: emailOrDni.dni,
      status: emailOrDni.status
    })

    NProgress.done()

    return data
  } catch (e) {
    console.error(e)
  }
}

/*___________________________________________________
│  * METHOD SEND WHATSAPP WELCOME MESSAGE TO TITULAR │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const sendWhatsappWelcomeMessageToTitular = async (userData) => {
  try {
    const phone_number = userData.phone_number.replace(/\s+/g, '');
    const data = await axios.post('notifications/whatsapp/welcome', {
      to: phone_number,
      code1: userData.code_access_1,
      code2: userData.code_access_2
    })

    return data
  } catch (e) {
    console.error(e)
  }
}
/*___________________________________________________
│  * METHOD SEND WHATSAPP CREDENTIALS TO USER        │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const sendWhatsappCredentialsToUser = async (userData) => {
  try {
    const phone_number = userData.phone_number.replace(/\s+/g, '');
    const data = await axios.post('notifications/whatsapp/credentials', {
      to: phone_number,
      user: userData.email,
      password: userData.password
    })

    return data
  } catch (e) {
    console.error(e)
  }
}

