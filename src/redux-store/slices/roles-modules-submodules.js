import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  list: [],
  rolePermissions: {
    role_id: null,
    modules: [],
    total_permissions: 0
  },
  rolesPermissionsPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  loading: false,
  error: null
}

export const rolesModulesSubmodulesSlice = createSlice({
  name: 'rolesModulesSubmodules',
  initialState,
  reducers: {
    setRolePermissions: (state, action) => {
      state.rolePermissions = action.payload
    },
    addPermissions: (state, action) => {
      // Agregar nuevos permisos al estado actual
      const newPermissions = action.payload
      state.rolePermissions.total_permissions += newPermissions.count || 0
    },
    updatePermissions: (state, action) => {
      // Reemplazar todos los permisos
      state.rolePermissions = action.payload
    },
    deletePermission: (state, action) => {
      const permissionId = action.payload
      
      // Eliminar de rolePermissions (estructura antigua)
      state.rolePermissions.modules = state.rolePermissions.modules.map(module => ({
        ...module,
        submodules: module.submodules.filter(sub => sub.permission_id !== permissionId)
      })).filter(module => module.submodules.length > 0)
      state.rolePermissions.total_permissions = Math.max(0, state.rolePermissions.total_permissions - 1)
      
      // Eliminar de rolesPermissionsPagination (estructura nueva)
      state.rolesPermissionsPagination.rows = state.rolesPermissionsPagination.rows.filter(
        row => row.id !== permissionId
      )
      state.rolesPermissionsPagination.totalRows = Math.max(0, state.rolesPermissionsPagination.totalRows - 1)
    },
    clearRolePermissions: (state) => {
      state.rolePermissions = {
        role_id: null,
        modules: [],
        total_permissions: 0
      }
    },
    setRolesPermissionsPagination: (state, action) => {
      state.rolesPermissionsPagination = action.payload
    },
    addRolesPermissionsPagination: (state, action) => {
      state.rolesPermissionsPagination.rows.push(action.payload)
    },
    updateRolesPermissionsPagination: (state, action) => {
      state.rolesPermissionsPagination.rows = state.rolesPermissionsPagination.rows.map(item =>
        item.id === action.payload.id ? action.payload : item
      )
    },
    deleteRolesPermissionsPagination: (state, action) => {
      state.rolesPermissionsPagination.rows = state.rolesPermissionsPagination.rows.filter(item => item.id !== action.payload)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  }
})

export const { 
  setRolePermissions,
  addPermissions,
  updatePermissions,
  deletePermission,
  clearRolePermissions,
  setLoading,
  setError,
  setRolesPermissionsPagination,
  addRolesPermissionsPagination,
  updateRolesPermissionsPagination,
  deleteRolesPermissionsPagination
} = rolesModulesSubmodulesSlice.actions

export default rolesModulesSubmodulesSlice.reducer

