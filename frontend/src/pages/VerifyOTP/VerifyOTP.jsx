import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register, requestOtp } from '../../services/authApi'
import './VerifyOTP.css'

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

const IconRefresh = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

const IconMail = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polyline points="22 7 12 13 2 7" />
    </svg>
)


function VerifyOTP() {
    const [otpCode, setOtpCode] = useState('')
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        const payloadRaw = sessionStorage.getItem('register_payload')
        if (!payloadRaw) {
            setError('Registration session not found.')
            return
        }

        const base = JSON.parse(payloadRaw)
        setIsSubmitting(true)
        try {
            await register({ ...base, otp_code: otpCode })
            sessionStorage.removeItem('register_payload')
            navigate('/login', { state: { registered: true } })
        } catch (err) {
            const data = err.response?.data
            const msg = data?.detail
                || (data?.email && data.email[0])
                || (data?.otp_code && data.otp_code[0])
                || 'OTP verification failed.'
            setError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    const onResend = async () => {
        const payloadRaw = sessionStorage.getItem('register_payload')
        if (!payloadRaw) {
            setError('Registration session not found. Please register again.')
            return
        }

        const base = JSON.parse(payloadRaw)
        setError('')
        setInfo('')
        setIsResending(true)
        try {
            await requestOtp({ email: base.email })
            setInfo('A new OTP has been sent to your email.')
        } catch (err) {
            setError(err.response?.data?.detail || 'Unable to resend OTP.')
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="page">
            <div className="otp-wrap">

                {/* ── Logo ── */}
                <div className="otp-logo">
                    <div className="otp-logo-icon"><IconLogo /></div>
                    <span className="otp-logo-text">your·app</span>
                </div>

                <div className="otp-card">
                    <div className="otp-card-bar" />

                    <div className="otp-card-body">
                        <p className="otp-eyebrow">Step 2 of 2</p>
                        <h2 className="otp-title">Verify your email</h2>
                        <p className="otp-subtitle">Enter the one-time code we sent to your inbox.</p>

                        {/* ── Step indicator ── */}
                        <div className="otp-steps">
                            <div className="otp-step done-step">
                                <div className="otp-step-dot done">✓</div>
                                <span className="otp-step-label">Details</span>
                            </div>
                            <div className="otp-step-line done-line" />
                            <div className="otp-step active-step">
                                <div className="otp-step-dot active">2</div>
                                <span className="otp-step-label">Verify</span>
                            </div>
                        </div>

                        <form className="otp-form" onSubmit={onSubmit}>

                            {/* OTP input */}
                            <div className="otp-field">
                                <label className="otp-label">One-Time Code</label>
                                <input
                                    className="otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="Enter code"
                                    required
                                />
                            </div>

                            <button className="otp-submit" type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><span className="otp-spinner" /> Verifying…</>
                                    : <>Verify & Register <IconArrow /></>
                                }
                            </button>
                        </form>

                        {/* Resend */}
                        <button className="otp-resend" onClick={onResend} disabled={isResending}>
                            <IconRefresh />
                            {isResending ? 'Resending…' : 'Resend code'}
                        </button>

                        {/* Info banner */}
                        <div className="otp-info-banner">
                            <IconMail />
                            <span>Credentials will be auto-generated and emailed after verification.</span>
                        </div>

                        {/* Alerts */}
                        {info && (
                            <div className="otp-alert otp-alert-success">
                                <span>{info}</span>
                            </div>
                        )}

                        {error && (
                            <div className="otp-alert otp-alert-error">
                                <IconAlert /><span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="otp-card-footer">
                        <p className="otp-footer-text">
                            Wrong email? <Link to="/register">Back to register →</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default VerifyOTP
