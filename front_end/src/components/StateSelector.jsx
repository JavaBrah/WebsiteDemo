import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search } from 'lucide-react'

const StateSelector = ({ 
  states = [], 
  selectedState, 
  onStateChange, 
  excludeStates = [],
  placeholder = "Select a state" 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)

  // Filter states based on search term and exclusions
  const filteredStates = states.filter(state => {
    const matchesSearch = state.state_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         state.state_code.toLowerCase().includes(searchTerm.toLowerCase())
    const isNotExcluded = !excludeStates.includes(state.state_code)
    return matchesSearch && isNotExcluded
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleStateSelect = (state) => {
    onStateChange(state)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main selector button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 flex items-center justify-between"
        style={{ backgroundColor: 'white', color: 'black' }}
      >
        <span className={selectedState ? 'text-black font-medium' : 'text-gray-600'} style={{ color: selectedState ? 'black' : '#6B7280' }}>
          {selectedState ? `${selectedState.state_name} (${selectedState.state_code})` : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200" style={{ color: '#6B7280', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-500"
              />
            </div>
          </div>
          
          {/* States list */}
          <div className="max-h-48 overflow-y-auto bg-white">
            {filteredStates.length > 0 ? (
              filteredStates.map((state, index) => (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => handleStateSelect(state)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 flex items-center justify-between group ${
                    index !== filteredStates.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <span className="text-black font-medium group-hover:text-blue-700">
                    {state.state_name}
                  </span>
                  <span className="text-gray-700 text-sm font-mono bg-gray-200 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600">
                    {state.state_code}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center">
                <div className="text-black text-sm">
                  {searchTerm ? 'No states match your search' : 'No states found'}
                </div>
                {searchTerm && (
                  <div className="text-gray-600 text-xs mt-1">
                    Try searching by state name or code
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results count footer */}
          {filteredStates.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-gray-200 text-xs text-black">
              {filteredStates.length} of {states.length} states
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StateSelector