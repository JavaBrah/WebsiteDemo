// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, profile, updateProfile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  
  // IMPORTANT: Form data structure matches Django UserProfile model fields exactly
  const [formData, setFormData] = useState({
    // User model fields
    first_name: '',
    last_name: '',
    email: '',
    // UserProfile model fields (matching backend exactly)
    service_branch: '',           // Changed from military_branch to match backend
    is_veteran: true,             // Backend field
    receives_disability_compensation: false,  // Backend field
    disability_rating: '',        // Backend field (integer)
    receives_military_retirement: false,      // Backend field
    current_state_id: '',         // Backend expects ID, not object
    // Additional fields not in backend model (for display/future use)
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    // Password change fields
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [errors, setErrors] = useState({})
  const [serverErrors, setServerErrors] = useState({})

  // Populate form data when profile loads
  useEffect(() => {
    if (user && profile) {
      setFormData({
        // User fields
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        // UserProfile fields (exact backend field names)
        service_branch: profile.service_branch || '',
        is_veteran: profile.is_veteran !== undefined ? profile.is_veteran : true,
        receives_disability_compensation: profile.receives_disability_compensation || false,
        disability_rating: profile.disability_rating || '',
        receives_military_retirement: profile.receives_military_retirement || false,
        current_state_id: profile.current_state?.id || '',
        // Additional fields (may not exist in backend yet)
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
        // Password fields
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    }
  }, [user, profile])

  // Military branches matching Django model choices exactly
  const militaryBranches = [
    { value: '', label: 'Select branch (optional)' },
    { value: 'army', label: 'Army' },
    { value: 'navy', label: 'Navy' },
    { value: 'air_force', label: 'Air Force' },
    { value: 'marines', label: 'Marines' },
    { value: 'coast_guard', label: 'Coast Guard' },
    { value: 'space_force', label: 'Space Force' }
  ]

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
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

    // Disability rating validation
    if (formData.receives_disability_compensation && formData.disability_rating) {
      const rating = parseInt(formData.disability_rating)
      if (isNaN(rating) || rating < 0 || rating > 100) {
        newErrors.disability_rating = 'Disability rating must be between 0 and 100'
      }
    }

    // Password validation (only if user is trying to change password)
    if (formData.new_password || formData.current_password || formData.confirm_password) {
      if (!formData.current_password) {
        newErrors.current_password = 'Current password is required'
      }
      if (!formData.new_password) {
        newErrors.new_password = 'New password is required'
      } else if (formData.new_password.length < 8) {
        newErrors.new_password = 'Password must be at least 8 characters'
      }
      if (formData.new_password !== formData.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match'
      }
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
      // IMPORTANT: Structure data exactly as Django backend expects
      const updateData = {
        // User model fields (nested under 'user' key)
        user: {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim()
        },
        // UserProfile model fields (direct properties)
        service_branch: formData.service_branch,
        is_veteran: formData.is_veteran,
        receives_disability_compensation: formData.receives_disability_compensation,
        disability_rating: formData.disability_rating ? parseInt(formData.disability_rating) : null,
        receives_military_retirement: formData.receives_military_retirement,
        current_state_id: formData.current_state_id || null
        // Note: Additional fields like phone, address etc. would need to be added to Django model first
      }

      // Add password change if provided
      if (formData.new_password) {
        updateData.current_password = formData.current_password
        updateData.new_password = formData.new_password
      }

      console.log('Updating profile with data:', {
        ...updateData,
        current_password: updateData.current_password ? '[REDACTED]' : undefined,
        new_password: updateData.new_password ? '[REDACTED]' : undefined
      })

      const result = await updateProfile(updateData)
      
      if (result.success) {
        setIsEditing(false)
        setShowPasswordSection(false)
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }))
      } else {
        // Handle field-specific errors from server
        if (result.fieldErrors) {
          setServerErrors(result.fieldErrors)
        }
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    if (user && profile) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        service_branch: profile.service_branch || '',
        is_veteran: profile.is_veteran !== undefined ? profile.is_veteran : true,
        receives_disability_compensation: profile.receives_disability_compensation || false,
        disability_rating: profile.disability_rating || '',
        receives_military_retirement: profile.receives_military_retirement || false,
        current_state_id: profile.current_state?.id || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    }
    setErrors({})
    setServerErrors({})
    setIsEditing(false)
    setShowPasswordSection(false)
  }

  // Helper function to get error message for a field
  const getFieldError = (fieldName) => {
    return errors[fieldName] || serverErrors[fieldName] || ''
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <User className="mr-3 h-8 w-8 text-maine-600" />
              Profile Settings
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your account information and veteran status
            </p>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary flex items-center"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Display general server errors */}
          {serverErrors.non_field_errors && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{serverErrors.non_field_errors}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="mr-2 h-5 w-5 text-maine-600" />
              Personal Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${
                    getFieldError('first_name') ? 'border-red-300' : ''
                  }`}
                />
                {getFieldError('first_name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('first_name')}</p>
                )}
              </div>

              <div>
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${
                    getFieldError('last_name') ? 'border-red-300' : ''
                  }`}
                />
                {getFieldError('last_name') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('last_name')}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${
                    getFieldError('email') ? 'border-red-300' : ''
                  }`}
                />
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Veteran Information - Matches Django UserProfile model exactly */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-maine-600" />
              Veteran Information
            </h2>
            
            <div className="space-y-6">
              {/* Veteran Status Checkbox */}
              <div className="flex items-center">
                <input
                  id="is_veteran"
                  name="is_veteran"
                  type="checkbox"
                  checked={formData.is_veteran}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-maine-600 focus:ring-maine-500 border-gray-300 rounded"
                />
                <label htmlFor="is_veteran" className="ml-2 text-sm font-medium text-gray-700">
                  I am a veteran
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Branch - Matches Django choices exactly */}
                <div>
                  <label className="form-label">Military Branch</label>
                  <select
                    name="service_branch"
                    value={formData.service_branch}
                    onChange={handleInputChange}
                    disabled={!isEditing || !formData.is_veteran}
                    className={`form-input ${!isEditing || !formData.is_veteran ? 'bg-gray-50' : ''} ${
                      getFieldError('service_branch') ? 'border-red-300' : ''
                    }`}
                  >
                    {militaryBranches.map(branch => (
                      <option key={branch.value} value={branch.value}>
                        {branch.label}
                      </option>
                    ))}
                  </select>
                  {getFieldError('service_branch') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('service_branch')}</p>
                  )}
                </div>

                {/* Placeholder for future current_state field */}
                <div>
                  <label className="form-label">Current State</label>
                  <input
                    type="text"
                    value="To be implemented with state selector"
                    disabled
                    className="form-input bg-gray-50 text-gray-400"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    State selector will be implemented when states data is available
                  </p>
                </div>
              </div>

              {/* Military Retirement Benefits */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Military Benefits</h3>
                
                <div className="flex items-center">
                  <input
                    id="receives_military_retirement"
                    name="receives_military_retirement"
                    type="checkbox"
                    checked={formData.receives_military_retirement}
                    onChange={handleInputChange}
                    disabled={!isEditing || !formData.is_veteran}
                    className="h-4 w-4 text-maine-600 focus:ring-maine-500 border-gray-300 rounded"
                  />
                  <label htmlFor="receives_military_retirement" className="ml-2 text-sm text-gray-700">
                    I receive military retirement income
                  </label>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center">
                    <input
                      id="receives_disability_compensation"
                      name="receives_disability_compensation"
                      type="checkbox"
                      checked={formData.receives_disability_compensation}
                      onChange={handleInputChange}
                      disabled={!isEditing || !formData.is_veteran}
                      className="h-4 w-4 text-maine-600 focus:ring-maine-500 border-gray-300 rounded"
                    />
                    <label htmlFor="receives_disability_compensation" className="ml-2 text-sm text-gray-700">
                      I receive VA disability compensation
                    </label>
                  </div>

                  {formData.receives_disability_compensation && (
                    <div className="flex-1 max-w-xs">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disability Rating (%)
                      </label>
                      <input
                        type="number"
                        name="disability_rating"
                        value={formData.disability_rating}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        min="0"
                        max="100"
                        className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${
                          getFieldError('disability_rating') ? 'border-red-300' : ''
                        }`}
                        placeholder="0-100"
                      />
                      {getFieldError('disability_rating') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('disability_rating')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information - Future Implementation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-maine-600" />
              Contact Information
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> Contact information fields (phone, address, etc.) 
                    will be available once the backend UserProfile model is extended to include these fields.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          {isEditing && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-maine-600" />
                  Change Password
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-maine-600 hover:text-maine-700 text-sm font-medium"
                >
                  {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
                </button>
              </div>

              {showPasswordSection && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="form-label">Current Password *</label>
                    <input
                      type="password"
                      name="current_password"
                      value={formData.current_password}
                      onChange={handleInputChange}
                      className={`form-input ${getFieldError('current_password') ? 'border-red-300' : ''}`}
                    />
                    {getFieldError('current_password') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('current_password')}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">New Password *</label>
                    <input
                      type="password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className={`form-input ${getFieldError('new_password') ? 'border-red-300' : ''}`}
                    />
                    {getFieldError('new_password') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('new_password')}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className={`form-input ${getFieldError('confirm_password') ? 'border-red-300' : ''}`}
                    />
                    {getFieldError('confirm_password') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('confirm_password')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Account Information (Read-only) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-maine-600" />
              Account Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Member Since</label>
                <input
                  type="text"
                  value={new Date(user.date_joined).toLocaleDateString()}
                  disabled
                  className="form-input bg-gray-50"
                />
              </div>

              <div>
                <label className="form-label">Profile Last Updated</label>
                <input
                  type="text"
                  value={profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}
                  disabled
                  className="form-input bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default Profile