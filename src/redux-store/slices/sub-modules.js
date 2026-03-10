import { createSlice } from "@reduxjs/toolkit"
import { add } from "date-fns"

const initialState = {
  list: [],
  subModulesPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  subModules: null,
  relations:[],
  loading: false,
  error: null
}


export const subModulesSlice = createSlice({
  name: 'subModules',
  initialState,
  reducers: {
    setSubModules: (state, action) => {
      state.list = action.payload
    },
    setSubModulesPagination: (state, action) => {
      state.subModulesPagination = action.payload
    },
    addSubModulePagination: (state, action) => {
      const newSubModule = {...action.payload}
      state.subModulesPagination.rows.unshift(newSubModule)

      // Mantener solo la cantidad de registros según pageSize
      const pageSize = state.subModulesPagination.pageSize || 9
      state.subModulesPagination.rows = state.subModulesPagination.rows.slice(0, pageSize)
      
      // Actualizar totalRows si lo tienes
      state.subModulesPagination.totalRows = (state.subModulesPagination.totalRows || 0) + 1
    },
    updateSubModulePagination: (state, action) => {
      const updatedSubModule = action.payload
      state.subModulesPagination.rows = state.subModulesPagination.rows.map(item =>
        item.id === updatedSubModule.id ? { ...item, ...updatedSubModule } : item
      )
    },
    deleteSubModulePagination: (state, action) => {
      const subModuleId = action.payload
      state.subModulesPagination.rows = state.subModulesPagination.rows.filter(item => item.id !== subModuleId)
      if (state.subModulesPagination.totalRows > 0) {
        state.subModulesPagination.totalRows -= 1
      }
    },
    setSubModule: (state, action) => {
      state.list = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    addSubModule: (state, action) => {
      state.list.push(action.payload)
    },
    updateSubModule: (state, action) => {
      const updatedModules = action.payload
      state.list = state.list.map(subModule =>
        subModule.id === updatedModules.id ? { ...subModule, ...updatedModules } : subModule
      )
    },
    deleteSubModule: (state, action) => {
      state.rows = state.rows.filter(subModule => subModule.id !== action.payload);
      state.totalRows = state.totalRows - 1;
    },
    setRelations: (state, action) => {
      state.relations = action.payload
    }
  }
})

export const { 
  setSubModules, 
  setSubModulesPagination,
  addSubModulePagination,
  updateSubModulePagination,
  deleteSubModulePagination,
  setSubModule, 
  setLoading, 
  setError, 
  addSubModule, 
  updateSubModule, 
  deleteSubModule, 
  setRelations 
} = subModulesSlice.actions
export default subModulesSlice.reducer