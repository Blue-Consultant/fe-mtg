import axios from '@/utils/axios'

export async function getOwnerEmployees() {
  const { data } = await axios.get('user/owner/employees')
  return Array.isArray(data?.employees) ? data.employees : []
}
