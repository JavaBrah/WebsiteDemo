// src/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Menu, 
  X, 
  Calculator, 
  Home, 
  Info, 
  Mail, 
  User, 
  BarChart3, 
  LogOut,
  Shield
} from 'lucide-react'

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActiveLink = (path) => {
    return location.pathname === path
  }

  const navLinkClass = (path) => `
    relative px-3 py-2 text-sm font-medium transition-all duration-200
    ${isActiveLink(path) 
      ? 'text-maine-700 bg-maine-50 rounded-md' 
      : 'text-gray-700 hover:text-maine-600 hover:bg-gray-50 rounded-md'
    }
  `

  const mobileNavLinkClass = (path) => `
    flex items-center px-3 py-2 text-base font-medium transition-colors duration-200
    ${isActiveLink(path) 
      ? 'text-maine-700 bg-maine-50 border-r-2 border-maine-700' 
      : 'text-gray-700 hover:text-maine-600 hover:bg-gray-50'
    }
  `

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <Shield className="h-8 w-8 text-maine-600" />
              <span className="text-xl font-bold text-gray-900">
                Maine Veterans
              </span>
              <span className="hidden sm:inline text-sm text-gray-500">
                Cost Calculator
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClass('/')}>
              <Home className="inline h-4 w-4 mr-1" />
              Home
            </Link>
            
            <Link to="/about" className={navLinkClass('/about')}>
              <Info className="inline h-4 w-4 mr-1" />
              About
            </Link>
            
            <Link to="/contact" className={navLinkClass('/contact')}>
              <Mail className="inline h-4 w-4 mr-1" />
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <BarChart3 className="inline h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                
                <Link to="/calculator" className={navLinkClass('/calculator')}>
                  <Calculator className="inline h-4 w-4 mr-1" />
                  Calculator
                </Link>

                {/* User menu */}
                <div className="relative ml-4 flex items-center space-x-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-maine-600 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.first_name || user?.username}</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-maine-600 hover:text-maine-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-maine-600 hover:bg-maine-700 rounded-md transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-maine-600 p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={mobileNavLinkClass('/')}
              onClick={closeMobileMenu}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
            
            <Link
              to="/about"
              className={mobileNavLinkClass('/about')}
              onClick={closeMobileMenu}
            >
              <Info className="h-4 w-4 mr-2" />
              About
            </Link>
            
            <Link
              to="/contact"
              className={mobileNavLinkClass('/contact')}
              onClick={closeMobileMenu}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={mobileNavLinkClass('/dashboard')}
                  onClick={closeMobileMenu}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                
                <Link
                  to="/calculator"
                  className={mobileNavLinkClass('/calculator')}
                  onClick={closeMobileMenu}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculator
                </Link>
                
                <Link
                  to="/profile"
                  className={mobileNavLinkClass('/profile')}
                  onClick={closeMobileMenu}
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-maine-600 hover:bg-gray-50"
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-base font-medium text-white bg-maine-600 hover:bg-maine-700 mx-3 rounded-md mt-2"
                  onClick={closeMobileMenu}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar