import { Navigate, Route, Routes } from 'react-router-dom'
import ForcePasswordRoute from './components/ForcePasswordRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AdminImports from './pages/AdminImports/AdminImports'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import Dashboard from './pages/Dashboard/Dashboard'
import EditRecord from './pages/EditRecord/EditRecord'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import VerifyOTP from './pages/VerifyOTP/VerifyOTP'
import { authStorage } from './utils/authStorage'

function App() {
    const token = authStorage.getToken()

    return (
        <Routes>
            <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route
                path="/change-password"
                element={
                    <ProtectedRoute>
                        <ChangePassword />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <ForcePasswordRoute>
                            <Dashboard />
                        </ForcePasswordRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/edit-record"
                element={
                    <ProtectedRoute>
                        <ForcePasswordRoute>
                            <EditRecord />
                        </ForcePasswordRoute>
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/imports"
                element={
                    <ProtectedRoute>
                        <AdminImports />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
        </Routes>
    )
}

export default App
