import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../../services/authApi'
import { authStorage } from '../../utils/authStorage'
import './Login.css'

/* ── Icons ────────────────────────────────────────────────────── */
const IconEyeOpen = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const IconEyeClosed = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
)

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

const IconLogo = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

const IconArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

/* ── Component ────────────────────────────────────────────────── */
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            const res = await login({ email, password })
            authStorage.setToken(res.data.token)
            authStorage.setMustChangePassword(res.data.must_change_password)
            if (res.data.must_change_password) {
                navigate('/change-password')
                return
            }
            navigate(location.state?.from || '/dashboard')
        } catch (err) {
            const data = err.response?.data
            setError(
                data?.detail
                || data?.non_field_errors?.[0]
                || data?.email?.[0]
                || data?.password?.[0]
                || 'Login failed.'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="page">
            <div className="login-wrap">

                {/* ── Logo ── */}
                <div className="login-logo">
                    <div className="login-logo-icon"><IconLogo /></div>
                    <span className="login-logo-text">your·app</span>
                </div>

                <div className="login-card">
                    <div className="login-card-bar" />

                    <div className="login-card-body">
                        <p className="login-eyebrow">Welcome back</p>
                        <h2 className="login-title">Sign in</h2>
                        <p className="login-subtitle">Enter your credentials to continue.</p>

                        {location.state?.registered && (
                            <div className="login-success">
                                Registration successful — check your email for your temporary password.
                            </div>
                        )}

                        <form className="login-form" onSubmit={onSubmit}>

                            {/* Email */}
                            <div className="login-field">
                                <label className="login-label">Email</label>
                                <div className="login-input-wrap">
                                    <input
                                        className="login-input"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="login-field">
                                <label className="login-label">Password</label>
                                <div className="login-input-wrap">
                                    <input
                                        className="login-input has-toggle"
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="login-eye"
                                        onClick={() => setShowPass(v => !v)}
                                        aria-label={showPass ? 'Hide password' : 'Show password'}
                                    >
                                        {showPass ? <IconEyeClosed /> : <IconEyeOpen />}
                                    </button>
                                </div>
                            </div>

                            <button className="login-submit" type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><span className="login-spinner" /> Signing in…</>
                                    : <>Sign in <IconArrow /></>
                                }
                            </button>
                        </form>

                        {error && (
                            <div className="login-error">
                                <IconAlert /><span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="login-card-footer">
                        <p className="login-footer-text">
                            Don't have an account? <Link to="/register">Create one →</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Login