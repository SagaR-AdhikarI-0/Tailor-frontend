import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice'

function ProtectedRoute({ children, allowedRoles = [] }) {
    const location = useLocation()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user = useSelector(selectUser)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }

    const userRole = user?.role?.toLowerCase() || 'user'

    if (allowedRoles.length > 0) {
        const isAllowed = allowedRoles.some((role) => role.toLowerCase() === userRole)
        if (!isAllowed) {
            return <Navigate to={userRole === 'admin' ? '/admin' : '/'} replace />
        }
    }

    return children
}

export default ProtectedRoute
