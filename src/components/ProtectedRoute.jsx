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

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ProtectedRoute
