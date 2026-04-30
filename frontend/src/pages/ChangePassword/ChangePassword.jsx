import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { changePassword } from '../../services/authApi'
import { authStorage } from '../../utils/authStorage'
import './ChangePassword.css'


const IconEyeOpen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const IconEyeClosed = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
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

const IconArrowLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
)


function PasswordField({ label, value, onChange, autoComplete }) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="cp-field">
            <label className="cp-label">{label}</label>
            <div className="cp-input-wrap">
                <input
                    className="cp-input"
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    required
                    style={visible ? { WebkitTextSecurity: 'none' } : {}}
                />
                <button
                    type="button"
                    className="cp-eye"
                    onClick={() => setVisible(v => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <IconEyeClosed /> : <IconEyeOpen />}
                </button>
            </div>
        </div>
    )
}


function ChangePassword() {
    const isFirstTime = authStorage.getMustChangePassword()
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            const payload = { new_password: newPassword }
            if (!isFirstTime) payload.old_password = oldPassword
            await changePassword(payload)
            authStorage.setMustChangePassword(false)
            navigate('/dashboard')
        } catch (err) {
            const data = err.response?.data
            const msg = data?.detail
                || data?.non_field_errors?.[0]
                || data?.old_password?.[0]
                || data?.new_password?.[0]
                || 'Password change failed.'
            setError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="page">
            <div className="cp-card">
                <div className="cp-card-bar" />

                <div className="cp-card-body">
                    {!isFirstTime && (
                        <button 
                            onClick={() => navigate('/dashboard')} 
                            style={{ position: 'absolute', top: '16px', left: '16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                            title="Go Back"
                        >
                            <IconArrowLeft />
                        </button>
                    )}
                    <p className="cp-eyebrow">Account Security</p>
                    <h2 className="cp-title">{isFirstTime ? 'Set Your Password' : 'Change Password'}</h2>
                    <p className="cp-subtitle">
                        {isFirstTime
                            ? 'Choose a password for your account (min 8 characters).'
                            : 'Enter your current password, then choose a new one.'}
                    </p>

                    <form className="cp-form" onSubmit={onSubmit}>
                        {!isFirstTime && (
                            <PasswordField
                                label="Current Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        )}
                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            autoComplete="new-password"
                        />

                        <button className="cp-submit" type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? <><span className="cp-spinner" /> Updating…</>
                                : 'Update Password'
                            }
                        </button>
                    </form>

                    {error && (
                        <div className="cp-error">
                            <IconAlert />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                <div className="cp-card-footer">
                    <p className="cp-muted">
                        You'll be redirected to the dashboard after updating.{' '}
                        <Link to="/dashboard">Go there now →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword