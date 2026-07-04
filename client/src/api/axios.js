import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('schoolerp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('schoolerp_token')
      sessionStorage.removeItem('schoolerp_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error) {
  const data = error?.response?.data
  if (!data) return error?.message || 'Something went wrong'
  if (data.errors?.length) return data.errors[0].msg
  return data.message || 'Something went wrong'
}

export default api
