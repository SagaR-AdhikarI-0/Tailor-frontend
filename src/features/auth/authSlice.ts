import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearSession, loadSession } from './authService';

type UserRole = 'user' | 'admin';

type AuthUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
};

type AuthState = {
    isAuthenticated: boolean;
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
};

const persistedSession = loadSession();

const initialState: AuthState = {
    isAuthenticated: Boolean(persistedSession.accessToken),
    user: persistedSession.user ?? null,
    accessToken: persistedSession.accessToken ?? null,
    refreshToken: persistedSession.refreshToken ?? null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{
                user: AuthUser;
                accessToken: string;
                refreshToken: string;
            }>,
        ) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        refreshAccessTokenSuccess: (state, action: PayloadAction<{ accessToken: string }>) => {
            state.isAuthenticated = true;
            state.accessToken = action.payload.accessToken;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            clearSession();
        },
    },
});

export const { setCredentials, refreshAccessTokenSuccess, logout } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth.isAuthenticated);
export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;