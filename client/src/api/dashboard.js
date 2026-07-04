import api from './axios.js'

export const getSuperAdminDashboard = () => api.get('/dashboard/super-admin')

export const getSchoolAdminDashboard = () => api.get('/dashboard/school-admin')

export const getTeacherDashboard = () => api.get('/dashboard/teacher')

export const getStudentDashboard = () => api.get('/dashboard/student')
