// src/pages/Dashboard.jsx - Enhanced with delete functionality and detailed comments
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
  // ===== HOOKS AND STATE MANAGEMENT =====
  const { user } = useAuth() // Get current user from global authentication context
  const queryClient = useQueryClient() // For invalidating queries after mutations
  const [deleteConfirmId, setDeleteConfirmId] = useState(null) // Track which calculation to delete

  // ===== DATA FETCHING =====
  // Fetch dashboard summary statistics (total calculations, averages, etc.)
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError 
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardAPI.getDashboardData(),
    select: (response) => response.data // Extract data from axios response
  })

  // Fetch recent calculations for display (limit to 5 most recent)
  const { 
    data: calculations, 
    isLoading: calculationsLoading, 
    error: calculationsError 
  } = useQuery({
    queryKey: ['calculations', { limit: 5 }],
    queryFn: () => calculationsAPI.getAll({ limit: 5, ordering: '-created_at' }),
    select: (response) => response.data.results || response.data // Handle paginated vs direct array response
  })

  // ===== MUTATION FUNCTIONS (Actions that modify data) =====
  
  // Delete calculation mutation - removes a calculation from the database
  const deleteCalculationMutation = useMutation({
    mutationFn: (id) => calculationsAPI.delete(id), // API call to delete
    onSuccess: (_, deletedId) => {
      toast.success('Calculation deleted successfully')
      // Invalidate queries to trigger refetch of updated data
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteConfirmId(null) // Close confirmation modal
    },
    onError: (error) => {
      console.error('Delete error:', error)
      toast.error('Failed to delete calculation')
      setDeleteConfirmId(null)
    }
  })

  // Duplicate calculation mutation - creates a copy of an existing calculation
  const duplicateCalculationMutation = useMutation({
    mutationFn: (id) => calculationsAPI.duplicate(id),
    onSuccess: (response) => {
      toast.success('Calculation duplicated successfully')
      // Refresh data to show the new duplicate
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Duplicate error:', error)
      toast.error('Failed to duplicate calculation')
    }
  })

  // Toggle favorite status mutation - marks/unmarks calculations as favorites
  const toggleFavoriteMutation = useMutation({
    mutationFn: (id) => calculationsAPI.toggleFavorite(id),
    onSuccess: (response) => {
      toast.success(response.data.message || 'Favorite status updated')
      // Refresh data to show updated favorite status
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Toggle favorite error:', error)
      toast.error('Failed to update favorite status')
    }
  })

  // ===== EVENT HANDLERS =====
  
  // Show delete confirmation modal
  const handleDelete = (id) => {
    setDeleteConfirmId(id)
  }

  // Confirm deletion and execute
  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteCalculationMutation.mutate(deleteConfirmId)
    }
  }

  // Cancel deletion and close modal
  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  // Trigger duplication
  const handleDuplicate = (id) => {
    duplicateCalculationMutation.mutate(id)
  }

  // Toggle favorite status
  const handleToggleFavorite = (id) => {
    toggleFavoriteMutation.mutate(id)
  }

  // ===== LOADING STATE =====
  // Show loading spinner while data is being fetched
  if (dashboardLoading || calculationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  // ===== ERROR STATE =====
  // Show error message if data fetching fails
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

  // ===== MAIN DASHBOARD RENDER =====
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {/* Only shows when deleteConfirmId is set (user clicked delete button) */}
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
              {/* Cancel button */}
              <button
                onClick={cancelDelete}
                className="btn-secondary"
                disabled={deleteCalculationMutation.isPending}
              >
                Cancel
              </button>
              {/* Confirm delete button */}
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

      {/* ===== HEADER SECTION ===== */}
      {/* Welcome message and main action button */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            {/* Personalized greeting using user's first name or fallback */}
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name || 'Veteran'}!
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Here's an overview of your cost calculations and Maine move planning.
            </p>
          </div>
          {/* Primary call-to-action button */}
          <Link
            to="/calculator"
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Link>
        </div>
      </div>

      {/* ===== STATISTICS GRID ===== */}
      {/* 4-column grid showing key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Total Calculations Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calculator className="h-8 w-8 text-maine-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Calculations</p>
              <p className="text-2xl font-bold text-gray-900">
                {/* Use dashboard data if available, fallback to calculations array length */}
                {dashboardData?.total_calculations || calculations?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Average Savings Card */}
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

        {/* Favorites Count Card */}
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

        {/* This Month's Activity Card */}
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

      {/* ===== RECENT CALCULATIONS SECTION ===== */}
      <div className="bg-white rounded-lg shadow-md">
        
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Calculations</h2>
            {/* Link to view all calculations (goes to calculator page) */}
            <Link
              to="/calculator"
              className="text-maine-600 hover:text-maine-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Calculations List or Empty State */}
        {calculations && calculations.length > 0 ? (
          /* ===== CALCULATIONS LIST ===== */
          <div className="divide-y divide-gray-200">
            {calculations.map((calculation) => (
              <div key={calculation.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  
                  {/* ===== LEFT SIDE: Calculation Info ===== */}
                  <div className="flex-1">
                    <div className="flex items-center">
                      {/* Calculation name */}
                      <h3 className="text-lg font-medium text-gray-900">
                        {calculation.calculation_name}
                      </h3>
                      {/* Favorite star indicator */}
                      {calculation.is_favorite && (
                        <Star className="ml-2 h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {/* Calculation metadata */}
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span>
                        {/* Show origin state -> Maine */}
                        {calculation.origin_state?.state_name || 'Unknown'} → Maine
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {/* Creation date */}
                        Created {new Date(calculation.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* ===== RIGHT SIDE: Savings Info and Action Buttons ===== */}
                  <div className="flex items-center space-x-4">
                    
                    {/* Savings/Cost Display */}
                    {calculation.total_monthly_savings !== null && (
                      <div className="text-right">
                        <div className="flex items-center">
                          {/* Show green down arrow for savings, red up arrow for increased costs */}
                          {calculation.total_monthly_savings >= 0 ? (
                            <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          {/* Amount (always show as positive number) */}
                          <span className={`font-medium ${
                            calculation.total_monthly_savings >= 0 
                              ? 'text-green-600'  // Green for savings
                              : 'text-red-600'    // Red for increased costs
                          }`}>
                            ${Math.abs(calculation.total_monthly_savings).toLocaleString()}
                          </span>
                        </div>
                        {/* Label indicating whether it's savings or increase */}
                        <p className="text-xs text-gray-500">
                          {calculation.total_monthly_savings >= 0 ? 'savings' : 'increase'} monthly
                        </p>
                      </div>
                    )}

                    {/* ===== ACTION BUTTONS ===== */}
                    <div className="flex items-center space-x-2">
                      
                      {/* Favorite Toggle Button */}
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

                      {/* Edit Button (Link to calculator with calculation ID) */}
                      <Link
                        to={`/calculator/${calculation.id}`}
                        className="p-2 rounded-full text-gray-400 hover:text-maine-600 hover:bg-gray-100"
                        title="Edit calculation"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      {/* Duplicate Button */}
                      <button
                        onClick={() => handleDuplicate(calculation.id)}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100"
                        title="Duplicate calculation"
                        disabled={duplicateCalculationMutation.isPending}
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {/* Delete Button */}
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
          /* ===== EMPTY STATE ===== */
          /* Shows when user has no calculations yet */
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

      {/* ===== QUICK ACTIONS SECTION ===== */}
      {/* 3-column grid of action cards at bottom */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* New Calculation Card */}
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

        {/* Learn More Card */}
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

        {/* Get Help Card */}
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