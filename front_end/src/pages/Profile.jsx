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
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    military_branch: '',
    service_years: '',
    veteran_status: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [errors, setErrors] = useState({})

  // Populate form data when profile loads
  useEffect(() => {
    if (user && profile) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
        military_branch: profile.military_branch || '',
        service_years: profile.service_years || '',
        veteran_status: profile.veteran_status || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
    }
  }, [user, profile])

  const militaryBranches = [
    'Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'
  ]

  const veteranStatuses = [
    'Active Duty', 'Veteran', 'Retired', 'Reserve', 'National Guard'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
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

    if (formData.phone && !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.phone) && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
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
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const updateData = {
        user: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email
        },
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        military_branch: formData.military_branch,
        service_years: formData.service_years,
        veteran_status: formData.veteran_status
      }

      // Add password change if provided
      if (formData.new_password) {
        updateData.current_password = formData.current_password
        updateData.new_password = formData.new_password
      }

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
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      city: profile?.city || '',
      state: profile?.state || '',
      zip_code: profile?.zip_code || '',
      military_branch: profile?.military_branch || '',
      service_years: profile?.service_years || '',
      veteran_status: profile?.veteran_status || '',
      current_password: '',
      new_password: '',
      confirm_password: ''
    })
    setErrors({})
    setIsEditing(false)
    setShowPasswordSection(false)
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
              Manage your account information and preferences
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
                    errors.first_name ? 'border-red-300' : ''
                  }`}
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
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
                    errors.last_name ? 'border-red-300' : ''
                  }`}
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''} ${
                    errors.phone ? 'border-red-300' : ''
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-maine-600" />
              Address Information
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                <div>
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Military Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Shield className="mr-2 h-5 w-5 text-maine-600" />
              Military Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">Military Branch</label>
                <select
                  name="military_branch"
                  value={formData.military_branch}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select branch</option>
                  {militaryBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Years of Service</label>
                <input
                  type="number"
                  name="service_years"
                  value={formData.service_years}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="0"
                  max="50"
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                />
              </div>

              <div>
                <label className="form-label">Current Status</label>
                <select
                  name="veteran_status"
                  value={formData.veteran_status}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`form-input ${!isEditing ? 'bg-gray-50' : ''}`}
                >
                  <option value="">Select status</option>
                  {veteranStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Password Section */}
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
                      className={`form-input ${errors.current_password ? 'border-red-300' : ''}`}
                    />
                    {errors.current_password && (
                      <p className="mt-1 text-sm text-red-600">{errors.current_password}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">New Password *</label>
                    <input
                      type="password"
                      name="new_password"
                      value={formData.new_password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.new_password ? 'border-red-300' : ''}`}
                    />
                    {errors.new_password && (
                      <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleInputChange}
                      className={`form-input ${errors.confirm_password ? 'border-red-300' : ''}`}
                    />
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
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
                <label className="form-label">Last Updated</label>
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