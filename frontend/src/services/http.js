import axios from 'axios'
import { authStorage } from '../utils/authStorage'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

http.interceptors.request.use((config) => {
    const token = authStorage.getToken()
    if (token) {
        config.headers.Authorization = `Token ${token}`
    }
    return config
})

http.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            authStorage.clearAll()
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default http
