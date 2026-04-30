import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskApi } from '../../services/taskApi'
import * as authApi from '../../services/authApi'
import './MyTasks.css'


const IconX = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const IconCalendar = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const IconClipboard = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
)

const IconArrowLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
)

const IconUser = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

function MyTasks() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('to_me') // 'to_me' or 'by_me'
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(null)
    const [error, setError] = useState('')
    const [selectedTask, setSelectedTask] = useState(null)
    const [subUsers, setSubUsers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

    useEffect(() => {
        authApi.me().then(res => setCurrentUser(res.data)).catch(console.error)
        fetchSubUsers()
    }, [])

    useEffect(() => {
        fetchTasks()
    }, [activeTab])

    const fetchSubUsers = async () => {
        try {
            const response = await authApi.getCreatedUsers()
            setSubUsers(response.data)
        } catch (err) {
            console.error('Failed to load sub users', err)
        }
    }

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const response = activeTab === 'to_me' 
                ? await taskApi.getAssignedTasks()
                : await taskApi.getCreatedTasks()
            setTasks(response.data)
            setError('')
        } catch (err) {
            setError('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            setUpdating(taskId)
            await taskApi.updateTaskStatus(taskId, newStatus)
            await fetchTasks()
        } catch (err) {
            setError('Failed to update task status')
        } finally {
            setUpdating(null)
        }
    }

    const handleReassign = async (taskId, newAssigneeId) => {
        if (!newAssigneeId) return
        try {
            setUpdating(taskId)
            await taskApi.reassignTask(taskId, newAssigneeId)
            await fetchTasks()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to reassign task')
        } finally {
            setUpdating(null)
        }
    }

    const getStatusBadgeClass = (status) => {
        return `my-tasks-task-badge--${status.toLowerCase()}`
    }

    const getStatusOptions = (currentStatus) => {
        const allStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
        return allStatuses
    }

    const formatDate = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <div className="my-tasks-shell">
            <main className="my-tasks-main">
                <header className="my-tasks-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="mt-btn mt-btn--ghost"
                            style={{ padding: '8px', color: 'var(--text-2)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            title="Go Back"
                        >
                            <IconArrowLeft />
                        </button>
                        <div>
                            <h1 className="my-tasks-page-title">My Tasks</h1>
                            <p className="my-tasks-page-date">{today}</p>
                        </div>
                    </div>
                </header>


                {error && (
                    <div className="my-tasks-error">
                        <span>{error}</span>
                    </div>
                )}


                <div className="my-tasks-section">
                    <div className="my-tasks-tabs">
                        <button 
                            className={`my-tasks-tab ${activeTab === 'to_me' ? 'active' : ''}`}
                            onClick={() => setActiveTab('to_me')}
                        >
                            Assigned to Me
                        </button>
                        <button 
                            className={`my-tasks-tab ${activeTab === 'by_me' ? 'active' : ''}`}
                            onClick={() => setActiveTab('by_me')}
                        >
                            Assigned by Me
                        </button>
                    </div>

                    <div className="my-tasks-section-header">
                        <h2 className="my-tasks-section-title">
                            {activeTab === 'to_me' ? 'Tasks I Need to Do' : 'Tasks I Created'}
                        </h2>
                        <span style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--sans)', fontWeight: 500 }}>
                            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {loading ? (
                        <div className="my-tasks-loading">Loading your tasks...</div>
                    ) : tasks.length === 0 ? (
                        <div className="my-tasks-empty">
                            <div className="my-tasks-empty-icon">✓</div>
                            <p className="my-tasks-empty-text">No tasks assigned yet</p>
                        </div>
                    ) : (
                        <div className="my-tasks-list">
                            {tasks.map((task) => (
                                <div key={task.id} className="my-tasks-task-card">
                                    <div className="my-tasks-task-header">
                                        <div className="my-tasks-task-title-section">
                                            <h3 className="my-tasks-task-title">{task.title}</h3>
                                            <p className="my-tasks-task-creator">
                                                <IconUser style={{ display: 'inline', marginRight: '4px' }} />
                                                {task.created_by_user.email}
                                            </p>
                                        </div>
                                        <span className={`my-tasks-task-badge ${getStatusBadgeClass(task.status)}`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <p className="my-tasks-task-description">{task.description}</p>

                                    <div className="my-tasks-task-meta">
                                        {task.due_date && (
                                            <>
                                                <span>
                                                    <IconCalendar style={{ display: 'inline', marginRight: '4px' }} />
                                                    Due: {formatDate(task.due_date)}
                                                </span>
                                            </>
                                        )}
                                        <span>Assigned: {formatDate(task.created_at)}</span>
                                    </div>

                                    <div className="my-tasks-task-footer">
                                        <select
                                            className="my-tasks-status-select"
                                            value={task.status}
                                            onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                            disabled={updating === task.id || (activeTab === 'by_me' && currentUser?.id !== task.assigned_to_user?.id && !task.team_detail)}
                                        >
                                            {getStatusOptions(task.status).map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>

                                        {subUsers.length > 0 && currentUser?.is_verified && (
                                            <select
                                                className="my-tasks-status-select"
                                                onChange={(e) => handleReassign(task.id, e.target.value)}
                                                disabled={updating === task.id}
                                                defaultValue=""
                                                style={{ marginLeft: '8px' }}
                                                title="Reassign Task"
                                            >
                                                <option value="" disabled>Reassign to...</option>
                                                {subUsers.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.username} ({user.email})
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        <button
                                            className="my-tasks-btn-details"
                                            onClick={() => setSelectedTask(task)}
                                            style={{ marginLeft: 'auto' }}
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>


            {selectedTask && (
                <div className="my-tasks-modal-overlay" onClick={() => setSelectedTask(null)}>
                    <div className="my-tasks-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="my-tasks-modal-header">
                            <h2 className="my-tasks-modal-title">{selectedTask.title}</h2>
                            <button className="my-tasks-modal-close" onClick={() => setSelectedTask(null)}>
                                <IconX />
                            </button>
                        </div>

                        <div className="my-tasks-modal-body">
                            <div className="my-tasks-modal-section">
                                <h3 className="my-tasks-modal-label">Description</h3>
                                <p className="my-tasks-modal-text">{selectedTask.description}</p>
                            </div>

                            <div className="my-tasks-modal-grid">
                                <div className="my-tasks-modal-item">
                                    <h3 className="my-tasks-modal-label">Status</h3>
                                    <span className={`my-tasks-task-badge ${getStatusBadgeClass(selectedTask.status)}`}>
                                        {selectedTask.status}
                                    </span>
                                </div>
                                <div className="my-tasks-modal-item">
                                    <h3 className="my-tasks-modal-label">Assigned By</h3>
                                    <p className="my-tasks-modal-text">{selectedTask.created_by_user.email}</p>
                                </div>
                                <div className="my-tasks-modal-item">
                                    <h3 className="my-tasks-modal-label">Assignment Type</h3>
                                    <p className="my-tasks-detail-value">
                                        {selectedTask.team_detail ? `Project: ${selectedTask.team_detail.name}` : 'Individual'}
                                    </p>
                                </div>
                            </div>

                            {selectedTask.due_date && (
                                <div className="my-tasks-modal-item">
                                    <h3 className="my-tasks-modal-label">Due Date</h3>
                                    <p className="my-tasks-modal-text">{formatDate(selectedTask.due_date)}</p>
                                </div>
                            )}

                            <div className="my-tasks-modal-grid">
                                <div className="my-tasks-modal-item">
                                    <h3 className="my-tasks-modal-label">Created</h3>
                                    <p className="my-tasks-modal-text">{formatDate(selectedTask.created_at)}</p>
                                </div>
                                <div className="my-tasks-modal-item">
                                    <h3 className="my-tasks-modal-label">Last Updated</h3>
                                    <p className="my-tasks-modal-text">{formatDate(selectedTask.updated_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="my-tasks-modal-footer">
                            <button className="my-tasks-btn-modal-close" onClick={() => setSelectedTask(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyTasks
