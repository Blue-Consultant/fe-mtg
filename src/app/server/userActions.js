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

export async function getUsersByBranchAction(userId, rolId = 2) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      user_id: userId,
      rol_id: rolId
    })

    const response = await fetch(`${API_URL}/branches/findAllBranchUsers?${params}`, {
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
    console.error('Error fetching users:', error)

    return { success: false, data: [], error: error.message }
  }
}

export async function getUsersByBranchPaginationAction(userId, rolId = 2, paginationParams = {}) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      ...(paginationParams.searchValue && { searchValue: paginationParams.searchValue }),
      currentPage: paginationParams.currentPage || 1,
      pageSize: paginationParams.pageSize || 10,
      ...(paginationParams.orderBy && { orderBy: paginationParams.orderBy }),
      ...(paginationParams.orderByMode && { orderByMode: paginationParams.orderByMode })
    })

    const response = await fetch(`${API_URL}/branches/findAllBranchUsersPagination/${userId}/${rolId}?${params}`, {
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
    console.error('Error fetching users with pagination:', error)

    return { success: false, data: { rows: [], totalRows: 0, totalPages: 0, currentPage: 1 }, error: error.message }
  }
}

export async function getUserByNameOrEmailAction(searchData) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      ...(searchData.name && { name: searchData.name }),
      ...(searchData.email && { email: searchData.email }),
      status: searchData.status
    })

    const response = await fetch(`${API_URL}/user/findUserByNameOrEmail?${params}`, {
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
    console.error('Error searching user:', error)

    return { success: false, data: [], error: error.message }
  }
}

export async function checkUserIfExistAction(userId, branchId) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      user_id: userId,
      branch_id: branchId,
      status: false,
      status_conditions_id: 4
    })

    const response = await fetch(`${API_URL}/branches/findOneUser?${params}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    return { success: true, data: data === '' ? [] : [data] }
  } catch (error) {
    console.error('Error checking user:', error)

    return { success: false, data: [], error: error.message }
  }
}

export async function addUserAction(branchId, userId, rolId) {
  try {
    const headers = await getAuthHeaders()

    const body = {
      branch_id: branchId,
      user_id: userId,
      rol_id: rolId,
      status_conditions_id: 1
    }

    const response = await fetch(`${API_URL}/branches/user`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()

      if (errorData.message === 'The field user_id,branch_id is already in use.') {
        return { success: false, error: 'El usuario ya está en tu lista' }
      }

      throw new Error(errorData.message || 'Error al agregar usuario')
    }

    const data = await response.json()

    return { success: true, data, message: 'Invitación enviada al usuario' }
  } catch (error) {
    console.error('Error adding user:', error)

    return { success: false, error: error.message }
  }
}

export async function assignLicenseToUserAction(branchUserId, licenseId, licenseType) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/licenses/assign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        branch_user_id: branchUserId,
        license_id: licenseId,
        license_type: licenseType
      })
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al asignar licencia')
    }

    const data = await response.json()

    return { success: true, data }
  } catch (error) {
    console.error('Error assigning license:', error)

    return { success: false, error: error.message }
  }
}

export async function setUserStatusAction(branchId, userId, rolesId, action, statusId) {
  try {
    const headers = await getAuthHeaders()

    let finalAction = action

    if (action === 'update' && statusId == 4) {
      finalAction = 'create'
    } else if (action === 'update' && statusId != 4) {
      finalAction = 'update'
    } else {
      finalAction = 'delete'
    }

    let statusConditionId = 4

    if (finalAction.toLowerCase() === 'create') {
      statusConditionId = 5
    } else if (finalAction.toLowerCase() === 'update' && statusId == 5) {
      statusConditionId = 5
    } else if (finalAction.toLowerCase() === 'update' && statusId == 8) {
      statusConditionId = 8
    }

    const body = {
      branch_id: branchId,
      user_id: userId,
      Roles_id: rolesId,
      status: finalAction === 'update',
      status_conditions_id: statusConditionId
    }

    const response = await fetch(`${API_URL}/branches/userStatus`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || 'Error al actualizar estado')
    }

    const data = await response.json()

    return { success: true, data, message: `Usuario ${finalAction}do exitosamente` }
  } catch (error) {
    console.error('Error updating user status:', error)

    return { success: false, error: error.message }
  }
}

export async function createStaffUserAction(formData) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value

    if (!accessToken) {
      throw new Error('No hay token de autenticación. Por favor, inicia sesión.')
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`
    }

    const userId = formData.get('id')
    const isUpdate = userId && userId !== ''

    const endpoint = isUpdate ? `${API_URL}/user/updateStaffUser/${userId}` : `${API_URL}/user/createStaffUser`

    const method = isUpdate ? 'PUT' : 'POST'

    const response = await fetch(endpoint, {
      method,
      headers,
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()

      throw new Error(errorData.message || `Error al ${isUpdate ? 'actualizar' : 'crear'} usuario`)
    }

    const data = await response.json()

    return {
      success: true,
      data,
      message: isUpdate ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'
    }
  } catch (error) {
    console.error('Error saving staff user:', error)

    return { success: false, error: error.message }
  }
}

export async function getAllUsersPaginationAction(paginationParams = {}) {
  try {
    const headers = await getAuthHeaders()

    const params = new URLSearchParams({
      ...(paginationParams.searchValue && { searchValue: paginationParams.searchValue }),
      currentPage: paginationParams.currentPage || 1,
      pageSize: paginationParams.pageSize || 10,
      ...(paginationParams.orderBy && { orderBy: paginationParams.orderBy }),
      ...(paginationParams.orderByMode && { orderByMode: paginationParams.orderByMode })
    })

    const response = await fetch(`${API_URL}/user/findAllPagination?${params}`, {
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
    console.error('Error fetching all users with pagination:', error)

    return { success: false, data: { rows: [], totalRows: 0, totalPages: 0, currentPage: 1 }, error: error.message }
  }
}

export async function getBranchesByOwnerAction(userId) {
  try {
    const headers = await getAuthHeaders()

    const response = await fetch(`${API_URL}/branches/findAllbyOwner/${userId}/2`, {
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
    console.error('Error fetching branches:', error)

    return { success: false, data: [], error: error.message }
  }
}
