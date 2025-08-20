// src/pages/Dashboard.jsx - Enhanced with delete functionality
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  Calculator, 
  Plus, 
  BarChart3, 
  Star, 
  Edit, 
  Trash2, 
  Copy,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  X
} from 'lucide-react'
import { calculationsAPI, dashboardAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Fetch dashboard data using correct React Query v5 syntax
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.getDashboardData(),
    select: (response) => response.data
  })

  // Fetch recent calculations using correct React Query v5 syntax
  const { 
    data: calculations, 
    isLoading: calculationsLoading, 
    error: calculationsError 
  } = useQuery({
    queryKey: ['calculations', { limit: 5 }],
    queryFn: () => calculationsAPI.getAll({ limit: 5, ordering: '-created_at' }),
    select: (response) => response.data.results || response.data
  })

  // Delete calculation mutation
  const deleteCalculationMutation = useMutation({
    mutationFn: (id) => calculationsAPI.delete(id),
    onSuccess: (_, deletedId) => {
      toast.success('Calculation deleted successfully')
      // Invalidate and refetch both queries
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteConfirmId(null)
    },
    onError: (error) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete calculation')
      setDeleteConfirmId(null)
    }
  })

  // Duplicate calculation mutation
  const duplicateCalculationMutation = useMutation({
    mutationFn: (id) => calculationsAPI.duplicate(id),
    onSuccess: (response) => {
      toast.success('Calculation duplicated successfully')
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Duplicate error:', error)
      toast.error('Failed to duplicate calculation')
    }
  })

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: (id) => calculationsAPI.toggleFavorite(id),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Favorite status updated')
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Toggle favorite error:', error)
      toast.error('Failed to update favorite status')
    }
  })

  const handleDelete = (id) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteCalculationMutation.mutate(deleteConfirmId)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  const handleDuplicate = (id) => {
    duplicateCalculationMutation.mutate(id)
  }

  const handleToggleFavorite = (id) => {
    toggleFavoriteMutation.mutate(id)
  }

  if (dashboardLoading || calculationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  if (dashboardError || calculationsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this calculation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="btn-secondary"
                disabled={deleteCalculationMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-danger flex items-center"
                disabled={deleteCalculationMutation.isPending}
              >
                {deleteCalculationMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || 'Veteran'}!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Here's an overview of your cost calculations and Maine move planning.
            </p>
          </div>
          <Link
            to="/calculator"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calculator className="h-8 w-8 text-maine-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Calculations</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.total_calculations || calculations?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Savings</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboardData?.average_savings || '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.favorite_calculations || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData?.calculations_this_month || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Calculations */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Calculations</h2>
            <Link
              to="/calculator"
              className="text-maine-600 hover:text-maine-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>

        {calculations && calculations.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {calculations.map((calculation) => (
              <div key={calculation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        {calculation.calculation_name}
                      </h3>
                      {calculation.is_favorite && (
                        <Star className="ml-2 h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>
                        {calculation.origin_state?.state_name || 'Unknown'} → Maine
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Created {new Date(calculation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {calculation.total_monthly_savings !== null && (
                      <div className="text-right">
                        <div className="flex items-center">
                          {calculation.total_monthly_savings >= 0 ? (
                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`font-medium ${
                            calculation.total_monthly_savings >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            ${Math.abs(calculation.total_monthly_savings).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {calculation.total_monthly_savings >= 0 ? 'savings' : 'increase'} monthly
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      {/* Favorite Toggle */}
                      <button
                        onClick={() => handleToggleFavorite(calculation.id)}
                        className={`p-2 rounded-full hover:bg-gray-100 ${
                          calculation.is_favorite ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                        title={calculation.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                        disabled={toggleFavoriteMutation.isPending}
                      >
                        <Star className={`h-4 w-4 ${calculation.is_favorite ? 'fill-current' : ''}`} />
                      </button>

                      {/* Edit */}
                      <Link
                        to={`/calculator/${calculation.id}`}
                        className="p-2 rounded-full text-gray-400 hover:text-maine-600 hover:bg-gray-100"
                        title="Edit calculation"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {/* Duplicate */}
                      <button
                        onClick={() => handleDuplicate(calculation.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100"
                        title="Duplicate calculation"
                        disabled={duplicateCalculationMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(calculation.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-gray-100"
                        title="Delete calculation"
                        disabled={deleteCalculationMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No calculations yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first cost comparison.
            </p>
            <div className="mt-6">
              <Link
                to="/calculator"
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Calculation
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/calculator"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center">
            <Calculator className="h-8 w-8 text-maine-600 group-hover:text-maine-700" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">New Calculation</h3>
              <p className="text-sm text-gray-500">Compare costs between states</p>
            </div>
          </div>
        </Link>

        <Link
          to="/about"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 group-hover:text-blue-700" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Learn More</h3>
              <p className="text-sm text-gray-500">About Maine benefits for veterans</p>
            </div>
          </div>
        </Link>

        <Link
          to="/contact"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500 group-hover:text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Get Help</h3>
              <p className="text-sm text-gray-500">Contact our support team</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard