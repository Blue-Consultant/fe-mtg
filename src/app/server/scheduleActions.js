'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_SSR_API || 'http://localhost:5100'

/*_____________________________________
│   HELPER: GET TOKEN FROM COOKIES    │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
async function getAuthHeaders() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    throw new Error('No hay token de autenticación. Por favor, inicia sesión.')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  }
}

/*_____________________________________
│   SERVER ACTION: GET EVENTS         │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function getEventsByBranchAction(branchId, levelId = null, pagination = {}) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      ...(levelId && { level_id: levelId }),
      currentPage: pagination.currentPage || 1,
      pageSize: pagination.pageSize || 1000
    })

    const response = await fetch(`${API_URL}/schedules/event-class/pagination/${branchId}?${params}`, {
      method: 'GET',
      headers,
      cache: 'no-store' // o 'force-cache' si quieres cachear
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching events:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: CREATE EVENT       │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function createEventAction(eventData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/event-class`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al crear evento')
    }

    const data = await response.json()

    return { success: true, data, message: 'Reserva creada!' }
  } catch (error) {
    console.error('Error creating event:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: CREATE MULTIPLE    │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function createMultipleEventsAction(eventData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/event-class/multiple`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al crear eventos')
    }

    const data = await response.json()

    const count = eventData.selected_dates?.length || 0

    return { success: true, data, message: `${count} reservas creadas!` }
  } catch (error) {
    console.error('Error creating multiple events:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: CREATE BULK        │
│   (TODOS LOS EVENTOS DE UNA VEZ)    │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function createBulkEventsAction(eventData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/event-class/bulk`, {
      method: 'POST',
      headers,
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al crear eventos')
    }

    const data = await response.json()

    const count = eventData.events?.length || 0

    return { success: true, data, message: `${count} reserva${count > 1 ? 's' : ''} creada${count > 1 ? 's' : ''}!` }
  } catch (error) {
    console.error('Error creating bulk events:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: UPDATE EVENT       │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function updateEventAction(eventData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/event-class`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(eventData)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al actualizar evento')
    }

    const data = await response.json()

    return { success: true, data, message: 'Reserva actualizada!' }
  } catch (error) {
    console.error('Error updating event:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: DELETE EVENT       │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function deleteEventAction(eventId) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/event-class/${eventId}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al eliminar evento')
    }

    const data = await response.json()

    return { success: true, data, message: 'Reserva eliminada!' }
  } catch (error) {
    console.error('Error deleting event:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: CREATE TEACHER     │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function createTeacherAction(teacherData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/teachers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(teacherData)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al crear profesor')
    }

    const data = await response.json()

    return { success: true, data, message: 'Profesor creado!' }
  } catch (error) {
    console.error('Error creating teacher:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: UPDATE TEACHER     │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function updateTeacherAction(teacherData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/teachers/${teacherData.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(teacherData)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al actualizar profesor')
    }

    const data = await response.json()

    return { success: true, data, message: 'Profesor actualizado!' }
  } catch (error) {
    console.error('Error updating teacher:', error)

    return { success: false, error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: GET TEACHERS       │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function getTeachersByBranchAction(branchId) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/teachers/branch/${branchId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching teachers:', error)

    return { success: false, data: [], error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: GET BRANCHES       │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function getBranchesByUserAction(userId, rol_id) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/branches/findAllbyUser/${userId}/${rol_id}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    console.log('getBranchesByUserAction', data)

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching branches:', error)

    return { success: false, data: [], error: error.message }
  }
}

/*_____________________________________
│   SERVER ACTION: GET LEVELS         │
¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯*/
export async function getLevelsByUserAndBranchAction(userId, branchId) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/levels/findByUserAndBranch/${userId}/${branchId}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error fetching levels:', error)

    return { success: false, data: [], error: error.message }
  }
}
