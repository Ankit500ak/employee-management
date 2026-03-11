import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { requestOtp } from '../../services/authApi'
import './Register.css'

/* ── Icons ────────────────────────────────────────────────────── */
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

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

/* ── Field ────────────────────────────────────────────────────── */
function Field({ label, type = 'text', value, onChange, placeholder, required, autoComplete }) {
    return (
        <div className="reg-field">
            <div className="reg-label-row">
                <label className="reg-label">{label}</label>
                {!required && <span className="reg-optional">optional</span>}
            </div>
            <input
                className="reg-input"
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
            />
        </div>
    )
}

/* ── Component ────────────────────────────────────────────────── */
function Register() {
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '', dob: '' })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }))

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            await requestOtp({ email: form.email })
            sessionStorage.setItem('register_payload', JSON.stringify(form))
            navigate('/verify-otp')
        } catch (err) {
            setError(err.response?.data?.detail || 'OTP request failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="page">
            <div className="reg-wrap">

                {/* ── Logo ── */}
                <div className="reg-logo">
                    <div className="reg-logo-icon"><IconLogo /></div>
                    <span className="reg-logo-text">your·app</span>
                </div>

                <div className="reg-card">
                    <div className="reg-card-bar" />

                    <div className="reg-card-body">
                        <p className="reg-eyebrow">Get started</p>
                        <h2 className="reg-title">Create account</h2>
                        <p className="reg-subtitle">Fill in your details. We'll send a one-time code to verify your email.</p>

                        {/* ── Step indicator ── */}
                        <div className="reg-steps">
                            <div className="reg-step active-step">
                                <div className="reg-step-dot active">1</div>
                                <span className="reg-step-label">Details</span>
                            </div>
                            <div className="reg-step-line" />
                            <div className="reg-step inactive-step">
                                <div className="reg-step-dot inactive">2</div>
                                <span className="reg-step-label">Verify</span>
                            </div>
                        </div>

                        <form className="reg-form" onSubmit={onSubmit}>
                            <Field
                                label="Full Name"
                                value={form.full_name}
                                onChange={(e) => onChange('full_name', e.target.value)}
                                placeholder="Jane Smith"
                                autoComplete="name"
                                required
                            />
                            <Field
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={(e) => onChange('email', e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                            />

                            {/* Optional fields side-by-side */}
                            <div className="reg-row">
                                <Field
                                    label="Phone"
                                    value={form.phone}
                                    onChange={(e) => onChange('phone', e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    autoComplete="tel"
                                />
                                <Field
                                    label="Address"
                                    value={form.address}
                                    onChange={(e) => onChange('address', e.target.value)}
                                    placeholder="City, Country"
                                    autoComplete="street-address"
                                />
                            </div>

                            <div className="reg-field">
                                <div className="reg-label-row">
                                    <label className="reg-label">Date of Birth</label>
                                    <span className="reg-optional">optional</span>
                                </div>
                                <input
                                    className="reg-input"
                                    type="date"
                                    value={form.dob}
                                    onChange={(e) => onChange('dob', e.target.value)}
                                />
                            </div>

                            <button className="reg-submit" type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><span className="reg-spinner" /> Sending code…</>
                                    : <>Continue <IconArrow /></>
                                }
                            </button>
                        </form>

                        {error && (
                            <div className="reg-error">
                                <IconAlert /><span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="reg-card-footer">
                        <p className="reg-footer-text">
                            Already have an account? <Link to="/login">Sign in →</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Register