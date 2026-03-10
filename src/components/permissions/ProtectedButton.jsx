'use client'

import { Button, Tooltip } from '@mui/material'

import { usePermissions } from '@/contexts/permissionsContext'

/**
 * Botón que se deshabilita automáticamente si el usuario no tiene los permisos necesarios
 *
 * @example
 * <ProtectedButton permission="crear" variant="contained" onClick={handleCreate}>
 *   Crear Usuario
 * </ProtectedButton>
 *
 * @example
 * <ProtectedButton
 *   anyOf={['editar', 'eliminar']}
 *   variant="outlined"
 *   onClick={handleModify}
 *   tooltipMessage="Necesitas permiso de editar o eliminar"
 * >
 *   Modificar
 * </ProtectedButton>
 */
export const ProtectedButton = ({
  children,
  permission,
  anyOf,
  allOf,
  role,
  tooltipMessage = 'No tienes permiso para esta acción',
  onClick,
  ...buttonProps
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
          <Button {...buttonProps} disabled onClick={undefined}>
            {children}
          </Button>
        </span>
      </Tooltip>
    )
  }

  // Si tiene acceso, mostrar botón normal
  return (
    <Button {...buttonProps} onClick={onClick}>
      {children}
    </Button>
  )
}

export default ProtectedButton
