// src/components/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-maine-400 mr-2" />
              <span className="text-xl font-bold">Maine Veterans Cost Calculator</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Helping veterans make informed decisions about relocating to Maine by providing 
              accurate cost-of-living comparisons and veteran-specific benefit information.
            </p>
            <div className="text-sm text-gray-400">
              <p>Built with ❤️ for our veterans</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-maine-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-maine-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-gray-300 hover:text-maine-400 transition-colors">
                  Calculator
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-maine-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="h-4 w-4 text-maine-400 mr-2" />
                <span className="text-gray-300">support@maineveterans.com</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 text-maine-400 mr-2" />
                <span className="text-gray-300">(207) 555-0123</span>
              </li>
              <li className="flex items-center">
                <MapPin className="h-4 w-4 text-maine-400 mr-2" />
                <span className="text-gray-300">Augusta, Maine</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              <p>&copy; 2024 Maine Veterans Cost Calculator. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-maine-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-maine-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/accessibility" className="text-sm text-gray-400 hover:text-maine-400 transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer