import api from './axios.js'

export const listClasses = (params) =>
  api.get('/classes', { params }).then((res) => {
    res.data.data = [...res.data.data].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    )
    return res
  })

export const createClass = (payload) => api.post('/classes', payload)

export const updateClass = (id, payload) => api.put(`/classes/${id}`, payload)

export const deleteClass = (id) => api.delete(`/classes/${id}`)
