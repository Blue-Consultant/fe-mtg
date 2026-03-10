import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  rolesPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  roles: [],
  branchesOwnerRoles: [],
  permissionsRoles: [],
  rol: null
}

export const rolSlice = createSlice({
  name: 'roles',
  initialState: initialState,
  reducers: {
    setBranchesOwnerRoles: (state, action) => {
      state.branchesOwnerRoles = action.payload
    },
    setPermissionsRoles: (state, action) => {
      state.permissionsRoles = action.payload
    },
    setRolesPagination: (state, action) => {
      state.rolesPagination = action.payload
    },
    addRolesPagination: (state, action) => {
      const newRol = { ...action.payload }

      state.rolesPagination.rows.push(newRol)
    },
    updateRolesPagination: (state, action) => {
      const updatedRol = action.payload

      state.rolesPagination.rows = state.rolesPagination.rows.map(item =>
        item.id === updatedRol.id ? { ...item, ...updatedRol } : item
      )
    }
  }
})

export const {
  setRolesPagination,
  addRolesPagination,
  updateRolesPagination,
  setPermissionsRoles,
  setBranchesOwnerRoles
} = rolSlice.actions

export default rolSlice.reducer
