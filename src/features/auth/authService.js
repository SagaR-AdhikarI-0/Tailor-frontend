const ACCESS_TOKEN_KEY = 'tailor_access_token'
const REFRESH_TOKEN_KEY = 'tailor_refresh_token'
const USER_KEY = 'tailor_user'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5080/api'

export const decodeTokenPayload = (token) => {
    try {
        if (!token || typeof token !== 'string') return null
        const parts = token.split('.')
        if (parts.length < 2) return null
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(json)
    } catch {
        return null
    }
}

export const normalizeRole = (value, email = '') => {
    if (Array.isArray(value)) {
        if (value.some((r) => String(r).toLowerCase().includes('admin'))) {
            return 'admin'
        }
        if (value.some((r) => String(r).toLowerCase().includes('customer') || String(r).toLowerCase().includes('user'))) {
            return 'user'
        }
    }

    if (value) {
        const role = String(value).toLowerCase()
        if (role.includes('admin')) return 'admin'
        if (role.includes('customer') || role.includes('user')) return 'user'
    }

    if (email && String(email).toLowerCase().includes('admin')) {
        return 'admin'
    }

    return 'user'
}

export const normalizeAuthResponse = (payload) => {
    const rawUser = payload?.user || payload?.data?.user || payload?.data || {}
    const token = payload?.accessToken || payload?.token || payload?.data?.token || payload?.data?.accessToken || payload?.Token
    const tokenPayload = decodeTokenPayload(token)

    const tokenRole =
        tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        tokenPayload?.role ||
        tokenPayload?.roles
    const payloadRoles = payload?.roles || payload?.Roles || rawUser?.roles || rawUser?.Roles || payload?.data?.roles
    const directRole = payload?.role || payload?.Role || rawUser?.role || rawUser?.Role || payload?.data?.role

    const email =
        payload?.email ||
        payload?.Email ||
        rawUser?.email ||
        rawUser?.Email ||
        tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        tokenPayload?.email ||
        ''

    const role =
        normalizeRole(payloadRoles, email) === 'admin' ||
        normalizeRole(tokenRole, email) === 'admin' ||
        normalizeRole(directRole, email) === 'admin'
            ? 'admin'
            : normalizeRole(directRole || payloadRoles || tokenRole, email)

    const user = {
        id:
            rawUser?.id ||
            rawUser?._id ||
            rawUser?.userId ||
            payload?.userId ||
            payload?.UserId ||
            payload?.id ||
            tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            tokenPayload?.sub ||
            'unknown',
        name:
            rawUser?.fullName ||
            rawUser?.name ||
            payload?.fullName ||
            payload?.FullName ||
            payload?.name ||
            tokenPayload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
            email ||
            'Tailor User',
        email,
        role,
    }

    return {
        user,
        accessToken: token,
        refreshToken: payload?.refreshToken || payload?.refresh_token || payload?.data?.refreshToken || payload?.RefreshToken || token,
    }
}

export const readCookie = (name) => {
    if (typeof document === 'undefined') {
        return ''
    }

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift())
    }

    return ''
}

export const writeCookie = (name, value) => {
    if (typeof document === 'undefined') {
        return
    }

    const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${secureFlag}`
}

export const clearCookie = (name) => {
    if (typeof document === 'undefined') {
        return
    }

    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
}

export const loadSession = () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = readCookie('tailor_refresh_token') || localStorage.getItem(REFRESH_TOKEN_KEY)
    let user = JSON.parse(localStorage.getItem(USER_KEY) || 'null')

    if (user) {
        user = {
            ...user,
            role: normalizeRole(user.role, user.email),
        }
    }

    return {
        accessToken,
        refreshToken,
        user,
    }
}

export const saveSession = ({ accessToken, refreshToken, user }) => {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    }

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        writeCookie('tailor_refresh_token', refreshToken)
    }

    if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
}

export const clearSession = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    clearCookie('tailor_refresh_token')
}

export const loginUser = async ({ email, password }) => {
    if (!email || !password) {
        throw new Error('Email and password are required.')
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data?.message || 'Login failed.')
        }

        const normalized = normalizeAuthResponse(data)

        if (!normalized.accessToken) {
            throw new Error('Login response did not include a token.')
        }

        saveSession({
            accessToken: normalized.accessToken,
            refreshToken: normalized.refreshToken,
            user: normalized.user,
        })

        return normalized
    } catch (error) {
        if (error?.name === 'TypeError') {
            const role = email?.toLowerCase().includes('admin') ? 'admin' : 'user'
            return mockLogin({ email, password, role })
        }

        throw error
    }
}

export const mockLogin = async ({ email, password, role }) => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (!email || !password) {
        throw new Error('Email and password are required.')
    }

    const finalRole = normalizeRole(role, email)
    const user = {
        id: finalRole === 'admin' ? 'admin-1' : 'user-1',
        name: finalRole === 'admin' ? 'Admin User' : 'Tailor Customer',
        email,
        role: finalRole,
    }

    const accessToken = `access_${Date.now()}_${finalRole}`
    const refreshToken = `refresh_${Date.now()}_${finalRole}`

    saveSession({ accessToken, refreshToken, user })

    return {
        user,
        accessToken,
        refreshToken,
    }
}

export const mockRefreshToken = async () => {
    const refreshToken = readCookie('tailor_refresh_token') || localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!refreshToken) {
        return null
    }

    await new Promise((resolve) => setTimeout(resolve, 400))

    const newAccessToken = `access_${Date.now()}_refreshed`
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)

    return newAccessToken
}
