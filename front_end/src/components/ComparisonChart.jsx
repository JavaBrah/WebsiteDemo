// src/components/ComparisonChart.jsx
import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

const ComparisonChart = ({ 
  originState, 
  destinationState = 'Maine', 
  comparisonData,
  userExpenses = {}
}) => {
  if (!comparisonData || !originState) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p>Select a state to see cost comparison</p>
        </div>
      </div>
    )
  }

  // Prepare data for the chart
  const chartData = [
    {
      category: 'Housing',
      current: userExpenses.current_rent || 0,
      maine: userExpenses.current_rent ? 
        (userExpenses.current_rent * (1 + comparisonData.percentage_changes.housing / 100)) : 0,
      change: comparisonData.percentage_changes.housing
    },
    {
      category: 'Utilities',
      current: userExpenses.current_utilities || 0,
      maine: userExpenses.current_utilities ? 
        (userExpenses.current_utilities * (1 + comparisonData.percentage_changes.utilities / 100)) : 0,
      change: comparisonData.percentage_changes.utilities
    },
    {
      category: 'Groceries',
      current: userExpenses.current_groceries || 0,
      maine: userExpenses.current_groceries ? 
        (userExpenses.current_groceries * (1 + comparisonData.percentage_changes.groceries / 100)) : 0,
      change: comparisonData.percentage_changes.groceries
    },
    {
      category: 'Transportation',
      current: userExpenses.current_transportation || 0,
      maine: userExpenses.current_transportation ? 
        (userExpenses.current_transportation * (1 + comparisonData.percentage_changes.transportation / 100)) : 0,
      change: comparisonData.percentage_changes.transportation
    },
    {
      category: 'Healthcare',
      current: userExpenses.current_healthcare || 0,
      maine: userExpenses.current_healthcare ? 
        (userExpenses.current_healthcare * (1 + comparisonData.percentage_changes.healthcare / 100)) : 0,
      change: comparisonData.percentage_changes.healthcare
    }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-600">Current ({originState.state_name}): </span>
              <span className="font-medium">${data.current.toFixed(0)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Maine: </span>
              <span className="font-medium">${data.maine.toFixed(0)}</span>
            </p>
            <div className="flex items-center text-sm">
              <span className="text-gray-600 mr-2">Change: </span>
              {data.change < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={data.change < 0 ? 'text-green-600' : 'text-red-600'}>
                {data.change > 0 ? '+' : ''}{data.change.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  const totalCurrent = chartData.reduce((sum, item) => sum + item.current, 0)
  const totalMaine = chartData.reduce((sum, item) => sum + item.maine, 0)
  const totalChange = totalCurrent > 0 ? ((totalMaine - totalCurrent) / totalCurrent * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cost Comparison: {originState.state_name} vs Maine
        </h3>
        
        {/* Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Monthly Total Impact</p>
              <p className="text-2xl font-bold text-gray-900">
                ${Math.abs(totalMaine - totalCurrent).toFixed(0)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                {totalChange < 0 ? (
                  <>
                    <TrendingDown className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-green-600 font-semibold">Savings</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 text-red-500 mr-1" />
                    <span className="text-red-600 font-semibold">Increase</span>
                  </>
                )}
              </div>
              <p className={`text-lg font-bold ${totalChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="current" 
              fill="#6b7280" 
              name={originState.state_name}
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="maine" 
              fill="#0284c7" 
              name="Maine"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Breakdown */}
      <div className="mt-6 space-y-3">
        <h4 className="font-medium text-gray-900">Detailed Breakdown:</h4>
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{item.category}</span>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">
                ${item.current.toFixed(0)} → ${item.maine.toFixed(0)}
              </span>
              {item.change < 0 ? (
                <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={`font-medium ${item.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ComparisonChart