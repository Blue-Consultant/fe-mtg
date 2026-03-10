import { createSlice } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'

const initialState = {
  // token: null,
  user: null
}

// Hooks
export const loginSlice = createSlice({
  name: 'login',
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      const { user } = action.payload
      state.user = user
    },
    logout: (state, action) => {
      state.user = null
      // Limpiar solo los datos de login, no todo el localStorage
      localStorage.removeItem('persist:login')
      localStorage.removeItem('persist:root')
    },
    userStoredData: (state, action) => {
      return { ...state, user: action.payload }
    }
  }
})

export const { setUser, logout, userStoredData } = loginSlice.actions

export default loginSlice.reducer
