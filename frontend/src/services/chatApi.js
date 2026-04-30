import http from './http';

const CHAT_API = '/chat';

export const chatApi = {
    getMessages: (params) => http.get(`${CHAT_API}/`, { params }),
    sendMessage: (messageData) => http.post(`${CHAT_API}/`, messageData),
    getSummary: () => http.get(`${CHAT_API}/summary/`),
    markRead: (data) => http.post(`${CHAT_API}/mark_read/`, data),
};
