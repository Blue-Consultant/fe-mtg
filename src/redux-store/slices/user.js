import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  usersPagination: {
    totalRows: 0,
    rows: [],
    totalPages: 0,
    currentPage: 1
  },
  users: []
}

export const usersSlice = createSlice({
  name: 'users',
  initialState: initialState,
  reducers: {
    setUsers: (state, action) => {
      if (action.payload.rows) {
        state.usersPagination = action.payload
      } else {
        state.users = action.payload
      }
    },
    addUsers: (state, action) => {
      const newUsers = { ...action.payload }

      if (state.usersPagination.rows) {
        state.usersPagination.rows.push(newUsers)
      } else {
        state.users.push(newUsers)
      }
    },
    updateUsers: (state, action) => {
      const update = action.payload

      if (state.usersPagination.rows && state.usersPagination.rows.length > 0) {
        const index = state.usersPagination.rows.findIndex(
          item =>
            item.Branches.id === update.Branches.id &&
            item.Users.id === update.Users.id
        )

        if (index !== -1) {
          state.usersPagination.rows[index] = update
        } else {
          state.usersPagination.rows.push(update)
        }
      } else {
        const index = state.users.findIndex(
          item =>
            item.Branches.id === update.Branches.id &&
            item.Users.id === update.Users.id
        )

        if (index !== -1) {
          state.users[index] = update
        } else {
          state.users.push(update)
        }
      }
    },
    deleteUsers: (state, action) => {
      const deleteUsers = action.payload

      if (state.usersPagination.rows && state.usersPagination.rows.length > 0) {
        state.usersPagination.rows = state.usersPagination.rows.filter(item => {
          return !(item.Branches.id === deleteUsers.branch_id && item.Users.id === deleteUsers.user_id)
        })
      } else {
        state.users = state.users.filter(item => {
          return !(item.Branches.id === deleteUsers.branch_id && item.Users.id === deleteUsers.user_id)
        })
      }
    }
  }
})

export const { setUsers, addUsers, updateUsers, deleteUsers } = usersSlice.actions

export default usersSlice.reducer
