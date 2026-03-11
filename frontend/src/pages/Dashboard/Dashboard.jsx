import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, me, myAccessRequest, pendingAccessRequests, requestAccess, resolveAccessRequest } from '../../services/authApi'
import { deleteMyRecord, getMyRecord } from '../../services/recordApi'
import { authStorage } from '../../utils/authStorage'
import './Dashboard.css'

/* ── Icons ────────────────────────────────────────────────────── */
const IconLogo = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="18" y="8" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="8" y="18" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="18" y="18" width="6" height="6" rx="1.5" fill="currentColor" opacity=".25" />
    </svg>
)

const IconLogout = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

const IconEdit = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
)

const IconTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
)

const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const IconUser = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const IconCalendar = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const IconMail = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
    </svg>
)

const IconPhone = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
)

const IconMap = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
)

const IconCake = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <line x1="2" y1="21" x2="22" y2="21" />
        <path d="M7 8v3M12 8v3M17 8v3" />
        <path d="M7 4h.01M12 4h.01M17 4h.01" />
    </svg>
)

const IconKey = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
)

const IconUpload = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
)

const IconArrowRight = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const IconDatabase = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    </svg>
)

const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

/* ── Helpers ───────────────────────────────────────────────────── */
function initials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function timeAgo(iso) {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 1) return 'Today'
    if (days === 1) return '1 day ago'
    if (days < 30) return `${days} days ago`
    const months = Math.floor(days / 30)
    if (months === 1) return '1 month ago'
    if (months < 12) return `${months} months ago`
    return `${Math.floor(months / 12)}y ago`
}

function greetByTime() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
}

/* ── Component ────────────────────────────────────────────────── */
function Dashboard() {
    const [record, setRecord] = useState(null)
    const [user, setUser] = useState(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [accessStatus, setAccessStatus] = useState(null)
    const [pendingReqs, setPendingReqs] = useState([])
    const [isRequesting, setIsRequesting] = useState(false)
    const hasLoadedRef = useRef(false)
    const navigate = useNavigate()

    const load = async () => {
        setIsLoading(true)
        try {
            const [recRes, meRes] = await Promise.allSettled([getMyRecord(), me()])
            if (recRes.status === 'fulfilled') setRecord(recRes.value.data)
            else if (recRes.reason?.response?.status === 404) setRecord(null)
            else setError('Unable to load record.')

            if (meRes.status === 'fulfilled') {
                const u = meRes.value.data
                setUser(u)
                // load access-request data after we know the role
                if (u.is_staff) {
                    try {
                        const r = await pendingAccessRequests()
                        setPendingReqs(r.data)
                    } catch { /* ignore */ }
                } else {
                    try {
                        const r = await myAccessRequest()
                        setAccessStatus(r.data)
                    } catch { /* ignore */ }
                }
            }
        } catch {
            setError('Unable to load data.')
        } finally {
            setIsLoading(false)
        }
    }

    const onRequestAccess = async () => {
        setIsRequesting(true)
        try {
            await requestAccess()
            const r = await myAccessRequest()
            setAccessStatus(r.data)
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to send request.'
            setError(msg)
        } finally {
            setIsRequesting(false)
        }
    }

    const onResolve = async (id, action) => {
        try {
            await resolveAccessRequest(id, action)
            setPendingReqs(prev => prev.filter(r => r.id !== id))
        } catch {
            setError('Failed to resolve request.')
        }
    }

    useEffect(() => {
        if (hasLoadedRef.current) return
        hasLoadedRef.current = true
        load()
    }, [])

    const onDelete = async () => {
        if (!window.confirm('Permanently delete your record?')) return
        setIsDeleting(true)
        try {
            await deleteMyRecord()
            setRecord(null)
        } catch {
            setError('Failed to delete record.')
        } finally {
            setIsDeleting(false)
        }
    }

    const onLogout = async () => {
        try { await logout() } catch { /* ignore */ }
        authStorage.clearAll()
        navigate('/login')
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const displayName = record?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'

    return (
        <div className="db-shell">

            {/* ── Navbar ── */}
            <nav className="db-nav">
                <div className="db-nav-left">
                    <div className="db-nav-brand"><IconLogo /></div>
                    <span className="db-nav-title">DataVault</span>
                </div>
                <div className="db-nav-right">
                    {user && <span className="db-nav-email">{user.email}</span>}
                    <div className="db-nav-avatar">
                        {record ? initials(record.full_name) : (user?.email?.[0]?.toUpperCase() || '?')}
                    </div>
                    <button className="db-nav-logout" onClick={onLogout} title="Sign out">
                        <IconLogout />
                    </button>
                </div>
            </nav>

            <main className="db-main">

                {/* ── Welcome ── */}
                <section className="db-welcome">
                    <div>
                        <h1 className="db-welcome-greeting">{greetByTime()}, {displayName}</h1>
                        <p className="db-welcome-date">{today}</p>
                    </div>
                    {!isLoading && !record && (
                        <Link className="db-btn-primary" to="/edit-record">
                            <IconPlus /> Create Record
                        </Link>
                    )}
                </section>

                {/* ── Error ── */}
                {error && (
                    <div className="db-toast db-toast-error">
                        <IconAlert /><span>{error}</span>
                        <button className="db-toast-close" onClick={() => setError('')}>&times;</button>
                    </div>
                )}

                {/* ── Loading skeleton ── */}
                {isLoading && (
                    <div className="db-skeleton-wrap">
                        <div className="db-skeleton-grid">
                            {[1, 2, 3, 4].map(i => <div key={i} className="db-skeleton-stat" />)}
                        </div>
                        <div className="db-skeleton-content">
                            <div className="db-skeleton-card" />
                            <div className="db-skeleton-side" />
                        </div>
                    </div>
                )}

                {/* ── Stats row ── */}
                {!isLoading && (
                    <div className="db-stats">
                        <div className="db-stat">
                            <div className="db-stat-icon db-stat-icon--profile"><IconUser /></div>
                            <div className="db-stat-info">
                                <p className="db-stat-label">Profile</p>
                                <p className="db-stat-value">{record ? 'Active' : 'Empty'}</p>
                            </div>
                            <span className={`db-stat-badge ${record ? 'db-stat-badge--green' : 'db-stat-badge--dim'}`}>
                                {record ? '●' : '○'}
                            </span>
                        </div>
                        <div className="db-stat">
                            <div className="db-stat-icon db-stat-icon--shield"><IconShield /></div>
                            <div className="db-stat-info">
                                <p className="db-stat-label">Account</p>
                                <p className="db-stat-value">{user?.is_verified ? 'Verified' : 'Pending'}</p>
                            </div>
                            <span className={`db-stat-badge ${user?.is_verified ? 'db-stat-badge--green' : 'db-stat-badge--amber'}`}>
                                {user?.is_verified ? <IconCheck /> : '!'}
                            </span>
                        </div>
                        <div className="db-stat">
                            <div className="db-stat-icon db-stat-icon--calendar"><IconCalendar /></div>
                            <div className="db-stat-info">
                                <p className="db-stat-label">Created</p>
                                <p className="db-stat-value">{record ? timeAgo(record.created_at) : '—'}</p>
                            </div>
                        </div>
                        <div className="db-stat">
                            <div className="db-stat-icon db-stat-icon--clock"><IconClock /></div>
                            <div className="db-stat-info">
                                <p className="db-stat-label">Updated</p>
                                <p className="db-stat-value">{record ? timeAgo(record.updated_at) : '—'}</p>
                            </div>
                        </div>
                        {user?.is_staff && (
                            <div className="db-stat">
                                <div className="db-stat-icon db-stat-icon--requests"><IconShield /></div>
                                <div className="db-stat-info">
                                    <p className="db-stat-label">Requests</p>
                                    <p className="db-stat-value">{pendingReqs.length} pending</p>
                                </div>
                                <span className={`db-stat-badge ${pendingReqs.length > 0 ? 'db-stat-badge--amber' : 'db-stat-badge--green'}`}>
                                    {pendingReqs.length > 0 ? '!' : <IconCheck />}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Content grid ── */}
                {!isLoading && (
                    <div className="db-content">

                        {/* ── Profile Card ── */}
                        {record ? (
                            <div className="db-profile-card">
                                <div className="db-profile-bar" />
                                <div className="db-profile-header">
                                    <div className="db-profile-avatar">{initials(record.full_name)}</div>
                                    <div className="db-profile-identity">
                                        <h2 className="db-profile-name">{record.full_name}</h2>
                                        {user && <p className="db-profile-email">{user.email}</p>}
                                        <div className="db-profile-badges">
                                            <span className="db-badge db-badge--green">Active</span>
                                            <span className="db-badge db-badge--dim">{record.source}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="db-profile-details">
                                    <div className="db-detail">
                                        <div className="db-detail-icon"><IconMail /></div>
                                        <div>
                                            <p className="db-detail-label">Email</p>
                                            <p className="db-detail-value">{user?.email || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="db-detail">
                                        <div className="db-detail-icon"><IconPhone /></div>
                                        <div>
                                            <p className="db-detail-label">Phone</p>
                                            <p className="db-detail-value">{record.phone || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="db-detail">
                                        <div className="db-detail-icon"><IconMap /></div>
                                        <div>
                                            <p className="db-detail-label">Address</p>
                                            <p className="db-detail-value">{record.address || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="db-detail">
                                        <div className="db-detail-icon"><IconCake /></div>
                                        <div>
                                            <p className="db-detail-label">Date of Birth</p>
                                            <p className="db-detail-value">{formatDate(record.dob)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="db-profile-meta">
                                    <span>Created {formatDate(record.created_at)}</span>
                                    <span className="db-meta-dot">&middot;</span>
                                    <span>Updated {formatDate(record.updated_at)}</span>
                                </div>

                                <div className="db-profile-actions">
                                    <Link className="db-btn-primary" to="/edit-record">
                                        <IconEdit /> Edit Record
                                    </Link>
                                    <button className="db-btn-danger" onClick={onDelete} disabled={isDeleting}>
                                        <IconTrash /> {isDeleting ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="db-empty-card">
                                <div className="db-empty-visual">
                                    <div className="db-empty-circle"><IconDatabase /></div>
                                </div>
                                <h3 className="db-empty-title">No record found</h3>
                                <p className="db-empty-sub">Create your personal record to get started with DataVault.</p>
                                <Link className="db-btn-primary" to="/edit-record">
                                    <IconPlus /> Create My Record
                                </Link>
                            </div>
                        )}

                        {/* ── Quick Actions ── */}
                        <div className="db-actions-panel">
                            <h3 className="db-actions-title">Quick Actions</h3>
                            <div className="db-actions-list">
                                {record && (
                                    <Link className="db-action-item" to="/edit-record">
                                        <div className="db-action-icon db-action-icon--edit"><IconEdit /></div>
                                        <div className="db-action-text">
                                            <p className="db-action-name">Edit Profile</p>
                                            <p className="db-action-desc">Update your personal information</p>
                                        </div>
                                        <IconArrowRight />
                                    </Link>
                                )}
                                <Link className="db-action-item" to="/change-password">
                                    <div className="db-action-icon db-action-icon--key"><IconKey /></div>
                                    <div className="db-action-text">
                                        <p className="db-action-name">Change Password</p>
                                        <p className="db-action-desc">Update your account password</p>
                                    </div>
                                    <IconArrowRight />
                                </Link>
                                {user?.is_staff && (
                                    <Link className="db-action-item" to="/admin/imports">
                                        <div className="db-action-icon db-action-icon--upload"><IconUpload /></div>
                                        <div className="db-action-text">
                                            <p className="db-action-name">Admin Imports</p>
                                            <p className="db-action-desc">Import records from Excel files</p>
                                        </div>
                                        <IconArrowRight />
                                    </Link>
                                )}

                                {/* ── Access Request (non-admin) ── */}
                                {user && !user.is_staff && !accessStatus?.status && (
                                    <button
                                        className="db-action-item db-action-item--btn"
                                        onClick={onRequestAccess}
                                        disabled={isRequesting}
                                    >
                                        <div className="db-action-icon db-action-icon--access"><IconShield /></div>
                                        <div className="db-action-text">
                                            <p className="db-action-name">{isRequesting ? 'Sending…' : 'Request Admin Access'}</p>
                                            <p className="db-action-desc">Ask your admin for elevated privileges</p>
                                        </div>
                                        <IconArrowRight />
                                    </button>
                                )}
                                {user && !user.is_staff && accessStatus?.status === 'PENDING' && (
                                    <div className="db-action-item db-action-item--status">
                                        <div className="db-action-icon db-action-icon--pending"><IconClock /></div>
                                        <div className="db-action-text">
                                            <p className="db-action-name">Access Request Pending</p>
                                            <p className="db-action-desc">Sent to {accessStatus.approver_email}</p>
                                        </div>
                                        <span className="db-access-badge db-access-badge--pending">Pending</span>
                                    </div>
                                )}
                                {user && !user.is_staff && accessStatus?.status === 'DENIED' && (
                                    <button
                                        className="db-action-item db-action-item--btn"
                                        onClick={onRequestAccess}
                                        disabled={isRequesting}
                                    >
                                        <div className="db-action-icon db-action-icon--denied"><IconShield /></div>
                                        <div className="db-action-text">
                                            <p className="db-action-name">{isRequesting ? 'Sending…' : 'Request Again'}</p>
                                            <p className="db-action-desc">Denied by {accessStatus.approver_email} — try again</p>
                                        </div>
                                        <IconArrowRight />
                                    </button>
                                )}
                                {user && !user.is_staff && accessStatus?.status === 'APPROVED' && (
                                    <div className="db-action-item db-action-item--status">
                                        <div className="db-action-icon db-action-icon--approved"><IconCheck /></div>
                                        <div className="db-action-text">
                                            <p className="db-action-name">Admin Access Granted</p>
                                            <p className="db-action-desc">Approved by {accessStatus.approver_email}</p>
                                        </div>
                                        <span className="db-access-badge db-access-badge--approved">Approved</span>
                                    </div>
                                )}
                            </div>

                            {/* ── Pending Requests (admin) ── */}
                            {user?.is_staff && pendingReqs.length > 0 && (
                                <div className="db-pending-section">
                                    <h4 className="db-pending-heading">Requests</h4>
                                    <div className="db-pending-list">
                                        {pendingReqs.map(req => (
                                            <div key={req.id} className="db-pending-item">
                                                <div className="db-pending-info">
                                                    <p className="db-pending-email">{req.requester_email}</p>
                                                    <p className="db-pending-date">{formatDate(req.created_at)}</p>
                                                </div>
                                                <div className="db-pending-actions">
                                                    <button className="db-btn-tick" onClick={() => onResolve(req.id, 'approve')} title="Approve">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                    </button>
                                                    <button className="db-btn-cross" onClick={() => onResolve(req.id, 'deny')} title="Deny">
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </main>

            {/* ── Footer ── */}
            <footer className="db-footer">
                <p>DataVault &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}

export default Dashboard