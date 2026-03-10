import { createSlice } from "@reduxjs/toolkit"
import { add } from "date-fns"

const initialState = {
  list: [],      // en vez de entities
  modulesPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  modules: null,
  relations:[],
  loading: false,
  error: null
}


export const modulesSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    setModules: (state, action) => {
      state.list = action.payload
    },
    setModulesPagination: (state, action) => {
      state.modulesPagination = action.payload
    },
    addModulePagination: (state, action) => {
      const newModule = {...action.payload}
      state.modulesPagination.rows.unshift(newModule)

      // Mantener solo la cantidad de registros según pageSize
      const pageSize = state.modulesPagination.pageSize || 9
      state.modulesPagination.rows = state.modulesPagination.rows.slice(0, pageSize)
      
      // Actualizar totalRows si lo tienes
      state.modulesPagination.totalRows = (state.modulesPagination.totalRows || 0) + 1
    },
    updateModulePagination: (state, action) => {
      const updatedModules = action.payload
      state.modulesPagination.rows = state.modulesPagination.rows.map(item =>
        item.id === updatedModules.id ? { ...item, ...updatedModules } : item
      )
    },
    deleteModulePagination: (state, action) => {
      const moduleId = action.payload
      state.modulesPagination.rows = state.modulesPagination.rows.filter(item => item.id !== moduleId)
      if (state.modulesPagination.totalRows > 0) {
        state.modulesPagination.totalRows -= 1
      }
    },
    setModule: (state, action) => {
      state.entity = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    addModule: (state, action) => {
      state.list.push(action.payload)
    },
    updateModule: (state, action) => {
      const updatedModules = action.payload
      state.list = state.list.map(entity =>
        entity.id === updatedModules.id ? { ...entity, ...updatedModules } : entity
      )
    },
    deleteModule: (state, action) => {
      state.rows = state.rows.filter(entity => entity.id !== action.payload);
      state.totalRows = state.totalRows - 1;
    },
    linkEntityBranch: (state, action) => {
      const relations = action.payload
      state.relations = [...state.relations, ...relations]
    },
    setRelations: (state, action) => {
      state.relations = action.payload
    }
  }
})

export const { 
  setModules, 
  setModulesPagination,
  addModulePagination,
  updateModulePagination,
  deleteModulePagination,
  setModule, 
  setLoading, 
  setError, 
  addModule, 
  updateModule, 
  deleteModule, 
  linkModuleBranch, 
  setRelations 
} = modulesSlice.actions
export default modulesSlice.reducer