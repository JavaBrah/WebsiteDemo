// src/pages/NotFound.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, Shield } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Shield className="h-16 w-16 text-maine-600" />
        </div>

        {/* 404 Message */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page may have been moved, 
            deleted, or you may have entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            to="/"
            className="btn-primary w-full flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-secondary w-full flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-maine-50 rounded-lg border border-maine-200">
          <p className="text-sm text-maine-700">
            Need help? <Link to="/contact" className="font-medium text-maine-600 hover:text-maine-800 underline">
              Contact our support team
            </Link> if you believe this is an error.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound