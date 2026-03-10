import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  companiesPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  companies: [],
  companiesOwner: [],
  companiesUser: [],
  company: null
}

// Hooks
export const companiesSlice = createSlice({
  name: 'companies',
  initialState: initialState,
  reducers: {
    // setProgramsEntities: (state, action) => {
    //   state.programsEntities = action.payload
    // },
    setCompaniesUser: (state, action) => {
      state.companiesUser = action.payload
    },
    setCompaniesPagination: (state, action) => {
      state.companiesPagination = action.payload
    },
    addCompaniesPagination: (state, action) => {
      const newLevel = { ...action.payload }
      state.companiesPagination.rows.push(newLevel)
    },
    updateCompaniesPagination: (state, action) => {
      const updatedCompany = action.payload
      state.companiesPagination.rows = state.companiesPagination.rows.map(item =>
        item.id === updatedCompany.id ? { ...item, ...updatedCompany } : item
      )
    },
    deleteCompanies: (state, action) => {
      const deleted = action.payload
      state.companiesPagination.rows = state.companiesPagination.rows.filter(item => {
        return item.id != deleted
      })
    }
  }
})

export const { setCompaniesPagination, setCompaniesUser, addCompaniesPagination, updateCompaniesPagination, deleteCompanies } = companiesSlice.actions

export default companiesSlice.reducer
