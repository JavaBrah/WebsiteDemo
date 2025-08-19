// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Set up API interceptor for token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Token ${token}`
      // Load user profile if we have a token
      loadUserProfile()
    } else {
      delete api.defaults.headers.common['Authorization']
      setLoading(false)
    }
  }, [token])

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/api/calculations/auth/profile/')
      setProfile(response.data)
      setUser(response.data.user)
    } catch (error) {
      console.error('Error loading profile:', error)
      // If profile loading fails, token might be invalid
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await api.post('/api/calculations/auth/login/', credentials)
      const { token: newToken, user: userData, profile: profileData } = response.data

      // Store token and user data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      setProfile(profileData)

      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post('/api/calculations/auth/register/', userData)
      const { token: newToken, user: newUser, profile: newProfile } = response.data

      // Store token and user data
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(newUser)
      setProfile(newProfile)

      toast.success('Account created successfully!')
      return { success: true }
    } catch (error) {
      let message = 'Registration failed'
      if (error.response?.data) {
        const errors = error.response.data
        if (typeof errors === 'object') {
          // Handle field-specific errors
          const firstError = Object.values(errors)[0]
          message = Array.isArray(firstError) ? firstError[0] : firstError
        } else {
          message = errors
        }
      }
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/api/calculations/auth/logout/')
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Logout API error:', error)
    }

    // Clear local storage and state
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setProfile(null)
    delete api.defaults.headers.common['Authorization']
    
    toast.success('Logged out successfully')
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/api/calculations/auth/profile/', profileData)
      setProfile(response.data)
      toast.success('Profile updated successfully!')
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.detail || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const isAuthenticated = Boolean(token && user)

  const value = {
    user,
    profile,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    loadUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}