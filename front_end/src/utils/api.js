// src/utils/api.js
import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if it exists
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        toast.error('Your session has expired. Please log in again.')
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.')
    } else if (error.response?.status === 404) {
      toast.error('The requested resource was not found.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.')
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/api/calculations/auth/login/', credentials),
  register: (userData) => api.post('/api/calculations/auth/register/', userData),
  logout: () => api.post('/api/calculations/auth/logout/'),
  getProfile: () => api.get('/api/calculations/auth/profile/'),
  updateProfile: (data) => api.patch('/api/calculations/auth/profile/', data),
}

export const statesAPI = {
  getAll: (params = {}) => api.get('/api/states/', { params }),
  getById: (id) => api.get(`/api/states/${id}/`),
  getMaine: () => api.get('/api/states/maine/'),
  compareStates: (params) => api.get('/api/calculations/compare-states/', { params }),
  getVeteranBenefits: (params = {}) => api.get('/api/states/veteran-benefits/', { params }),
}

export const calculationsAPI = {
  getAll: (params = {}) => api.get('/api/calculations/', { params }),
  getById: (id) => api.get(`/api/calculations/${id}/`),
  create: (data) => api.post('/api/calculations/', data),
  update: (id, data) => api.patch(`/api/calculations/${id}/`, data),
  delete: (id) => api.delete(`/api/calculations/${id}/`),
  duplicate: (id) => api.post(`/api/calculations/${id}/duplicate/`),
  toggleFavorite: (id) => api.post(`/api/calculations/${id}/toggle-favorite/`),
  
  // Notes
  getNotes: (calculationId) => api.get(`/api/calculations/${calculationId}/notes/`),
  createNote: (calculationId, data) => api.post(`/api/calculations/${calculationId}/notes/`, data),
  updateNote: (calculationId, noteId, data) => api.patch(`/api/calculations/${calculationId}/notes/${noteId}/`, data),
  deleteNote: (calculationId, noteId) => api.delete(`/api/calculations/${calculationId}/notes/${noteId}/`),
}

export const dashboardAPI = {
  getDashboardData: () => api.get('/api/calculations/dashboard/'),
}

// Utility functions for handling API responses
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (error.response?.data) {
    const errorData = error.response.data
    if (typeof errorData === 'string') {
      return errorData
    }
    if (errorData.detail) {
      return errorData.detail
    }
    if (errorData.message) {
      return errorData.message
    }
    // Handle field validation errors
    if (typeof errorData === 'object') {
      const firstFieldError = Object.values(errorData)[0]
      return Array.isArray(firstFieldError) ? firstFieldError[0] : firstFieldError
    }
  }
  return error.message || defaultMessage
}

export const formatApiError = (error) => {
  if (error.response?.data) {
    const errorData = error.response.data
    const errors = {}
    
    if (typeof errorData === 'object' && !Array.isArray(errorData)) {
      Object.keys(errorData).forEach(field => {
        const fieldError = errorData[field]
        errors[field] = Array.isArray(fieldError) ? fieldError[0] : fieldError
      })
    }
    
    return errors
  }
  
  return { general: error.message || 'An error occurred' }
}

export default api