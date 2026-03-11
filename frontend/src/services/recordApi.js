import http from './http'

export const getMyRecord = () => http.get('/record/me/')
export const updateMyRecord = (payload) => http.put('/record/me/', payload)
export const deleteMyRecord = () => http.delete('/record/me/')
