import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  dateBlocksPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  dateBlocks: [],
  dateBlock: null
}

export const dateBlocksSlice = createSlice({
  name: 'dateBlocks',
  initialState: initialState,
  reducers: {
    setDateBlocksPagination: (state, action) => {
      state.dateBlocksPagination = action.payload
    },
    addDateBlocksPagination: (state, action) => {
      state.dateBlocksPagination.rows.push({ ...action.payload })
    },
    updateDateBlocksPagination: (state, action) => {
      const updated = action.payload
      state.dateBlocksPagination.rows = state.dateBlocksPagination.rows.map(item =>
        item.id === updated.id ? { ...item, ...updated } : item
      )
    },
    deleteDateBlocks: (state, action) => {
      const id = action.payload
      state.dateBlocksPagination.rows = state.dateBlocksPagination.rows.filter(item => item.id !== id)
    }
  }
})

export const { setDateBlocksPagination, addDateBlocksPagination, updateDateBlocksPagination, deleteDateBlocks } = dateBlocksSlice.actions
export default dateBlocksSlice.reducer
