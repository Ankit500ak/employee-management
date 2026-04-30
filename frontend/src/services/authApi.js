import http from './http'

export const login = (payload) => http.post('/auth/login/', payload)
export const logout = () => http.post('/auth/logout/')
export const changePassword = (payload) => http.post('/auth/change-password/', payload)
export const requestOtp = (payload) => http.post('/auth/request-otp/', payload)
export const verifyOtp = (payload) => http.post('/auth/verify-otp/', payload)
export const register = (payload) => http.post('/auth/register/', payload)
export const me = () => http.get('/auth/me/')


export const getCreatedUsers = () => http.get('/auth/created-users/')


export const requestAccess = () => http.post('/auth/access-request/')
export const myAccessRequest = () => http.get('/auth/access-request/mine/')
export const pendingAccessRequests = () => http.get('/auth/access-requests/pending/')
export const resolveAccessRequest = (id, action) => http.post(`/auth/access-requests/${id}/resolve/`, { action })


export const authApi = {
    login,
    logout,
    changePassword,
    requestOtp,
    verifyOtp,
    register,
    me,
    getCreatedUsers,
    requestAccess,
    myAccessRequest,
    pendingAccessRequests,
    resolveAccessRequest,
}
