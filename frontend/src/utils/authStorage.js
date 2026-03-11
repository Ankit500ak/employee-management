export const authStorage = {
    getToken() {
        return localStorage.getItem('token')
    },
    setToken(token) {
        localStorage.setItem('token', token)
    },
    clearToken() {
        localStorage.removeItem('token')
    },
    getMustChangePassword() {
        return localStorage.getItem('must_change_password') === 'true'
    },
    setMustChangePassword(value) {
        localStorage.setItem('must_change_password', String(Boolean(value)))
    },
    clearAll() {
        localStorage.removeItem('token')
        localStorage.removeItem('must_change_password')
    },
}
