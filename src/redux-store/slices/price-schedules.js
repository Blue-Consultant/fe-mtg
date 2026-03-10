import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  priceSchedulesPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  priceSchedules: [],
  priceSchedule: null
}

export const priceSchedulesSlice = createSlice({
  name: 'priceSchedules',
  initialState: initialState,
  reducers: {
    setPriceSchedulesPagination: (state, action) => {
      state.priceSchedulesPagination = action.payload
    },
    addPriceSchedulesPagination: (state, action) => {
      const newPriceSchedule = { ...action.payload }

      state.priceSchedulesPagination.rows.push(newPriceSchedule)
    },
    addManyPriceSchedulesPagination: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : []

      state.priceSchedulesPagination.rows.push(...items)
    },
    updatePriceSchedulesPagination: (state, action) => {
      const updatedPriceSchedule = action.payload

      state.priceSchedulesPagination.rows = state.priceSchedulesPagination.rows.map(item =>
        item.id === updatedPriceSchedule.id ? { ...item, ...updatedPriceSchedule } : item
      )
    },
    deletePriceSchedules: (state, action) => {
      const deleted = action.payload

      state.priceSchedulesPagination.rows = state.priceSchedulesPagination.rows.filter(item => {
        return item.id != deleted
      })
    }
  }
})

export const {
  setPriceSchedulesPagination,
  addPriceSchedulesPagination,
  addManyPriceSchedulesPagination,
  updatePriceSchedulesPagination,
  deletePriceSchedules
} = priceSchedulesSlice.actions

export default priceSchedulesSlice.reducer
