
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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-maine-500 focus:border-transparent flex items-center justify-between"
      >
        <span className={selectedState ? 'text-gray-900' : 'text-gray-500'}>
          {selectedState ? `${selectedState.state_name} (${selectedState.state_code})` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search states..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-maine-500"
              />
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredStates.length > 0 ? (
              filteredStates.map((state) => (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => handleStateSelect(state)}
                  className="w-full px-4 py-2 text-left hover:bg-maine-50 focus:bg-maine-50 focus:outline-none flex items-center justify-between"
                >
                  <span className="text-gray-900">{state.state_name}</span>
                  <span className="text-gray-500 text-sm">{state.state_code}</span>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                No states found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StateSelector
