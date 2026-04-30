import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { chatApi } from '../../services/chatApi'
import { teamApi } from '../../services/teamApi'
import * as authApi from '../../services/authApi'
import './Chat.css'

function Chat() {
    const navigate = useNavigate()
    const [teams, setTeams] = useState([])
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')


    const location = useLocation()
    const [activeChatType, setActiveChatType] = useState(location.state?.chatType || 'team')
    const [activeId, setActiveId] = useState(location.state?.chatId || null)
    const [summary, setSummary] = useState({ teams: {}, users: {} })

    const messagesEndRef = useRef(null)

    useEffect(() => {
        authApi.me().then(res => {
            setCurrentUser(res.data)
            fetchUsers(res.data)
        }).catch(console.error)
        fetchTeams()
    }, [])

    useEffect(() => {
        let interval
        fetchSummary()
        if (activeId) {
            fetchMessages()
        }


        interval = setInterval(() => {
            fetchSummary()
            if (activeId) fetchMessages()
        }, 5000)

        return () => clearInterval(interval)
    }, [activeId, activeChatType])

    const fetchTeams = async () => {
        try {
            const response = await teamApi.getTeams()
            setTeams(response.data)
        } catch (err) {
            console.error('Failed to fetch teams', err)
        }
    }

    const fetchUsers = async (userObj) => {
        try {
            const response = await authApi.getCreatedUsers()
            let uList = response.data

            if (userObj && userObj.parent) {
                const parentUser = {
                    id: userObj.parent,
                    email: userObj.parent_email,
                    isParent: true
                }

                if (!uList.find(u => u.id === parentUser.id)) {
                    uList = [parentUser, ...uList]
                }
            }
            setUsers(uList)
        } catch (err) {
            console.error('Failed to fetch users', err)
        }
    }

    const fetchSummary = async () => {
        try {
            const response = await chatApi.getSummary()
            setSummary(response.data)
        } catch (err) {
            console.error('Failed to fetch summary', err)
        }
    }

    const markAsRead = async () => {
        if (!activeId) return
        try {
            const payload = activeChatType === 'team' ? { team_id: activeId } : { user_id: activeId }
            await chatApi.markRead(payload)

            setSummary(prev => {
                const newSummary = { ...prev }
                if (activeChatType === 'team' && newSummary.teams[activeId]) {
                    newSummary.teams[activeId].unread = 0
                } else if (activeChatType === 'user' && newSummary.users[activeId]) {
                    newSummary.users[activeId].unread = 0
                }
                return newSummary
            })
        } catch (err) {
            console.error('Failed to mark read', err)
        }
    }

    const fetchMessages = async () => {
        if (!activeId) return
        try {
            const params = activeChatType === 'team' ? { team: activeId } : { recipient: activeId }
            const response = await chatApi.getMessages(params)
            setMessages(response.data)
            scrollToBottom()
            markAsRead()
        } catch (err) {
            console.error('Failed to fetch messages', err)
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeId) return

        try {
            const payload = { content: newMessage }
            if (activeChatType === 'team') payload.team = activeId
            else payload.recipient = activeId

            await chatApi.sendMessage(payload)
            setNewMessage('')
            fetchMessages()
        } catch (err) {
            console.error('Failed to send message', err)
        }
    }

    const getInitials = (name) => {
        return name ? name.charAt(0).toUpperCase() : '?'
    }

    const sortedTeams = [...teams].sort((a, b) => {
        const timeA = summary.teams[a.id]?.latest ? new Date(summary.teams[a.id].latest).getTime() : 0
        const timeB = summary.teams[b.id]?.latest ? new Date(summary.teams[b.id].latest).getTime() : 0
        return timeB - timeA
    })

    const sortedUsers = [...users].sort((a, b) => {
        const timeA = summary.users[a.id]?.latest ? new Date(summary.users[a.id].latest).getTime() : 0
        const timeB = summary.users[b.id]?.latest ? new Date(summary.users[b.id].latest).getTime() : 0
        return timeB - timeA
    })

    const IconArrowLeft = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ cursor: 'pointer' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
    )

    return (
        <div className="chat-container">
            <aside className="chat-sidebar">
                <div className="chat-sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{ background: 'transparent', border: 'none', color: '#e8ecf5', padding: '4px', display: 'flex', alignItems: 'center' }}
                        title="Go Back"
                    >
                        <IconArrowLeft />
                    </button>
                    <h2>Chat</h2>
                </div>

                <div className="chat-list-section">
                    <h3>Projects</h3>
                    {sortedTeams.map(team => {
                        const unreadCount = summary.teams[team.id]?.unread || 0
                        return (
                            <div
                                key={team.id}
                                className={`chat-list-item ${activeChatType === 'team' && activeId === team.id ? 'active' : ''}`}
                                onClick={() => { setActiveChatType('team'); setActiveId(team.id) }}
                            >
                                <div className="chat-avatar team">{getInitials(team.name)}</div>
                                <div className="chat-info">
                                    <strong>{team.name}</strong>
                                    <span>{team.members_list.length} members</span>
                                </div>
                                {unreadCount > 0 && <div className="chat-unread-badge">{unreadCount}</div>}
                            </div>
                        )
                    })}
                </div>

                <div className="chat-list-section">
                    <h3>Direct Messages</h3>
                    {sortedUsers.map(user => {
                        const unreadCount = summary.users[user.id]?.unread || 0
                        return (
                            <div
                                key={user.id}
                                className={`chat-list-item ${activeChatType === 'user' && activeId === user.id ? 'active' : ''}`}
                                onClick={() => { setActiveChatType('user'); setActiveId(user.id) }}
                            >
                                <div className={`chat-avatar user ${user.isParent ? 'parent' : ''}`}>{getInitials(user.email)}</div>
                                <div className="chat-info">
                                    <strong>{user.email} {user.isParent && <span style={{ fontSize: '10px', color: '#f59e0b', marginLeft: '4px' }}>(Admin)</span>}</strong>
                                </div>
                                {unreadCount > 0 && <div className="chat-unread-badge">{unreadCount}</div>}
                            </div>
                        )
                    })}
                </div>
            </aside>

            <main className="chat-main">
                {activeId ? (
                    <>
                        <div className="chat-header">
                            <h3>
                                {activeChatType === 'team'
                                    ? teams.find(t => t.id === activeId)?.name
                                    : users.find(u => u.id === activeId)?.email}
                            </h3>
                        </div>
                        <div className="chat-messages">
                            {messages.map(msg => {
                                const isMine = currentUser && msg.sender === currentUser.id
                                return (
                                    <div key={msg.id} className={`chat-message-wrapper ${isMine ? 'mine' : 'theirs'}`}>
                                        {!isMine && (
                                            <div className="chat-avatar small user">
                                                {getInitials(msg.sender_detail.email)}
                                            </div>
                                        )}
                                        <div className="chat-message">
                                            {!isMine && activeChatType === 'team' && (
                                                <div className="chat-sender-name">{msg.sender_detail.email}</div>
                                            )}
                                            <div className="chat-bubble">{msg.content}</div>
                                            <div className="chat-timestamp">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="chat-input-area">
                            <form onSubmit={handleSendMessage} className="chat-form">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="chat-input"
                                />
                                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>Send</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="chat-empty">
                        <h2>Select a project or user to start chatting</h2>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Chat
