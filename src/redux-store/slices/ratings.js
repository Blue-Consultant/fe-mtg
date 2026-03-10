import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  ratingsPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  ratings: [],
  rating: null
}

export const ratingsSlice = createSlice({
  name: 'ratings',
  initialState: initialState,
  reducers: {
    setRatingsPagination: (state, action) => {
      state.ratingsPagination = action.payload
    },
    addRatingsPagination: (state, action) => {
      state.ratingsPagination.rows.push({ ...action.payload })
    },
    updateRatingsPagination: (state, action) => {
      const updated = action.payload

      state.ratingsPagination.rows = state.ratingsPagination.rows.map(item =>
        item.id === updated.id ? { ...item, ...updated } : item
      )
    },
    deleteRatings: (state, action) => {
      const id = action.payload

      state.ratingsPagination.rows = state.ratingsPagination.rows.filter(item => item.id !== id)
    }
  }
})

export const { setRatingsPagination, addRatingsPagination, updateRatingsPagination, deleteRatings } =
  ratingsSlice.actions
export default ratingsSlice.reducer
