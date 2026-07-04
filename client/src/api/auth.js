import api from './axios.js'

export const registerSchool = (payload) => api.post('/auth/register-school', payload)

export const login = (email, password) => api.post('/auth/login', { email, password })

export const getMe = () => api.get('/auth/me')
