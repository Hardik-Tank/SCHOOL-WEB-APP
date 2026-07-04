import api from './axios.js'

export const listTeachers = (params) => api.get('/teachers', { params })

export const createTeacher = (payload) => api.post('/teachers', payload)

export const updateTeacher = (id, payload) => api.put(`/teachers/${id}`, payload)

export const deleteTeacher = (id) => api.delete(`/teachers/${id}`)
