'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const PermissionsContext = createContext({
  permissions: [],
  roles: [],
  hasPermission: (permission) => false,
  hasAnyPermission: (permissions) => false,
  hasAllPermissions: (permissions) => false,
  hasRole: (roleName) => false,
  isLoading: true,
})

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([])
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useSelector((state) => state.login?.user)

  useEffect(() => {
    const loadPermissions = () => {
      try {
        const storedPermissions = localStorage.getItem('userPermissions')
        const storedRoles = localStorage.getItem('userRoles')

        if (storedPermissions) {
          setPermissions(JSON.parse(storedPermissions))
        }

        if (storedRoles) {
          setRoles(JSON.parse(storedRoles))
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading permissions:', error)
        setIsLoading(false)
      }
    }

    loadPermissions()
  }, [user])

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permission - Nombre del permiso (ej: 'crear', 'editar', 'eliminar')
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    if (!permission) return true

    const isOwner = roles.some(role =>
      role.roleName === 'Owner' || role.roleName === 'owner'
    )
    if (isOwner) return true

    return permissions.includes(permission)
  }

  /**
   * Verifica si el usuario tiene al menos uno de los permisos especificados
   * @param {string[]} permissionList - Array de permisos
   * @returns {boolean}
   */
  const hasAnyPermission = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true

    const isOwner = roles.some(role =>
      role.roleName === 'Owner' || role.roleName === 'owner'
    )
    if (isOwner) return true

    return permissionList.some((permission) => permissions.includes(permission))
  }

  /**
   * Verifica si el usuario tiene todos los permisos especificados
   * @param {string[]} permissionList - Array de permisos
   * @returns {boolean}
   */
  const hasAllPermissions = (permissionList) => {
    if (!permissionList || permissionList.length === 0) return true

    const isOwner = roles.some(role =>
      role.roleName === 'Owner' || role.roleName === 'owner'
    )
    if (isOwner) return true

    return permissionList.every((permission) => permissions.includes(permission))
  }

  /**
   * Verifica si el usuario tiene un rol específico
   * @param {string} roleName - Nombre del rol
   * @returns {boolean}
   */
  const hasRole = (roleName) => {
    if (!roleName) return true
    return roles.some((role) => role.roleName === roleName)
  }

  const value = {
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isLoading,
  }

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions debe ser usado dentro de PermissionsProvider')
  }
  return context
}

