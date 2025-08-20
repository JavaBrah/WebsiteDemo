// src/utils/api.js - Updated with delete and duplicate functionality
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// States API functions
export const statesAPI = {
  // Get all states
  getAll: () => api.get('/api/states/'),
  
  // Get specific state
  getById: (id) => api.get(`/api/states/${id}/`),
  
  // Compare states
  compareStates: (params) => api.get('/api/states/compare/', { params }),
}

// Dashboard API functions  
export const dashboardAPI = {
  getDashboardData: () => api.get('/api/calculations/dashboard/'),
}

// Calculations API functions
export const calculationsAPI = {
  getAll: (params = {}) => api.get('/api/calculations/', { params }),
  getById: (id) => api.get(`/api/calculations/${id}/`),
  create: (data) => api.post('/api/calculations/', data),
  update: (id, data) => api.patch(`/api/calculations/${id}/`, data),
  delete: (id) => api.delete(`/api/calculations/${id}/`),
  duplicate: (id) => api.post(`/api/calculations/${id}/duplicate/`),
  toggleFavorite: (id) => api.post(`/api/calculations/${id}/toggle-favorite/`),
}

// Authentication API functions
export const authAPI = {
  login: (credentials) => api.post('/api/calculations/auth/login/', credentials),
  register: (userData) => api.post('/api/calculations/auth/register/', userData),
  logout: () => api.post('/api/calculations/auth/logout/'),
  getProfile: () => api.get('/api/calculations/auth/profile/'),
  updateProfile: (data) => api.patch('/api/calculations/auth/profile/', data),
}

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api