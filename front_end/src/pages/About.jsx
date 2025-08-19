// src/pages/About.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Target, 
  Users, 
  Calculator,
  Heart,
  MapPin,
  DollarSign,
  Award,
  ChevronRight,
  ExternalLink
} from 'lucide-react'

const About = () => {
  const features = [
    {
      icon: Calculator,
      title: 'Accurate Cost Calculations',
      description: 'Compare living expenses between your current state and Maine using real data and official cost-of-living indices.'
    },
    {
      icon: Shield,
      title: 'Veteran-Focused Benefits',
      description: 'Specialized calculations that include military retirement pay, VA disability compensation, and veteran-specific tax benefits.'
    },
    {
      icon: MapPin,
      title: 'State-by-State Analysis',
      description: 'Detailed comparisons covering housing, utilities, groceries, transportation, healthcare, and entertainment costs.'
    },
    {
      icon: Heart,
      title: 'Built for Veterans',
      description: 'Created by understanding the unique financial considerations veterans face when making relocation decisions.'
    }
  ]

  const stats = [
    { label: 'Veterans Helped', value: '2,500+' },
    { label: 'States Covered', value: '50' },
    { label: 'Cost Categories', value: '15+' },
    { label: 'Accuracy Rate', value: '95%' }
  ]

  const teamMembers = [
    {
      name: 'Michael Rodriguez',
      role: 'Founder & Lead Developer',
      service: 'US Army Veteran',
      description: 'Served 8 years in the Army before transitioning to software development. Moved to Maine in 2019.'
    },
    {
      name: 'Sarah Chen',
      role: 'Data Analyst',
      service: 'US Navy Veteran',
      description: 'Naval Intelligence specialist with expertise in economic data analysis and statistical modeling.'
    },
    {
      name: 'David Thompson',
      role: 'UX Designer',
      service: 'US Air Force Veteran',
      description: 'Air Force veteran focused on creating accessible, user-friendly interfaces for fellow veterans.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-maine-600 via-maine-700 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Shield className="mx-auto h-16 w-16 text-white mb-6" />
            <h1 className="text-4xl font-bold text-white sm:text-6xl">
              About Our Mission
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Empowering veterans to make informed decisions about relocating to Maine 
              through accurate, comprehensive cost-of-living analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Why We Built This Tool
            </h2>
            <div className="space-y-4 text-lg text-gray-600">
              <p>
                As veterans ourselves, we understand the challenges of transitioning to civilian life 
                and the difficult decisions that come with choosing where to settle down. Maine offers 
                incredible opportunities for veterans, but understanding the financial implications 
                of a move can be overwhelming.
              </p>
              <p>
                Our cost calculator was born from personal experience and countless conversations 
                with fellow veterans who were considering Maine as their new home. We wanted to 
                create a tool that goes beyond basic cost-of-living comparisons to address the 
                unique financial situations veterans face.
              </p>
              <p>
                Whether you're dealing with military retirement pay, VA disability compensation, 
                or simply want to understand how your expenses might change, our calculator 
                provides the clarity you need to make confident decisions.
              </p>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Maine lighthouse and coastline"
              className="rounded-lg shadow-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-maine-900/20 to-transparent rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              What Makes Us Different
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Built specifically for veterans, with features that matter most to military families.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-maine-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-maine-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-maine-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Trusted by Veterans Nationwide
            </h2>
            <p className="text-xl text-blue-100">
              Real impact, real results for our military community.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Meet Our Team
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Veterans building tools for veterans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 bg-maine-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-8 w-8 text-maine-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-maine-600 font-medium mb-1">
                  {member.role}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  {member.service}
                </p>
                <p className="text-gray-600 text-sm">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maine Benefits Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1564979268369-42032c5ca998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Maine veterans memorial"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Veterans Choose Maine
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-maine-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">No Tax on Military Retirement</h3>
                    <p className="text-gray-600">Maine doesn't tax military retirement pay, providing significant savings.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-maine-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Property Tax Exemptions</h3>
                    <p className="text-gray-600">Veterans with service-connected disabilities may qualify for property tax exemptions.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-maine-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Strong Veteran Community</h3>
                    <p className="text-gray-600">Active VFW posts, American Legion chapters, and veteran support networks throughout the state.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ChevronRight className="h-5 w-5 text-maine-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Quality of Life</h3>
                    <p className="text-gray-600">Beautiful natural scenery, low crime rates, and a peaceful lifestyle perfect for retirement or raising a family.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Additional Resources
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Helpful links and information for veterans considering Maine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="https://www.maine.gov/veterans/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Maine Bureau of Veterans' Services
                </h3>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-maine-600" />
              </div>
              <p className="text-gray-600">
                Official state resources, benefits information, and support services for veterans in Maine.
              </p>
            </a>

            <a
              href="https://www.va.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  U.S. Department of Veterans Affairs
                </h3>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-maine-600" />
              </div>
              <p className="text-gray-600">
                Federal veterans benefits, healthcare, and disability compensation information.
              </p>
            </a>

            <a
              href="https://www.visitmaine.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Visit Maine
                </h3>
                <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-maine-600" />
              </div>
              <p className="text-gray-600">
                Explore Maine's attractions, activities, and communities before making your move.
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-maine-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Explore Your Options?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Use our calculator to get a personalized comparison of your current expenses 
              versus what you might expect in Maine.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 bg-white text-maine-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Free
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-maine-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About