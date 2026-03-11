import http from './http'

export const uploadImport = (file) => {
    const data = new FormData()
    data.append('file', file)
    return http.post('/imports/upload/', data)
}

export const listImports = () => http.get('/imports/')
export const getImport = (id) => http.get(`/imports/${id}/`)
