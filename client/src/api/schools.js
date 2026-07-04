import api from './axios.js'

export const listSchools = (params) => api.get('/schools', { params })

export const getSchool = (id) => api.get(`/schools/${id}`)

export const approveSchool = (id) => api.patch(`/schools/${id}/approve`)

export const rejectSchool = (id) => api.patch(`/schools/${id}/reject`)
