import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  list: [],
  permissionsPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  loading: false,
  error: null
}

export const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (state, action) => {
      state.list = action.payload
    },
    setPermissionsPagination: (state, action) => {
      state.permissionsPagination = action.payload
    },
    addPermissionsPagination: (state, action) => {
      state.permissionsPagination.rows.push(action.payload)
    },
    updatePermissionsPagination: (state, action) => {
      state.permissionsPagination.rows = state.permissionsPagination.rows.map(item =>
        item.id === action.payload.id ? action.payload : item
      )
    },
    deletePermissionsPagination: (state, action) => {
      state.permissionsPagination.rows = state.permissionsPagination.rows.filter(item => item.id !== action.payload)
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
  setPermissions,
  setLoading,
  setError,
  setPermissionsPagination,
  addPermissionsPagination,
  updatePermissionsPagination,
  deletePermissionsPagination
} = permissionsSlice.actions

export default permissionsSlice.reducer

