'use client'

import { IconButton, Tooltip } from '@mui/material'

import { usePermissions } from '@/contexts/permissionsContext'

/**
 * IconButton que se deshabilita automáticamente si el usuario no tiene los permisos necesarios
 *
 * @example
 * <ProtectedIconButton permission="eliminar" onClick={handleDelete}>
 *   <i className="ri-delete-bin-line" />
 * </ProtectedIconButton>
 *
 * @example
 * <ProtectedIconButton
 *   permission="editar"
 *   onClick={handleEdit}
 *   tooltipMessage="No tienes permiso para editar"
 * >
 *   <i className="ri-edit-line" />
 * </ProtectedIconButton>
 */
export const ProtectedIconButton = ({
  children,
  permission,
  anyOf,
  allOf,
  role,
  tooltipMessage = 'No tienes permiso',
  onClick,
  ...iconButtonProps
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole } = usePermissions()

  // Verificar permisos
  let hasAccess = true

  if (role && !hasRole(role)) {
    hasAccess = false
  }

  if (permission && !hasPermission(permission)) {
    hasAccess = false
  }

  if (anyOf && !hasAnyPermission(anyOf)) {
    hasAccess = false
  }

  if (allOf && !hasAllPermissions(allOf)) {
    hasAccess = false
  }

  // Si no tiene acceso, mostrar botón deshabilitado con tooltip
  if (!hasAccess) {
    return (
      <Tooltip title={tooltipMessage} arrow>
        <span>
          <IconButton {...iconButtonProps} disabled onClick={undefined}>
            {children}
          </IconButton>
        </span>
      </Tooltip>
    )
  }

  // Si tiene acceso, mostrar botón normal
  return (
    <IconButton {...iconButtonProps} onClick={onClick}>
      {children}
    </IconButton>
  )
}

export default ProtectedIconButton
