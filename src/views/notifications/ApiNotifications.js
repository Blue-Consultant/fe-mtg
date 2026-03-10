// Axios helper Imports
import axios from '@/utils/axios'

/*___________________________________________
│   * METHOD ADD NOTIFICATION BY IDUSER     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const addNotificationsIdUser = async formData => {
  try {
    const { data } = await axios.post(`notifications/add`, formData)

    return data
  } catch (error) {
    console.error(error)
  }
}

/*___________________________________________
│   * METHOD LIST NOTIFICATION BY IDUSER     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const listNotificationsIdUser = async user_id => {
  try {
    const { data } = await axios.get(`notifications/findAll/${user_id}/${true}/${true}`)

    return data
  } catch (error) {
    console.error(error)
  }
}

/*____________________________________________________________
│   * METHOD UPDATE OR READ STATUS NOTIFICATION BY IDUSER     │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const updateNotifications = async (id, formData) => {
  try {
    const { data } = await axios.put(`notifications/update/${id}`, formData)

    return data
  } catch (error) {
    console.error(error)
  }
}

/*_______________________________________________________
│   * METHOD DELETE NOTIFICATIONS BY TYPE AND USER_ID    │
 ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export const deleteNotificationsByType = async (id, type) => {
  try {
    NProgress.configure({
      showSpinner: true,
      minimum: 0.8,
      trickleSpeed: 100
    })

    NProgress.start()

    const { data } = await axios.delete(`notifications/deleteByType/${id}/${type}`)

    NProgress.done()
    toast.success('Suscriptor penality restored!', {
      position: 'top-right',
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'light'
    })

    return data
  } catch (error) {
    console.log('deleteNotificationByType', error)
  }
}
