// src/pages/Calculator.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Info
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

  // Fetch states data
  const { data: states, isLoading: statesLoading } = useQuery(
    'states',
    () => statesAPI.getAll(),
    {
      select: (response) => response.data
    }
  )

  // Fetch existing calculation if editing
  const { data: calculation, isLoading: calculationLoading } = useQuery(
    ['calculation', id],
    () => calculationsAPI.getById(id),
    {
      enabled: !!id,
      select: (response) => response.data,
      onSuccess: (data) => {
        // Populate form with existing data
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            setValue(key, data[key])
          }
        })
        setSelectedOriginState(data.origin_state)
      }
    }
  )

  // Create/Update calculation mutation
  const saveCalculationMutation = useMutation(
    (data) => {
      if (id) {
        return calculationsAPI.update(id, data)
      } else {
        return calculationsAPI.create(data)
      }
    },
    {
      onSuccess: (response) => {
        const savedCalculation = response.data
        toast.success(id ? 'Calculation updated!' : 'Calculation saved!')
        
        // Invalidate and refetch calculations
        queryClient.invalidateQueries('calculations')
        queryClient.invalidateQueries('dashboard')
        
        // Navigate to the saved calculation if creating new
        if (!id) {
          navigate(`/calculator/${savedCalculation.id}`)
        }
      },
      onError: (error) => {
        toast.error('Failed to save calculation')
        console.error('Save error:', error)
      }
    }
  )

  // Get comparison data when origin state changes
  useEffect(() => {
    if (selectedOriginState) {
      statesAPI.compareStates({ 
        origin: selectedOriginState.id, 
        destination: states?.find(s => s.state_code === 'ME')?.id 
      })
      .then(response => {
        setComparisonData(response.data)
      })
      .catch(error => {
        console.error('Comparison error:', error)
      })
    }
  }, [selectedOriginState, states])

  const onSubmit = async (data) => {
    try {
      // Convert string values to numbers
      const numericData = {
        ...data,
        current_rent: parseFloat(data.current_rent) || 0,
        current_utilities: parseFloat(data.current_utilities) || 0,
        current_groceries: parseFloat(data.current_groceries) || 0,
        current_transportation: parseFloat(data.current_transportation) || 0,
        current_healthcare: parseFloat(data.current_healthcare) || 0,
        current_entertainment: parseFloat(data.current_entertainment) || 0,
        gross_annual_income: parseFloat(data.gross_annual_income) || 0,
        military_retirement_income: parseFloat(data.military_retirement_income) || 0,
        disability_compensation_income: parseFloat(data.disability_compensation_income) || 0,
      }

      await saveCalculationMutation.mutateAsync(numericData)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handleStateChange = (state) => {
    setSelectedOriginState(state)
    setValue('origin_state_id', state.id)
  }

  // Calculate current totals for display
  const currentMonthlyTotal = Object.entries(watchedValues)
    .filter(([key]) => key.startsWith('current_') && !key.includes('annual'))
    .reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0)

  if (statesLoading || (id && calculationLoading)) {
    return <LoadingSpinner />
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
                      required: 'Calculation name is required' 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500 focus:border-transparent"
                    placeholder="e.g., Texas to Maine Move"
                  />
                  {errors.calculation_name && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.calculation_name.message}
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
                  {errors.origin_state_id && (
                    <p className="mt-1 text-sm text-red-600">
                      Current state is required
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
                    Housing (Rent/Mortgage)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_rent', { 
                      required: 'Housing cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="2,000"
                  />
                  {errors.current_rent && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.current_rent.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Zap className="mr-1 h-4 w-4" />
                    Utilities
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_utilities', { 
                      required: 'Utilities cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="150"
                  />
                  {errors.current_utilities && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.current_utilities.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    Groceries
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_groceries', { 
                      required: 'Grocery cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="400"
                  />
                  {errors.current_groceries && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.current_groceries.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Car className="mr-1 h-4 w-4" />
                    Transportation
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_transportation', { 
                      required: 'Transportation cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="300"
                  />
                  {errors.current_transportation && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.current_transportation.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Heart className="mr-1 h-4 w-4" />
                    Healthcare
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_healthcare', { 
                      required: 'Healthcare cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="200"
                  />
                  {errors.current_healthcare && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.current_healthcare.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Coffee className="mr-1 h-4 w-4" />
                    Entertainment & Dining
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('current_entertainment', { 
                      required: 'Entertainment cost is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="250"
                  />
                  {errors.current_entertainment && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.current_entertainment.message}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-maine-500"
                    placeholder="75,000"
                  />
                  {errors.gross_annual_income && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gross_annual_income.message}
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
                    <span className="text-gray-600">Utilities</span>
                    <div className="flex items-center">
                      {comparisonData.percentage_changes.utilities < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={
                        comparisonData.percentage_changes.utilities < 0 
                          ? 'text-green-600 font-medium' 
                          : 'text-red-600 font-medium'
                      }>
                        {comparisonData.percentage_changes.utilities > 0 ? '+' : ''}
                        {comparisonData.percentage_changes.utilities}%
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Groceries</span>
                    <div className="flex items-center">
                      {comparisonData.percentage_changes.groceries < 0 ? (
                        <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={
                        comparisonData.percentage_changes.groceries < 0 
                          ? 'text-green-600 font-medium' 
                          : 'text-red-600 font-medium'
                      }>
                        {comparisonData.percentage_changes.groceries > 0 ? '+' : ''}
                        {comparisonData.percentage_changes.groceries}%
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center font-medium">
                      <span className="text-gray-900">Overall</span>
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
              </div>
            )}

            {/* Calculation Results */}
            {calculation?.total_monthly_savings && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Estimated Results
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-maine-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Monthly Impact</p>
                      <p className={`text-3xl font-bold ${
                        calculation.total_monthly_savings >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {calculation.total_monthly_savings >= 0 ? '+' : ''}
                        ${Math.abs(calculation.total_monthly_savings).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {calculation.total_monthly_savings >= 0 ? 'Savings' : 'Additional Cost'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Annual Impact</p>
                      <p className={`text-2xl font-bold ${
                        calculation.total_annual_savings >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {calculation.total_annual_savings >= 0 ? '+' : ''}
                        ${Math.abs(calculation.total_annual_savings).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
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
                    This calculator uses official cost of living indices and tax rates 
                    to estimate how your expenses would change if you moved to Maine. 
                    Save your calculation to track different scenarios.
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
            disabled={isSubmitting || saveCalculationMutation.isLoading}
            className="flex items-center px-6 py-3 bg-maine-600 text-white rounded-md hover:bg-maine-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {(isSubmitting || saveCalculationMutation.isLoading) ? (
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