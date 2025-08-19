// src/pages/Dashboard.jsx
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Calculator, 
  Plus, 
  Edit3, 
  Trash2, 
  BarChart3,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar
} from 'lucide-react'
import { calculationsAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()

  // Fetch user's calculations
  const { data: calculations, isLoading, error } = useQuery(
    'calculations',
    () => calculationsAPI.getAll(),
    {
      select: (response) => response.data,
      onError: (error) => {
        console.error('Failed to fetch calculations:', error)
      }
    }
  )

  const handleDeleteCalculation = async (id) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      try {
        await calculationsAPI.delete(id)
        // React Query will automatically refetch
      } catch (error) {
        console.error('Failed to delete calculation:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Failed to load dashboard data. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="mr-3 h-8 w-8 text-maine-600" />
          Welcome back, {user?.first_name || 'Veteran'}!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage your cost calculations and explore your Maine opportunities
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-maine-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Calculations</p>
              <p className="text-2xl font-bold text-gray-900">
                {calculations?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Monthly Savings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${calculations?.length > 0 
                  ? Math.round(calculations.reduce((sum, calc) => sum + (calc.total_monthly_savings || 0), 0) / calculations.length)
                  : 0
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-sm font-bold text-gray-900">
                {calculations?.length > 0 
                  ? new Date(Math.max(...calculations.map(c => new Date(c.updated_at)))).toLocaleDateString()
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calculations List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Calculations
            </h2>
            <Link
              to="/calculator"
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Calculation
            </Link>
          </div>
        </div>

        <div className="p-6">
          {calculations && calculations.length > 0 ? (
            <div className="space-y-4">
              {calculations.map((calculation) => (
                <div key={calculation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {calculation.calculation_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {calculation.origin_state?.state_name} → Maine
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          {calculation.total_monthly_savings >= 0 ? (
                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            calculation.total_monthly_savings >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {calculation.total_monthly_savings >= 0 ? 'Save' : 'Cost'} $
                            {Math.abs(calculation.total_monthly_savings || 0).toLocaleString()}/month
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          Updated {new Date(calculation.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/calculator/${calculation.id}`}
                        className="btn-secondary flex items-center"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCalculation(calculation.id)}
                        className="btn-danger flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calculator className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No calculations yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first cost comparison to see how much you could save in Maine.
              </p>
              <Link
                to="/calculator"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Calculation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard