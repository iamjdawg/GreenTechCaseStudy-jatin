import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Inventory
export const getItems = (params) => api.get('/inventory', { params })
export const getItem = (id) => api.get(`/inventory/${id}`)
export const createItem = (data) => api.post('/inventory', data)
export const updateItem = (id, data) => api.put(`/inventory/${id}`, data)
export const deleteItem = (id) => api.delete(`/inventory/${id}`)
export const getExpiringItems = (days = 7) => api.get('/inventory/expiring', { params: { days } })

// Usage
export const logUsage = (data) => api.post('/usage', data)
export const getUsageHistory = (itemId) => api.get(`/usage/${itemId}`)

// Analytics
export const getDashboard = () => api.get('/analytics/dashboard')
export const getWasteData = (days = 30) => api.get('/analytics/waste', { params: { days } })
export const getReorderSuggestions = () => api.get('/analytics/reorder')
export const getSustainability = () => api.get('/analytics/sustainability')

// AI
export const parseText = (text) => api.post('/ai/parse', { text })
export const classifyImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/ai/classify-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })
}
export const getRecipes = (items) => api.post('/ai/recipes', { items }, { timeout: 30000 })

// Categories
export const getCategories = () => api.get('/categories')

// Seed
export const seedDatabase = () => api.post('/seed')

export default api
