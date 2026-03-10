import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  courtTypesList: []
}

export const courtTypesSlice = createSlice({
  name: 'courtTypes',
  initialState,
  reducers: {
    setCourtTypesList: (state, action) => {
      state.courtTypesList = action.payload
    },
    addCourtType: (state, action) => {
      state.courtTypesList.push(action.payload)
    },
    updateCourtType: (state, action) => {
      const updated = action.payload
      const index = state.courtTypesList.findIndex(item => item.id === updated.id)
      if (index !== -1) state.courtTypesList[index] = { ...state.courtTypesList[index], ...updated }
    },
    deleteCourtType: (state, action) => {
      const id = action.payload
      state.courtTypesList = state.courtTypesList.filter(item => item.id !== id)
    }
  }
})

export const { setCourtTypesList, addCourtType, updateCourtType, deleteCourtType } = courtTypesSlice.actions
export default courtTypesSlice.reducer
