import { Navigate } from 'react-router-dom'
import { authStorage } from '../utils/authStorage'

function ForcePasswordRoute({ children }) {
    const mustChangePassword = authStorage.getMustChangePassword()
    if (mustChangePassword) return <Navigate to="/change-password" replace />
    return children
}

export default ForcePasswordRoute
