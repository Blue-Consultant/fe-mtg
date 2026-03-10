'use client'

import { usePermissions } from '@/contexts/permissionsContext'

export const CanAccess = ({ children, permission, anyOf, allOf, role, fallback = null, loading = null }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isLoading } = usePermissions()

  if (isLoading && loading) {
    return loading
  }

  if (isLoading) {
    return null
  }

  if (role && !hasRole(role)) {
    return fallback
  }

  if (permission && !hasPermission(permission)) {
    return fallback
  }

  // Verificar al menos uno de los permisos
  if (anyOf && !hasAnyPermission(anyOf)) {
    return fallback
  }

  // Verificar todos los permisos
  if (allOf && !hasAllPermissions(allOf)) {
    return fallback
  }

  return <>{children}</>
}

export default CanAccess
