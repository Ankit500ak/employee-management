import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskApi } from '../../services/taskApi'
import { teamApi } from '../../services/teamApi'
import * as authApi from '../../services/authApi'
import './ManageTasks.css'


const IconPlus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
)

const IconArrowLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
)

const IconTrash = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
)

const IconX = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
)

const IconCheck = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const IconCalendar = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
)

const IconUser = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
)

const IconUsers = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

const IconMail = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-10 7L2 7" />
    </svg>
)

const IconClipboard = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
)

function ManageTasks() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [teams, setTeams] = useState([])
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [taskLoading, setTaskLoading] = useState(false)
    const [error, setError] = useState('')
    

    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignType: 'user', // 'user' or 'team'
        assigned_to: '',
        team_id: '',
        due_date: '',
    })


    const [showTeamForm, setShowTeamForm] = useState(false)
    const [teamFormData, setTeamFormData] = useState({
        name: '',
        members: []
    })

    useEffect(() => {
        fetchUsers()
        fetchTasks()
        fetchTeams()
    }, [])

    const fetchTeams = async () => {
        try {
            const response = await teamApi.getTeams()
            setTeams(response.data)
        } catch (err) {
            console.error('Failed to load teams', err)
        }
    }

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await authApi.getCreatedUsers()
            setUsers(response.data)
        } catch (err) {
            setError('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const fetchTasks = async () => {
        try {
            const response = await taskApi.getCreatedTasks()
            setTasks(response.data)
        } catch (err) {
            setError('Failed to load tasks')
        }
    }

    const handleFormChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const resetForm = () => {
        setFormData({ title: '', description: '', assignType: 'user', assigned_to: '', team_id: '', due_date: '' })
        setShowForm(false)
        setError('')
    }

    const resetTeamForm = () => {
        setTeamFormData({ name: '', members: [] })
        setShowTeamForm(false)
        setError('')
    }

    const handleTeamSubmit = async (e) => {
        e.preventDefault()
        if (!teamFormData.name) {
            setError('Project name is required')
            return
        }
        try {
            await teamApi.createTeam({
                name: teamFormData.name,
                members: teamFormData.members.map(id => parseInt(id))
            })
            resetTeamForm()
            await fetchTeams()
        } catch (err) {
            setError('Failed to create team')
        }
    }

    const handleTeamMemberChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value)
        setTeamFormData(prev => ({ ...prev, members: value }))
    }

    const handleSubmitTask = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.description) {
            setError('Please fill in all required fields')
            return
        }
        if (formData.assignType === 'user' && !formData.assigned_to) {
            setError('Please assign a user')
            return
        }
        if (formData.assignType === 'team' && !formData.team_id) {
            setError('Please assign a project')
            return
        }

        try {
            setTaskLoading(true)
            const payload = {
                title: formData.title,
                description: formData.description,
                due_date: formData.due_date || null,
            }
            if (formData.assignType === 'user') {
                payload.assigned_to = parseInt(formData.assigned_to)
            } else {
                payload.team = parseInt(formData.team_id)
            }

            await taskApi.createTask(payload)
            resetForm()
            await fetchTasks()
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create task')
        } finally {
            setTaskLoading(false)
        }
    }

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Delete this task?')) return
        try {
            setTaskLoading(true)
            await taskApi.deleteTask(taskId)
            await fetchTasks()
        } catch (err) {
            setError('Failed to delete task')
        } finally {
            setTaskLoading(false)
        }
    }

    const getStatusClass = (status) => `mt-badge mt-badge--${status.toLowerCase()}`

    const formatDate = (dateString) => {
        if (!dateString) return ''
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    return (
        <div className="mt-shell">
            <aside className="mt-sidebar">
                <div className="mt-sidebar-brand">
                    <span className="mt-brand-mark" />
                    <span className="mt-brand-name">TaskFlow</span>
                </div>
                <nav className="mt-sidebar-nav">
                    <a className="mt-nav-item mt-nav-item--active" href="#">
                        <IconClipboard /> Tasks
                    </a>
                    <a className="mt-nav-item" href="/">
                        <IconUsers /> Users
                    </a>
                    <a className="mt-nav-item" href="/chat">
                        <IconMail /> Chat
                    </a>
                </nav>
                <div className="mt-sidebar-stats">
                    <div className="mt-stat">
                        <span className="mt-stat-value">{tasks.length}</span>
                        <span className="mt-stat-label">Total Tasks</span>
                    </div>
                    <div className="mt-stat">
                        <span className="mt-stat-value">{users.length}</span>
                        <span className="mt-stat-label">Users</span>
                    </div>
                    <div className="mt-stat">
                        <span className="mt-stat-value">
                            {tasks.filter(t => t.status?.toLowerCase() === 'pending').length}
                        </span>
                        <span className="mt-stat-label">Pending</span>
                    </div>
                </div>
            </aside>

            <main className="mt-main">

                <header className="mt-topbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="mt-btn mt-btn--ghost"
                            style={{ padding: '8px', color: 'var(--text-2)' }}
                            title="Go Back"
                        >
                            <IconArrowLeft />
                        </button>
                        <div>
                            <h1 className="mt-page-title">Task Manager</h1>
                            <p className="mt-page-date">{today}</p>
                        </div>
                    </div>
                    <button
                        className="mt-btn mt-btn--primary"
                        onClick={() => setShowTeamForm(true)}
                        style={{ marginRight: '8px' }}
                    >
                        <IconUsers /> New Project
                    </button>
                    <button
                        className="mt-btn mt-btn--primary"
                        onClick={() => setShowForm(true)}
                    >
                        <IconPlus /> New Task
                    </button>
                </header>


                {error && (
                    <div className="mt-alert">
                        <span>{error}</span>
                        <button className="mt-alert-close" onClick={() => setError('')}>
                            <IconX />
                        </button>
                    </div>
                )}


                {showTeamForm && (
                    <div className="mt-form-card" style={{ marginBottom: '20px' }}>
                        <div className="mt-form-card-header">
                            <h3 className="mt-form-card-title">Create New Project</h3>
                            <button className="mt-icon-btn" onClick={resetTeamForm}>
                                <IconX />
                            </button>
                        </div>
                        <form onSubmit={handleTeamSubmit} className="mt-form">
                            <div className="mt-field">
                                <label className="mt-label" htmlFor="team_name">Project Name <span className="mt-required">*</span></label>
                                <input
                                    type="text"
                                    id="team_name"
                                    className="mt-input"
                                    value={teamFormData.name}
                                    onChange={(e) => setTeamFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Project Alpha"
                                    required
                                />
                            </div>
                            <div className="mt-field">
                                <label className="mt-label" htmlFor="team_members">Select Members (Ctrl/Cmd click for multiple)</label>
                                <select
                                    multiple
                                    id="team_members"
                                    className="mt-select"
                                    value={teamFormData.members}
                                    onChange={handleTeamMemberChange}
                                    style={{ height: '100px' }}
                                >
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mt-form-actions">
                                <button type="submit" className="mt-btn mt-btn--primary">
                                    <IconCheck /> Create Project
                                </button>
                                <button type="button" className="mt-btn mt-btn--ghost" onClick={resetTeamForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                {showForm && (
                    <div className="mt-form-card">
                        <div className="mt-form-card-header">
                            <h3 className="mt-form-card-title">Create New Task</h3>
                            <button className="mt-icon-btn" onClick={resetForm}>
                                <IconX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTask} className="mt-form">
                            <div className="mt-field">
                                <label className="mt-label" htmlFor="title">Task Title <span className="mt-required">*</span></label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    className="mt-input"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    placeholder="e.g. Review Q3 reports"
                                    required
                                />
                            </div>

                            <div className="mt-field">
                                <label className="mt-label" htmlFor="description">Description <span className="mt-required">*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className="mt-textarea"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    placeholder="Describe what needs to be done…"
                                    required
                                />
                            </div>

                            <div className="mt-form-row">
                                <div className="mt-field">
                                    <label className="mt-label">Assign To <span className="mt-required">*</span></label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                        <label>
                                            <input 
                                                type="radio" 
                                                name="assignType" 
                                                value="user" 
                                                checked={formData.assignType === 'user'} 
                                                onChange={handleFormChange} 
                                            /> User
                                        </label>
                                        <label>
                                            <input 
                                                type="radio" 
                                                name="assignType" 
                                                value="team" 
                                                checked={formData.assignType === 'team'} 
                                                onChange={handleFormChange} 
                                            /> Project
                                        </label>
                                    </div>
                                    {formData.assignType === 'user' ? (
                                        <select
                                            id="assigned_to"
                                            name="assigned_to"
                                            className="mt-select"
                                            value={formData.assigned_to}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            <option value="">Select user…</option>
                                            {users.map((user) => (
                                                <option key={user.id} value={user.id}>
                                                    {user.email}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <select
                                            id="team_id"
                                            name="team_id"
                                            className="mt-select"
                                            value={formData.team_id}
                                            onChange={handleFormChange}
                                            required
                                        >
                                            <option value="">Select project…</option>
                                            {teams.map((team) => (
                                                <option key={team.id} value={team.id}>
                                                    {team.name} ({team.members_list.length} members)
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="mt-field">
                                    <label className="mt-label" htmlFor="due_date">Due Date</label>
                                    <input
                                        type="datetime-local"
                                        id="due_date"
                                        name="due_date"
                                        className="mt-input"
                                        value={formData.due_date}
                                        onChange={handleFormChange}
                                    />
                                </div>
                            </div>

                            <div className="mt-form-actions">
                                <button
                                    type="submit"
                                    className="mt-btn mt-btn--primary"
                                    disabled={taskLoading}
                                >
                                    <IconCheck /> {taskLoading ? 'Creating…' : 'Create Task'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-btn mt-btn--ghost"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}


                <div className="mt-content-grid">

                    <section className="mt-panel">
                        <div className="mt-panel-header">
                            <h2 className="mt-panel-title">
                                <IconUsers /> Your Users
                            </h2>
                            <span className="mt-count">{users.length}</span>
                        </div>

                        {loading ? (
                            <div className="mt-loading">
                                <div className="mt-spinner" />
                                <span>Loading users…</span>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="mt-empty">
                                <span className="mt-empty-icon">👥</span>
                                <p>No users created yet</p>
                            </div>
                        ) : (
                            <ul className="mt-user-list">
                                {users.map((user) => (
                                    <li key={user.id} className="mt-user-item">
                                        <div className="mt-avatar">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="mt-user-info">
                                            <strong className="mt-user-name">{user.username}</strong>
                                            <span className="mt-user-email">{user.email}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="mt-btn mt-btn--outline mt-btn--sm"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, assignType: 'user', assigned_to: user.id }))
                                                    setShowForm(true)
                                                }}
                                            >
                                                <IconPlus /> Assign
                                            </button>
                                            <button
                                                className="mt-btn mt-btn--outline mt-btn--sm"
                                                onClick={() => navigate('/chat', { state: { chatType: 'user', chatId: user.id } })}
                                            >
                                                <IconMail /> Chat
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>


                    <section className="mt-panel">
                        <div className="mt-panel-header">
                            <h2 className="mt-panel-title">
                                <IconUsers /> Projects
                            </h2>
                            <span className="mt-count">{teams.length}</span>
                        </div>
                        {teams.length === 0 ? (
                            <div className="mt-empty">
                                <p>No projects created yet</p>
                            </div>
                        ) : (
                            <ul className="mt-user-list">
                                {teams.map((team) => (
                                    <li key={team.id} className="mt-user-item">
                                        <div className="mt-avatar" style={{ backgroundColor: '#4f8ef7' }}>
                                            P
                                        </div>
                                        <div className="mt-user-info">
                                            <strong className="mt-user-name">{team.name}</strong>
                                            <span className="mt-user-email">{team.members_list.length} Members</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className="mt-btn mt-btn--outline mt-btn--sm"
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, assignType: 'team', team_id: team.id }))
                                                    setShowForm(true)
                                                }}
                                            >
                                                <IconPlus /> Assign
                                            </button>
                                            <button
                                                className="mt-btn mt-btn--outline mt-btn--sm"
                                                onClick={() => navigate('/chat', { state: { chatType: 'team', chatId: team.id } })}
                                            >
                                                <IconMail /> Chat
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
                <div className="mt-content-grid" style={{ marginTop: '20px', gridTemplateColumns: '1fr' }}>

                    <section className="mt-panel mt-panel--wide">
                        <div className="mt-panel-header">
                            <h2 className="mt-panel-title">
                                <IconClipboard /> Created Tasks
                            </h2>
                            <span className="mt-count">{tasks.length}</span>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="mt-empty">
                                <span className="mt-empty-icon">📋</span>
                                <p>No tasks created yet</p>
                            </div>
                        ) : (
                            <ul className="mt-task-list">
                                {tasks.map((task) => (
                                    <li key={task.id} className="mt-task-item">
                                        <div className="mt-task-top">
                                            <h3 className="mt-task-title">{task.title}</h3>
                                            <span className={getStatusClass(task.status)}>
                                                {task.status}
                                            </span>
                                        </div>

                                        <p className="mt-task-assignee">
                                            <IconUser />
                                            {task.team_detail ? (
                                                <>Project: {task.team_detail.name}</>
                                            ) : task.assigned_to_user ? (
                                                <>{task.assigned_to_user.email}</>
                                            ) : (
                                                <>Unassigned</>
                                            )}
                                        </p>

                                        <p className="mt-task-desc">{task.description}</p>

                                        <div className="mt-task-footer">
                                            <div className="mt-task-meta">
                                                {task.due_date && (
                                                    <span className="mt-meta-item">
                                                        <IconCalendar /> Due {formatDate(task.due_date)}
                                                    </span>
                                                )}
                                                <span className="mt-meta-item">
                                                    Created {formatDate(task.created_at)}
                                                </span>
                                            </div>
                                            <button
                                                className="mt-btn mt-btn--danger mt-btn--sm"
                                                onClick={() => handleDeleteTask(task.id)}
                                                disabled={taskLoading}
                                            >
                                                <IconTrash /> Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

export default ManageTasks