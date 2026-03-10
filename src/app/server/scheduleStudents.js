'use server'

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_SSR_API || 'http://localhost:5100'

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

export async function getStudentEventsAction(branchId, levelIds = null, sublevelIds = null, pagination = {}) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      currentPage: pagination.currentPage || 1,
      pageSize: pagination.pageSize || 1000
    })

    if (levelIds) {
      const levelId = Array.isArray(levelIds) ? levelIds[0] : levelIds

      params.append('level_id', levelId)
    }

    const response = await fetch(`${API_URL}/schedules/student/events/${branchId}?${params}`, {
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
    console.error('Error fetching student events:', error)

    return { success: false, error: error.message }
  }
}

export async function getStudentEnrolledEventsAction(branchId, pagination = {}) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      currentPage: pagination.currentPage || 1,
      pageSize: pagination.pageSize || 1000
    })

    const response = await fetch(`${API_URL}/schedules/student/enrolled-events/${branchId}?${params}`, {
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
    console.error('Error fetching student enrolled events:', error)

    return { success: false, error: error.message }
  }
}

export async function enrollStudentAction(eventClassId) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/student/enroll`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event_class_id: eventClassId }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error enrolling student:', error)

    return { success: false, error: error.message }
  }
}

export async function attendEventAction(eventClassId, studentId) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/schedules/enrollment/attend`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        event_class_id: eventClassId,
        student_id: studentId
      }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error marking event as attended:', error)

    return { success: false, error: error.message }
  }
}

export async function sendEmailUserServicesAction(formData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/services/sendEmailUserService`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error sending email user service:', error)

    return { success: false, error: error.message }
  }
}

export async function reminderUserServicesAction(formData) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/services/reminderUserService`, {
      method: 'POST',
      headers,
      body: JSON.stringify(formData),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error sending reminder user service:', error)

    return { success: false, error: error.message }
  }
}
