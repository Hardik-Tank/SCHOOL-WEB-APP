import api from './axios.js'

export const markAttendance = (payload) => api.post('/attendance', payload)

export const getAttendance = (params) => api.get('/attendance', { params })

export const getMyAttendance = (params) => api.get('/attendance/me', { params })

export const getAttendanceSummary = (params) => api.get('/attendance/summary', { params })
