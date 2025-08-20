// src/pages/Calculator.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { 
  Save, 
  Calculator as CalculatorIcon, 
  DollarSign, 
  Home, 
  Car, 
  ShoppingCart, 
  Zap,
  Heart,
  Coffee,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  AlertTriangle  // Changed from ExclamationTriangle
} from 'lucide-react'

import { calculationsAPI, statesAPI } from '../utils/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ComparisonChart from '../components/ComparisonChart'
import StateSelector from '../components/StateSelector'

const Calculator = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedOriginState, setSelectedOriginState] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [submitErrors, setSubmitErrors] = useState({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      calculation_name: '',
      origin_state_id: '',
      current_rent: '',
      current_utilities: '',
      current_groceries: '',
      current_transportation: '',
      current_healthcare: '',
      current_entertainment: '',
      gross_annual_income: '',
      military_retirement_income: '0',
      disability_compensation_income: '0'
    }
  })

  // Watch form values for real-time calculations
  const watchedValues = watch()

  // Fetch states data with error handling
  const { data: states, isLoading: statesLoading, error: statesError } = useQuery({
    queryKey: ['states'],
    queryFn: () => statesAPI.getAll(),
    select: (response) => response.data,
    retry: 1,
    retryDelay: 1000,
    onError: (error) => {
      console.error('States API error:', error)
      toast.error('Unable to load states data. Please refresh the page.')
    }
  })

  // Fetch existing calculation if editing
  const { data: calculation, isLoading: calculationLoading, error: calculationError } = useQuery({
    queryKey: ['calculation', id],
    queryFn: () => calculationsAPI.getById(id),
    enabled: !!id,
    select: (response) => response.data,
    retry: 1,
    onError: (error) => {
      console.error('Calculation fetch error:', error)
      toast.error('Unable to load calculation. Redirecting to new calculation.')
      setTimeout(() => navigate('/calculator'), 2000)
    }
  })

  // Effect to populate form when calculation data is loaded
  useEffect(() => {
    if (calculation) {
      console.log('Populating form with calculation data:', calculation)
      // Populate form with existing data
      Object.keys(calculation).forEach(key => {
        if (calculation[key] !== null && calculation[key] !== undefined) {
          setValue(key, String(calculation[key])) // Convert to string for form inputs
        }
      })
      setSelectedOriginState(calculation.origin_state)
    }
  }, [calculation, setValue])

  // Create/Update calculation mutation with enhanced error handling
  const saveCalculationMutation = useMutation({
    mutationFn: (data) => {
      console.log('Submitting calculation data:', data)
      if (id) {
        return calculationsAPI.update(id, data)
      } else {
        return calculationsAPI.create(data)
      }
    },
    onSuccess: (response) => {
      const savedCalculation = response.data
      toast.success(id ? 'Calculation updated!' : 'Calculation saved!')
      
      // Clear any previous errors
      setSubmitErrors({})
      
      // Invalidate and refetch calculations
      queryClient.invalidateQueries({ queryKey: ['calculations'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Navigate to the saved calculation if creating new
      if (!id) {
        navigate(`/calculator/${savedCalculation.id}`)
      }
    },
    onError: (error) => {
      console.error('Save error:', error)
      console.error('Save error response:', error.response?.data)
      
      let errorMessage = 'Failed to save calculation'
      
      if (error.response?.data) {
        const errorData = error.response.data
        
        // Handle field-specific errors
        if (typeof errorData === 'object' && !Array.isArray(errorData)) {
          setSubmitErrors(errorData)
          
          // Get first error for toast
          const firstError = Object.values(errorData)[0]
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
        } else if (typeof errorData === 'string') {
          errorMessage = errorData
        }
      }
      
      toast.error(errorMessage)
    }
  })

  // Get comparison data when origin state changes
  useEffect(() => {
    if (selectedOriginState && states) {
      const maineState = states.find(s => s.state_code === 'ME')
      if (maineState) {
        statesAPI.compareStates({ 
          origin: selectedOriginState.id, 
          destination: maineState.id 
        })
        .then(response => {
          setComparisonData(response.data)
        })
        .catch(error => {
          console.error('Comparison error:', error)
          // Don't show error toast for comparison failures
        })
      }
    }
  }, [selectedOriginState, states])

  const onSubmit = async (data) => {
    try {
      // Clear previous errors
      setSubmitErrors({})
      
      // Validate required fields
      if (!data.calculation_name?.trim()) {
        setSubmitErrors({ calculation_name: ['Calculation name is required'] })
        toast.error('Please fill in all required fields')
        return
      }
      
      if (!data.origin_state_id) {
        setSubmitErrors({ origin_state_id: ['Please select your current state'] })
        toast.error('Please select your current state')
        return
      }

      // Convert string values to numbers and prepare data
      const numericData = {
        calculation_name: data.calculation_name.trim(),
        origin_state_id: parseInt(data.origin_state_id),
        // Monthly expenses
        current_rent: parseFloat(data.current_rent) || 0,
        current_utilities: parseFloat(data.current_utilities) || 0,
        current_groceries: parseFloat(data.current_groceries) || 0,
        current_transportation: parseFloat(data.current_transportation) || 0,
        current_healthcare: parseFloat(data.current_healthcare) || 0,
        current_entertainment: parseFloat(data.current_entertainment) || 0,
        // Income
        gross_annual_income: parseFloat(data.gross_annual_income) || 0,
        military_retirement_income: parseFloat(data.military_retirement_income) || 0,
        disability_compensation_income: parseFloat(data.disability_compensation_income) || 0,
      }

      console.log('Processed data for submission:', numericData)
      await saveCalculationMutation.mutateAsync(numericData)
    } catch (error) {
      console.error('Submit error:', error)
      // Error handling is done in the mutation's onError
    }
  }

  const handleStateChange = (state) => {
    console.log('State selected:', state)
    setSelectedOriginState(state)
    setValue('origin_state_id', state.id)
    // Clear any previous state-related errors
    if (submitErrors.origin_state_id) {
      setSubmitErrors(prev => ({ ...prev, origin_state_id: undefined }))
    }
  }

  // Helper function to get error for a field
  const getFieldError = (fieldName) => {
    const formError = errors[fieldName]
    const submitError = submitErrors[fieldName]
    
    if (formError) return formError.message
    if (submitError) return Array.isArray(submitError) ? submitError[0] : submitError
    return null
  }

  // Calculate current totals for display
  const currentMonthlyTotal = Object.entries(watchedValues)
    .filter(([key]) => key.startsWith('current_') && !key.includes('annual'))
    .reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0)

  // Handle loading states
  if (statesLoading || (id && calculationLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    )
  }

  // Handle states error
  if (statesError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load States Data</h2>
          <p className="text-gray-600 mb-6">
            There's an issue with the backend states API. Please check that your Django server is running 
            and the states endpoint is properly configured.
          </p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Handle case where we have no states data
  if (!states || states.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No States Data Available</h2>
          <p className="text-gray-600 mb-6">
            The states database appears to be empty. Please ensure your Django backend 
            has been populated with state data.
          </p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CalculatorIcon className="mr-3 h-8 w-8 text-maine-600" />
              {id ? 'Edit' : 'New'} Cost Calculator
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Compare your current expenses with estimated costs in Maine
            </p>
          </div>
          
          {calculation && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium">
                {new Date(calculation.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {Object.keys(submitErrors).length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {Object.entries(submitErrors).map(([field, errors]) => (
                  <li key={field}>
                    <strong>{field.replace(/_/g, ' ')}:</strong> {Array.isArray(errors) ? errors[0] : errors}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calculation Name *
                  </label>
                  <input
                    type="text"
                    {...register('calculation_name', { 
                      required: 'Calculation name is required',
                      minLength: { value: 1, message: 'Calculation name cannot be empty' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 focus:border-transparent ${
                      getFieldError('calculation_name') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Texas to Maine Move"
                  />
                  {getFieldError('calculation_name') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('calculation_name')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current State *
                  </label>
                  <StateSelector
                    states={states}
                    selectedState={selectedOriginState}
                    onStateChange={handleStateChange}
                    excludeStates={['ME']}
                    placeholder="Select your current state"
                  />
                  {getFieldError('origin_state_id') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('origin_state_id')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                Current Monthly Expenses
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Home className="mr-1 h-4 w-4" />
                    Housing (Rent/Mortgage) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_rent', { 
                      required: 'Housing cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('current_rent') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="2000"
                  />
                  {getFieldError('current_rent') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('current_rent')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Zap className="mr-1 h-4 w-4" />
                    Utilities *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_utilities', { 
                      required: 'Utilities cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('current_utilities') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="150"
                  />
                  {getFieldError('current_utilities') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('current_utilities')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    Groceries *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_groceries', { 
                      required: 'Grocery cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('current_groceries') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="400"
                  />
                  {getFieldError('current_groceries') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('current_groceries')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Car className="mr-1 h-4 w-4" />
                    Transportation *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_transportation', { 
                      required: 'Transportation cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('current_transportation') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="300"
                  />
                  {getFieldError('current_transportation') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('current_transportation')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Heart className="mr-1 h-4 w-4" />
                    Healthcare *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_healthcare', { 
                      required: 'Healthcare cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('current_healthcare') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="200"
                  />
                  {getFieldError('current_healthcare') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('current_healthcare')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Coffee className="mr-1 h-4 w-4" />
                    Entertainment & Dining *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_entertainment', { 
                      required: 'Entertainment cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('current_entertainment') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="250"
                  />
                  {getFieldError('current_entertainment') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('current_entertainment')}
                    </p>
                  )}
                </div>
              </div>

              {/* Current Total Display */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">
                    Current Monthly Total:
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${currentMonthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Income Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Income Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('gross_annual_income', { 
                      required: 'Annual income is required',
                      min: { value: 0, message: 'Income must be positive' }
                    })}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 ${
                      getFieldError('gross_annual_income') ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="75000"
                  />
                  {getFieldError('gross_annual_income') && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('gross_annual_income')}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Military Retirement (Annual)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('military_retirement_income')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VA Disability (Annual)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('disability_compensation_income')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results & Comparison */}
          <div className="space-y-6">
            {/* Live Comparison */}
            {comparisonData && selectedOriginState && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cost Comparison Preview
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Housing</span>
                    <div className="flex items-center">
                      {comparisonData.percentage_changes.housing < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={
                        comparisonData.percentage_changes.housing < 0 
                          ? 'text-green-600 font-medium' 
                          : 'text-red-600 font-medium'
                      }>
                        {comparisonData.percentage_changes.housing > 0 ? '+' : ''}
                        {comparisonData.percentage_changes.housing}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Overall</span>
                    <div className="flex items-center">
                      {comparisonData.percentage_changes.overall_cost_of_living < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={
                        comparisonData.percentage_changes.overall_cost_of_living < 0 
                          ? 'text-green-600 font-bold' 
                          : 'text-red-600 font-bold'
                      }>
                        {comparisonData.percentage_changes.overall_cost_of_living > 0 ? '+' : ''}
                        {comparisonData.percentage_changes.overall_cost_of_living}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">How it works:</p>
                  <p className="text-blue-600">
                    This calculator uses cost of living data to estimate how your expenses 
                    would change if you moved to Maine. Fill in your current expenses to get started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || saveCalculationMutation.isPending}
            className="flex items-center px-6 py-3 bg-maine-600 text-white rounded-md hover:bg-maine-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isSubmitting || saveCalculationMutation.isPending) ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {id ? 'Update' : 'Save'} Calculation
          </button>
        </div>
      </form>
    </div>
  )
}

export default Calculator