import { createSlice } from '@reduxjs/toolkit'
import { clearSession, loadSession } from './authService'

const persistedSession = loadSession()

const initialState = {
  isAuthenticated: Boolean(persistedSession.accessToken),
  user: persistedSession.user ?? null,
  accessToken: persistedSession.accessToken ?? null,
  refreshToken: persistedSession.refreshToken ?? null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
    },
    refreshAccessTokenSuccess: (state, action) => {
      state.isAuthenticated = true
      state.accessToken = action.payload.accessToken
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      clearSession()
    },
  },
})

export const { setCredentials, refreshAccessTokenSuccess, logout } = authSlice.actions

export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => Boolean(state.auth.isAuthenticated)
export const selectUser = (state) => state.auth.user

export default authSlice.reducer
