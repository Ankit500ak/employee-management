import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyRecord, updateMyRecord } from '../../services/recordApi'
import './EditRecord.css'

/* ── Icons ────────────────────────────────────────────────────── */
const IconSave = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
)

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

/* ── Field component ──────────────────────────────────────────── */
function Field({ label, value, onChange, placeholder, required }) {
    return (
        <div className="er-field">
            <div className="er-label-row">
                <label className="er-label">{label}</label>
                {!required && <span className="er-optional">optional</span>}
            </div>
            <input
                className="er-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
            />
        </div>
    )
}

/* ── Component ────────────────────────────────────────────────── */
function EditRecord() {
    const [form, setForm] = useState({ full_name: '', phone: '', address: '', dob: '' })
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const hasLoadedRef = useRef(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true

        getMyRecord()
            .then((res) => setForm({
                full_name: res.data.full_name || '',
                phone: res.data.phone || '',
                address: res.data.address || '',
                dob: res.data.dob || '',
            }))
            .catch((err) => {
                if (err?.response?.status === 404) { setError(''); return }
                setError('Failed to load record.')
            })
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            await updateMyRecord(form)
            navigate('/dashboard')
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to update record.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

    return (
        <div className="page">
            <div className="er-card">
                <div className="er-card-bar" />

                <div className="er-header">
                    <p className="er-eyebrow">My Profile</p>
                    <h2 className="er-title">Edit Record</h2>
                    <p className="er-subtitle">Update your personal information below.</p>
                </div>

                <form className="er-form" onSubmit={onSubmit}>
                    <Field
                        label="Full Name"
                        value={form.full_name}
                        onChange={(e) => onChange('full_name', e.target.value)}
                        placeholder="Jane Smith"
                        required
                    />
                    <Field
                        label="Phone"
                        value={form.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                    />
                    <Field
                        label="Address"
                        value={form.address}
                        onChange={(e) => onChange('address', e.target.value)}
                        placeholder="123 Main St, City, Country"
                    />
                    <div className="er-field">
                        <div className="er-label-row">
                            <label className="er-label">Date of Birth</label>
                            <span className="er-optional">optional</span>
                        </div>
                        <input
                            className="er-input"
                            type="date"
                            value={form.dob}
                            onChange={(e) => onChange('dob', e.target.value)}
                        />
                    </div>
                </form>

                {error && (
                    <div className="er-error">
                        <IconAlert /><span>{error}</span>
                    </div>
                )}

                <div className="er-footer">
                    <button className="btn-save" onClick={onSubmit} disabled={isSubmitting}>
                        {isSubmitting
                            ? <><span className="er-spinner" /> Saving…</>
                            : <><IconSave /> Save Changes</>
                        }
                    </button>
                    <Link className="btn-cancel" to="/dashboard">Cancel</Link>
                </div>
            </div>
        </div>
    )
}

export default EditRecord