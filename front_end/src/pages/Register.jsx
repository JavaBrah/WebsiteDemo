// src/pages/Register.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  CheckCircle
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    // NOTE: Military branch and veteran status removed from registration
    // These will be handled in profile update after successful registration
    terms_accepted: false
  })
  const [errors, setErrors] = useState({})
  const [serverErrors, setServerErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    if (serverErrors[name]) {
      setServerErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password'
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }

    if (!formData.terms_accepted) {
      newErrors.terms_accepted = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous server errors
    setServerErrors({})
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // IMPORTANT: Prepare data with exact field names expected by Django backend
      const submitData = {
        // Backend expects 'username' field (using email as username)
        username: formData.email.trim().toLowerCase(),
        // Standard user fields
        email: formData.email.trim().toLowerCase(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        // Password fields (backend expects 'password_confirm' not 'confirm_password')
        password: formData.password,
        password_confirm: formData.confirm_password
      }

      console.log('Submitting registration data:', {
        ...submitData,
        password: '[REDACTED]',
        password_confirm: '[REDACTED]'
      })

      const result = await register(submitData)

      if (result.success) {
        // Registration successful - redirect to dashboard
        navigate('/dashboard', { replace: true })
      } else {
        // Handle field-specific errors from server
        if (result.fieldErrors) {
          setServerErrors(result.fieldErrors)
        }
      }
    } catch (error) {
      console.error('Registration submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to get error message for a field (handle server field mapping)
  const getFieldError = (fieldName) => {
    // Check both client field name and server field name
    const clientError = errors[fieldName] || serverErrors[fieldName]
    
    // Handle server field name mapping
    if (fieldName === 'email' && serverErrors.username) {
      return serverErrors.username
    }
    if (fieldName === 'confirm_password' && serverErrors.password_confirm) {
      return serverErrors.password_confirm
    }
    
    return clientError || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Shield className="h-12 w-12 text-maine-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join the Community
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your Maine Veterans account and start exploring your options
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Display general server errors */}
            {serverErrors.non_field_errors && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{serverErrors.non_field_errors}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="form-label">
                  First Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className={`form-input pl-10 ${
                      getFieldError('first_name') ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                    placeholder="John"
                  />
                </div>
                {getFieldError('first_name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('first_name')}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="form-label">
                  Last Name *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className={`form-input pl-10 ${
                      getFieldError('last_name') ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {getFieldError('last_name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('last_name')}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`form-input pl-10 ${
                    getFieldError('email') ? 'border-red-300 focus:ring-red-500' : ''
                  }`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {getFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`form-input pl-10 pr-10 ${
                      getFieldError('password') ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {getFieldError('password') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
                )}
                <div className="mt-1 text-xs text-gray-500">
                  Must contain uppercase, lowercase, and number
                </div>
              </div>

              <div>
                <label htmlFor="confirm_password" className="form-label">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className={`form-input pl-10 pr-10 ${
                      getFieldError('confirm_password') ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {getFieldError('confirm_password') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('confirm_password')}</p>
                )}
              </div>
            </div>

            {/* NOTE: Military information section removed from registration */}
            {/* Users can update their military service details in their profile after registration */}
            
            {/* Information note about profile setup */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Veteran Information:</strong> After creating your account, 
                    you can add your military service details and veteran status in your profile 
                    to get personalized calculations and benefits information.
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms_accepted"
                    name="terms_accepted"
                    type="checkbox"
                    checked={formData.terms_accepted}
                    onChange={handleInputChange}
                    className={`h-4 w-4 text-maine-600 focus:ring-maine-500 border-gray-300 rounded ${
                      getFieldError('terms_accepted') ? 'border-red-300' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms_accepted" className="text-gray-700">
                    I agree to the{' '}
                    <Link to="/terms" className="text-maine-600 hover:text-maine-500 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-maine-600 hover:text-maine-500 font-medium">
                      Privacy Policy
                    </Link>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
              </div>
              {getFieldError('terms_accepted') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('terms_accepted')}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full flex items-center justify-center text-lg py-3"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Benefits Preview */}
          <div className="mt-8 p-4 bg-maine-50 rounded-lg border border-maine-200">
            <h3 className="text-sm font-semibold text-maine-800 mb-2">
              What you'll get with your free account:
            </h3>
            <ul className="text-xs text-maine-700 space-y-1">
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-maine-600 mr-2 flex-shrink-0" />
                Unlimited cost calculations and comparisons
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-maine-600 mr-2 flex-shrink-0" />
                Save and track multiple scenarios
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-maine-600 mr-2 flex-shrink-0" />
                Access to veteran-specific tax benefits
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 text-maine-600 mr-2 flex-shrink-0" />
                Personalized dashboard and insights
              </li>
            </ul>
          </div>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="btn-secondary w-full text-center inline-block"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          By creating an account, you're joining a community of veterans exploring 
          opportunities in the great state of Maine.
        </p>
      </div>
    </div>
  )
}

export default Register