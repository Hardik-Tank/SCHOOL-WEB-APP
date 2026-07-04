import api from './axios.js'

export const listStudents = (params) => api.get('/students', { params })

export const createStudent = (payload) => api.post('/students', payload)

export const updateStudent = (id, payload) => api.put(`/students/${id}`, payload)

export const deleteStudent = (id) => api.delete(`/students/${id}`)
