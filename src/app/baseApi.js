import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout, refreshAccessTokenSuccess } from '../features/auth/authSlice'
import { saveSession } from '../features/auth/authService'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080/api'

const baseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState()?.auth?.accessToken

        if (token) {
            headers.set('Authorization', `Bearer ${token}`)
        }

        return headers
    },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    const normalizedArgs = typeof args === 'string' ? { url: args } : { ...args }
    const requireAuth = normalizedArgs.requireAuth !== false

    const result = await baseQuery(normalizedArgs, api, extraOptions)

    if (result.error && result.error.status === 401 && requireAuth) {
        const refreshToken = api.getState()?.auth?.refreshToken

        if (!refreshToken) {
            api.dispatch(logout())
            return result
        }

        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh',
                method: 'POST',
                credentials: 'include',
                ...(refreshToken ? { body: { refreshToken } } : {}),
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            api,
            extraOptions,
        )

        if (refreshResult.data?.accessToken) {
            const nextAccessToken = refreshResult.data.accessToken
            const nextRefreshToken = refreshResult.data.refreshToken || refreshToken

            saveSession({
                accessToken: nextAccessToken,
                refreshToken: nextRefreshToken,
                user: api.getState()?.auth?.user,
            })

            api.dispatch(
                refreshAccessTokenSuccess({
                    accessToken: nextAccessToken,
                    refreshToken: nextRefreshToken,
                }),
            )

            const newHeaders = new Headers(normalizedArgs.headers || {})
            newHeaders.set('Authorization', `Bearer ${nextAccessToken}`)

            return baseQuery({ ...normalizedArgs, headers: newHeaders }, api, extraOptions)
        }

        api.dispatch(logout())
        return result
    }

    return result
}

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Garment', 'Design', 'Fabric', 'Orders'],
    endpoints: () => ({}),
})
