import { Navigate, useLocation } from 'react-router-dom'
import { authStorage } from '../utils/authStorage'

function ProtectedRoute({ children }) {
    const location = useLocation()
    const token = authStorage.getToken()
    if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
    return children
}

export default ProtectedRoute
