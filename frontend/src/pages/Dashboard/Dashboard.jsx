const IconClipboard = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
)
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, me, myAccessRequest, pendingAccessRequests, requestAccess, resolveAccessRequest, getCreatedUsers } from '../../services/authApi';
import { deleteMyRecord, getMyRecord } from '../../services/recordApi';
import { taskApi } from '../../services/taskApi';
import { authStorage } from '../../utils/authStorage';
import './Dashboard.css';


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



function Dashboard() {
    const [record, setRecord] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [accessStatus, setAccessStatus] = useState(null);
    const [pendingReqs, setPendingReqs] = useState([]);
    const [isRequesting, setIsRequesting] = useState(false);
    const [createdUsers, setCreatedUsers] = useState([]);
    const [taskStats, setTaskStats] = useState(null);
    const hasLoadedRef = useRef(false);
    const navigate = useNavigate();


    const load = async () => {
        setIsLoading(true);
        try {
            const [recRes, meRes, statsRes] = await Promise.allSettled([
                getMyRecord(), 
                me(),
                taskApi.getDashboardStats()
            ]);
            
            if (recRes.status === 'fulfilled') setRecord(recRes.value.data);
            else if (recRes.reason?.response?.status === 404) setRecord(null);
            else setError('Unable to load record.');

            if (statsRes.status === 'fulfilled') setTaskStats(statsRes.value.data);

            if (meRes.status === 'fulfilled') {
                const u = meRes.value.data;
                setUser(u);
                if (u.is_staff) {
                    try {
                        const r = await pendingAccessRequests();
                        setPendingReqs(r.data);
                        try {
                            const usersRes = await getCreatedUsers();
                            setCreatedUsers(usersRes.data);
                        } catch { }
                    } catch { }
                } else {
                    try {
                        const r = await myAccessRequest();
                        setAccessStatus(r.data);
                    } catch { }
                }
            }
        } catch {
            setError('Unable to load data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasLoadedRef.current) return;
        hasLoadedRef.current = true;
        load();
    }, []);

    const onDelete = async () => {
        if (!window.confirm('Permanently delete your record?')) return;
        setIsDeleting(true);
        try {
            await deleteMyRecord();
            setRecord(null);
        } catch {
            setError('Failed to delete record.');
        } finally {
            setIsDeleting(false);
        }
    };

    const onLogout = async () => {
        try { await logout(); } catch { }
        authStorage.clearAll();
        navigate('/login');
    };

    const onRequestAccess = async () => {
        setIsRequesting(true);
        try {
            await requestAccess();
            const r = await myAccessRequest();
            setAccessStatus(r.data);
        } catch (err) {
            const msg = err.response?.data?.detail || err.response?.data?.error || 'Failed to send request.';
            setError(msg);
        } finally {
            setIsRequesting(false);
        }
    };

    const onResolve = async (id, action) => {
        try {
            await resolveAccessRequest(id, action);
            setPendingReqs(prev => prev.filter(r => r.id !== id));
        } catch {
            setError('Failed to resolve request.');
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const displayName = record?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';


    return (
        <div className="mt-shell">
            <aside className="mt-sidebar">
                <div className="mt-sidebar-brand">
                    <span className="mt-brand-mark" />
                    <span className="mt-brand-name">DataVault</span>
                </div>
                <nav className="mt-sidebar-nav">
                    <Link className="mt-nav-item mt-nav-item--active" to="/dashboard">
                        <IconUser /> Dashboard
                    </Link>
                    {user?.is_staff && (
                        <Link className="mt-nav-item" to="/admin/tasks">
                            <IconUpload /> Manage Tasks
                        </Link>
                    )}
                    {user?.is_staff && (
                        <Link className="mt-nav-item" to="/admin/imports">
                            <IconUpload /> Admin Imports
                        </Link>
                    )}
                    <Link className="mt-nav-item" to="/my-tasks">
                        <IconClipboard /> My Tasks
                    </Link>
                    <Link className="mt-nav-item" to="/chat">
                        <IconMail /> Chat
                    </Link>
                </nav>
                <div className="mt-sidebar-stats">
                    <div className="mt-stat">
                        <span className="mt-stat-value">{createdUsers.length}</span>
                        <span className="mt-stat-label">Users</span>
                    </div>
                    <div className="mt-stat">
                        <span className="mt-stat-value">{pendingReqs.length}</span>
                        <span className="mt-stat-label">Pending</span>
                    </div>
                </div>
            </aside>

            <main className="mt-main">
                <header className="mt-topbar">
                    <div>
                        <h1 className="mt-page-title">Dashboard</h1>
                        <p className="mt-page-date">{today}</p>
                    </div>
                    <button className="mt-btn mt-btn--primary" onClick={onLogout} title="Sign out">
                        <IconLogout /> Logout
                    </button>
                </header>

                {error && (
                    <div className="mt-alert">
                        <span>{error}</span>
                        <button className="mt-alert-close" onClick={() => setError('')}>
                            <IconTrash />
                        </button>
                    </div>
                )}

                {taskStats && (
                    <div className="mt-content-grid" style={{ marginBottom: '24px', gridTemplateColumns: '1fr' }}>
                        <section className="mt-panel mt-panel--wide">
                            <div className="mt-panel-header">
                                <h2 className="mt-panel-title">
                                    <IconClipboard /> Task Overview
                                </h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: taskStats.overdue_tasks?.length > 0 ? '32px' : '0' }}>
                                <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '8px' }}>{taskStats.total}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tasks</div>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', borderBottom: '3px solid var(--warning)' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '8px' }}>{taskStats.pending}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</div>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', borderBottom: '3px solid var(--accent)' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '8px' }}>{taskStats.in_progress}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>In Progress</div>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius)', textAlign: 'center', border: '1px solid var(--border)', borderBottom: '3px solid var(--success)' }}>
                                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-1)', marginBottom: '8px' }}>{taskStats.completed}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</div>
                                </div>
                            </div>
                            
                            {taskStats.overdue_tasks?.length > 0 && (
                                <div>
                                    <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                        <IconAlert /> Overdue Tasks
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
                                        {taskStats.overdue_tasks.map(task => (
                                            <li key={task.id} style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <strong style={{ display: 'block', color: '#fca5a5', marginBottom: '6px', fontSize: '15px' }}>{task.title}</strong>
                                                    <span style={{ fontSize: '13px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <IconCalendar /> Due: {formatDate(task.due_date)}
                                                    </span>
                                                </div>
                                                <Link to="/my-tasks" className="mt-btn mt-btn--sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.2)' }}>View</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </section>
                    </div>
                )}

                <div className="mt-content-grid">
                    <section className="mt-panel">
                        <div className="mt-panel-header">
                            <h2 className="mt-panel-title">
                                <IconUser /> Profile
                            </h2>
                        </div>
                        {record ? (
                            <div style={{ padding: '18px' }}>
                                <div className="db-profile-avatar" style={{ margin: '0 auto 16px' }}>{initials(record.full_name)}</div>
                                <h3 style={{ textAlign: 'center', marginBottom: 8 }}>{record.full_name}</h3>
                                <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>{user?.email}</div>
                                <div style={{ marginTop: 18 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div><b>Phone:</b> {record.phone || '—'}</div>
                                        <div><b>Address:</b> {record.address || '—'}</div>
                                        <div><b>DOB:</b> {formatDate(record.dob)}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
                                    <Link className="mt-btn mt-btn--primary" to="/edit-record">
                                        <IconEdit /> Edit
                                    </Link>
                                    <button className="mt-btn mt-btn--danger" onClick={onDelete} disabled={isDeleting}>
                                        <IconTrash /> {isDeleting ? 'Deleting…' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-empty">
                                <span className="mt-empty-icon">📄</span>
                                <p>No record found</p>
                                <Link className="mt-btn mt-btn--primary" to="/edit-record">
                                    <IconPlus /> Create My Record
                                </Link>
                            </div>
                        )}
                    </section>

                    {user?.is_staff && (
                        <section className="mt-panel mt-panel--wide">
                            <div className="mt-panel-header">
                                <h2 className="mt-panel-title">
                                    <IconUser /> Your Created Users
                                </h2>
                                <span className="mt-count">{createdUsers.length}</span>
                            </div>
                            {createdUsers.length === 0 ? (
                                <div className="mt-empty">
                                    <span className="mt-empty-icon">👤</span>
                                    <p>No users created yet</p>
                                </div>
                            ) : (
                                <ul className="mt-user-list">
                                    {createdUsers.map((u) => (
                                        <li key={u.id} className="mt-user-item">
                                            <div className="mt-avatar">{initials(u.username || u.email)}</div>
                                            <div className="mt-user-info">
                                                <strong className="mt-user-name">{u.username}</strong>
                                                <span className="mt-user-email">{u.email}</span>
                                            </div>
                                            <span className={`db-user-badge ${u.is_verified ? 'db-user-badge--verified' : 'db-user-badge--pending'}`}>
                                                {u.is_verified ? 'Verified' : 'Pending'}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}

                    {user?.is_staff && pendingReqs.length > 0 && (
                        <section className="mt-panel mt-panel--wide">
                            <div className="mt-panel-header">
                                <h2 className="mt-panel-title">
                                    <IconShield /> Pending Requests
                                </h2>
                                <span className="mt-count">{pendingReqs.length}</span>
                            </div>
                            <div className="db-pending-list">
                                {pendingReqs.map(req => (
                                    <div key={req.id} className="db-pending-item">
                                        <div className="db-pending-info">
                                            <p className="db-pending-email">{req.requester_email}</p>
                                            <p className="db-pending-date">{formatDate(req.created_at)}</p>
                                        </div>
                                        <div className="db-pending-actions">
                                            <button className="db-btn-tick" onClick={() => onResolve(req.id, 'approve')} title="Approve">
                                                <IconCheck />
                                            </button>
                                            <button className="db-btn-cross" onClick={() => onResolve(req.id, 'deny')} title="Deny">
                                                <IconTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {user && !user.is_staff && (
                        <section className="mt-panel mt-panel--wide">
                            <div className="mt-panel-header">
                                <h2 className="mt-panel-title">
                                    <IconShield /> Access Request
                                </h2>
                            </div>
                            {!accessStatus?.status && (
                                <button
                                    className="mt-btn mt-btn--primary"
                                    onClick={onRequestAccess}
                                    disabled={isRequesting}
                                >
                                    <IconShield /> {isRequesting ? 'Sending…' : 'Request Admin Access'}
                                </button>
                            )}
                            {accessStatus?.status === 'PENDING' && (
                                <div className="mt-alert">
                                    <IconClock /> Access Request Pending (Sent to {accessStatus.approver_email})
                                </div>
                            )}
                            {accessStatus?.status === 'DENIED' && (
                                <button
                                    className="mt-btn mt-btn--danger"
                                    onClick={onRequestAccess}
                                    disabled={isRequesting}
                                >
                                    <IconShield /> {isRequesting ? 'Sending…' : 'Request Again'} (Denied by {accessStatus.approver_email})
                                </button>
                            )}
                            {accessStatus?.status === 'APPROVED' && (
                                <div className="mt-alert" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                                    <IconCheck /> Admin Access Granted (Approved by {accessStatus.approver_email})
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard