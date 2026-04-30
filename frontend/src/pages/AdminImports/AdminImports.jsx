import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listImports, uploadImport } from '../../services/importApi'
import './AdminImports.css'


const IconLogo = () => (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8" y="8" width="6" height="6" rx="1.5" fill="currentColor" opacity=".9" />
        <rect x="18" y="8" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="8" y="18" width="6" height="6" rx="1.5" fill="currentColor" opacity=".5" />
        <rect x="18" y="18" width="6" height="6" rx="1.5" fill="currentColor" opacity=".25" />
    </svg>
)

const IconArrowLeft = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const IconUploadCloud = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
)

const IconFile = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
)

const IconUpload = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
)

const IconRefresh = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
)

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
)

const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const IconX = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const IconChevron = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ transition: 'transform 180ms ease', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

const IconLayers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
)

const IconDatabase = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    </svg>
)

const IconTrendUp = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
)

const IconClock = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)


function statusClass(s = '') {
    const l = s.toLowerCase()
    if (l === 'completed') return 'ai-status--completed'
    if (l === 'completed_with_errors') return 'ai-status--warn'
    if (l === 'failed') return 'ai-status--failed'
    if (l === 'processing') return 'ai-status--processing'
    return 'ai-status--pending'
}

function formatDate(iso) {
    if (!iso) return '—'
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        + ' · '
        + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso) {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}


function AdminImports() {
    const navigate = useNavigate()
    const [file, setFile] = useState(null)
    const [jobs, setJobs] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [expandedJob, setExpandedJob] = useState(null)

    const loadJobs = async () => {
        setIsLoading(true)
        try {
            const res = await listImports()
            setJobs(res.data)
            setError('')
        } catch (err) {
            setError(err?.response?.data?.detail || 'Failed to load import jobs.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { loadJobs() }, [])

    const onUpload = async () => {
        if (!file) { setError('Please choose an .xlsx file first.'); return }
        setError(''); setSuccess('')
        setIsUploading(true)
        try {
            await uploadImport(file)
            setFile(null)
            setSuccess('File uploaded successfully! Processing will begin shortly.')
            await loadJobs()
        } catch (err) {
            setError(err?.response?.data?.detail || 'Import upload failed.')
        } finally {
            setIsUploading(false)
        }
    }

    const onDrop = (e) => {
        e.preventDefault(); setDragOver(false)
        const f = e.dataTransfer?.files?.[0]
        if (f?.name?.endsWith('.xlsx')) setFile(f)
        else setError('Only .xlsx files are supported.')
    }

    // Stats
    const totalJobs = jobs.length
    const totalRows = jobs.reduce((s, j) => s + (j.total_rows || 0), 0)
    const totalSuccess = jobs.reduce((s, j) => s + (j.success_count || 0), 0)
    const totalFailed = jobs.reduce((s, j) => s + (j.failed_count || 0), 0)
    const toggleJob = (id) => setExpandedJob(prev => prev === id ? null : id)
    const lastJob = jobs[0]

    return (
        <div className="ai-shell">

            {/* ── Navbar ── */}
            <nav className="ai-nav">
                <div className="ai-nav-left">
                    <div className="ai-nav-brand"><IconLogo /></div>
                    <span className="ai-nav-title">DataVault</span>
                    <span className="ai-nav-sep">/</span>
                    <span className="ai-nav-section">Imports</span>
                </div>
                <div className="ai-nav-right">
                    <button className="ai-nav-back" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', fontWeight: '500' }}>
                        <IconArrowLeft /> Back
                    </button>
                </div>
            </nav>

            <main className="ai-main">

                {/* ── Header ── */}
                <section className="ai-header">
                    <div>
                        <div className="ai-header-row">
                            <h1 className="ai-header-title">Import Jobs</h1>
                            <span className="ai-header-badge">admin</span>
                        </div>
                        <p className="ai-header-sub">Upload Excel files to bulk-import user records into the system.</p>
                    </div>
                </section>

                {/* ── Alerts ── */}
                {error && (
                    <div className="ai-toast ai-toast--error">
                        <IconAlert /><span>{error}</span>
                        <button className="ai-toast-close" onClick={() => setError('')}>&times;</button>
                    </div>
                )}
                {success && (
                    <div className="ai-toast ai-toast--success">
                        <IconCheck /><span>{success}</span>
                        <button className="ai-toast-close" onClick={() => setSuccess('')}>&times;</button>
                    </div>
                )}

                {/* ── Upload Card ── */}
                <div className="ai-upload-card">
                    <div className="ai-upload-bar" />
                    <div className="ai-upload-body">
                        <div className="ai-upload-left">
                            <div
                                className={`ai-dropzone${dragOver ? ' ai-dropzone--active' : ''}${file ? ' ai-dropzone--has-file' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={onDrop}
                            >
                                <input
                                    type="file"
                                    accept=".xlsx"
                                    className="ai-dropzone-input"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className="ai-dropzone-icon">
                                    {file ? <IconFile /> : <IconUploadCloud />}
                                </div>
                                {file ? (
                                    <>
                                        <p className="ai-dropzone-filename">{file.name}</p>
                                        <p className="ai-dropzone-hint">{(file.size / 1024).toFixed(1)} KB &middot; Click or drop to replace</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="ai-dropzone-text">Drop your <strong>.xlsx</strong> file here</p>
                                        <p className="ai-dropzone-hint">or click to browse files</p>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="ai-upload-right">
                            <h3 className="ai-upload-title">Upload Excel File</h3>
                            <p className="ai-upload-desc">
                                The file must contain columns for <strong>email</strong>, <strong>full_name</strong>,
                                <strong> phone</strong>, <strong>address</strong>, and <strong>dob</strong>.
                                Each row creates a user account with auto-generated credentials.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                <button className="ai-btn-upload" onClick={onUpload} disabled={isUploading || !file}>
                                    {isUploading ? (
                                        <><span className="ai-spinner" /> Processing…</>
                                    ) : (
                                        <><IconUpload /> Upload &amp; Import</>
                                    )}
                                </button>
                                <a 
                                    href="/import_template.xlsx" 
                                    download 
                                    className="ai-btn-upload" 
                                    style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                                >
                                    <IconFile /> Download Template
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Loading skeleton ── */}
                {isLoading && (
                    <div className="ai-skeleton-wrap">
                        <div className="ai-skeleton-stats">
                            {[1, 2, 3, 4].map(i => <div key={i} className="ai-skeleton-stat" />)}
                        </div>
                        <div className="ai-skeleton-table" />
                    </div>
                )}

                {/* ── Stats ── */}
                {!isLoading && (
                    <div className="ai-stats">
                        <div className="ai-stat">
                            <div className="ai-stat-icon ai-stat-icon--jobs"><IconLayers /></div>
                            <div className="ai-stat-info">
                                <p className="ai-stat-label">Total Jobs</p>
                                <p className="ai-stat-value">{totalJobs}</p>
                            </div>
                        </div>
                        <div className="ai-stat">
                            <div className="ai-stat-icon ai-stat-icon--rows"><IconDatabase /></div>
                            <div className="ai-stat-info">
                                <p className="ai-stat-label">Rows Processed</p>
                                <p className="ai-stat-value">{totalRows}</p>
                            </div>
                        </div>
                        <div className="ai-stat">
                            <div className="ai-stat-icon ai-stat-icon--success"><IconTrendUp /></div>
                            <div className="ai-stat-info">
                                <p className="ai-stat-label">Successful</p>
                                <p className="ai-stat-value ai-stat-value--success">{totalSuccess}</p>
                            </div>
                        </div>
                        <div className="ai-stat">
                            <div className="ai-stat-icon ai-stat-icon--time"><IconClock /></div>
                            <div className="ai-stat-info">
                                <p className="ai-stat-label">Last Import</p>
                                <p className="ai-stat-value">{lastJob ? timeAgo(lastJob.created_at) : '—'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Jobs Table ── */}
                {!isLoading && (
                    <div className="ai-jobs-section">
                        <div className="ai-jobs-header">
                            <div className="ai-jobs-header-left">
                                <h3 className="ai-jobs-title">Recent Imports</h3>
                                <span className="ai-jobs-count">{totalJobs} job{totalJobs !== 1 ? 's' : ''}</span>
                            </div>
                            <button className="ai-btn-refresh" onClick={loadJobs}>
                                <IconRefresh /> Refresh
                            </button>
                        </div>

                        <div className="ai-jobs-card">
                            {jobs.length === 0 ? (
                                <div className="ai-empty">
                                    <div className="ai-empty-circle"><IconDatabase /></div>
                                    <h3 className="ai-empty-title">No imports yet</h3>
                                    <p className="ai-empty-sub">Upload an Excel file above to create your first import job.</p>
                                </div>
                            ) : (
                                <div className="ai-table-wrap">
                                    <table className="ai-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: 32 }}></th>
                                                <th>File</th>
                                                <th>Status</th>
                                                <th>Total</th>
                                                <th>Success</th>
                                                <th>Failed</th>
                                                <th>Created</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobs.map((j) => {
                                                const isOpen = expandedJob === j.id
                                                const failedRows = (j.rows || []).filter(r => r.status === 'FAILED')
                                                return (
                                                    <>
                                                        <tr key={j.id} className={`ai-job-row${isOpen ? ' ai-job-row--open' : ''}`} onClick={() => toggleJob(j.id)} style={{ cursor: 'pointer' }}>
                                                            <td className="ai-td-chevron">
                                                                <IconChevron open={isOpen} />
                                                            </td>
                                                            <td>
                                                                <div className="ai-file-cell">
                                                                    <div className="ai-file-icon"><IconFile /></div>
                                                                    <span className="ai-file-name" title={j.file_name}>{j.file_name}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`ai-status ${statusClass(j.status)}`}>
                                                                    <span className="ai-status-dot" />
                                                                    {j.status === 'COMPLETED_WITH_ERRORS' ? 'PARTIAL' : j.status}
                                                                </span>
                                                            </td>
                                                            <td className="ai-td-num">{j.total_rows ?? '—'}</td>
                                                            <td className="ai-td-num ai-td-success">{j.success_count ?? '—'}</td>
                                                            <td className="ai-td-num ai-td-failed">{j.failed_count ?? '—'}</td>
                                                            <td className="ai-td-time">{formatDate(j.created_at)}</td>
                                                        </tr>
                                                        {isOpen && (
                                                            <tr key={`${j.id}-detail`} className="ai-detail-row">
                                                                <td colSpan={7} style={{ padding: 0 }}>
                                                                    <div className="ai-detail-panel">
                                                                        <h4 className="ai-detail-title">Row Details</h4>
                                                                        {(j.rows || []).length === 0 ? (
                                                                            <p className="ai-detail-empty">No row data available.</p>
                                                                        ) : (
                                                                            <table className="ai-detail-table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Row</th>
                                                                                        <th>Email</th>
                                                                                        <th>Status</th>
                                                                                        <th>Reason</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {j.rows.map((r) => (
                                                                                        <tr key={r.id} className={r.status === 'FAILED' ? 'ai-detail-tr--failed' : ''}>
                                                                                            <td className="ai-detail-td-row">#{r.row_number}</td>
                                                                                            <td className="ai-detail-td-email">{r.email || '—'}</td>
                                                                                            <td>
                                                                                                <span className={`ai-status-mini ${r.status === 'FAILED' ? 'ai-status-mini--failed' : 'ai-status-mini--success'}`}>
                                                                                                    {r.status}
                                                                                                </span>
                                                                                            </td>
                                                                                            <td className="ai-detail-td-reason">{r.error_message || '—'}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        )}
                                                                        {failedRows.length > 0 && (
                                                                            <div className="ai-detail-summary">
                                                                                <IconAlert /> {failedRows.length} row{failedRows.length !== 1 ? 's' : ''} failed
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>

            {/* ── Footer ── */}
            <footer className="ai-footer">
                <p>DataVault &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    )
}

export default AdminImports