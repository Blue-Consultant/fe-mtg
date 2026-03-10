import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  courtsPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  courts: [],
  court: null
}

export const courtsSlice = createSlice({
  name: 'courts',
  initialState: initialState,
  reducers: {
    setCourtsPagination: (state, action) => {
      state.courtsPagination = action.payload
    },
    addCourtsPagination: (state, action) => {
      const newCourt = { ...action.payload }

      state.courtsPagination.rows.push(newCourt)
    },
    updateCourtsPagination: (state, action) => {
      const updatedCourt = action.payload

      state.courtsPagination.rows = state.courtsPagination.rows.map(item =>
        item.id === updatedCourt.id ? { ...item, ...updatedCourt } : item
      )
    },
    deleteCourts: (state, action) => {
      const deleted = action.payload

      state.courtsPagination.rows = state.courtsPagination.rows.filter(item => {
        return item.id != deleted
      })
    }
  }
})

export const { setCourtsPagination, addCourtsPagination, updateCourtsPagination, deleteCourts } = courtsSlice.actions

export default courtsSlice.reducer
