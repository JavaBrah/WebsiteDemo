// src/pages/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Calculator,
  Shield,
  TrendingDown,
  MapPin,
  DollarSign,
  Users,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()

  const features = [
    {
      icon: Calculator,
      title: 'Cost Calculator',
      description: 'Compare your current living expenses with estimated costs in Maine using real data.'
    },
    {
      icon: Shield,
      title: 'Veteran-Focused',
      description: 'Built specifically for veterans with military benefits and tax considerations.'
    },
    {
      icon: TrendingDown,
      title: 'Potential Savings',
      description: 'Many veterans save money moving to Maine due to lower housing and overall costs.'
    },
    {
      icon: MapPin,
      title: 'State Comparison',
      description: 'Detailed comparisons between your current state and Maine across all expense categories.'
    }
  ]

  const benefits = [
    'No tax on military retirement income',
    'Property tax exemptions for veterans',
    'Lower housing costs than many states',
    'Excellent healthcare system',
    'Strong veteran community',
    'Beautiful natural environment'
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      branch: "Army Veteran",
      quote: "Moving to Maine saved us over $18,000 per year. This calculator helped us make the decision with confidence."
    },
    {
      name: "Mike Rodriguez",
      branch: "Navy Veteran",
      quote: "The tool showed exactly how our expenses would change. Maine's been perfect for our family."
    },
    {
      name: "Jennifer Chen",
      branch: "Air Force Veteran",
      quote: "I wish I had this calculator years ago. It would have saved so much guesswork about relocating."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-maine-600 via-maine-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 mr-3 text-maine-200" />
                <span className="text-maine-200 font-medium">For Veterans</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Discover Your
                <span className="block text-maine-200">Maine Advantage</span>
              </h1>
              
              <p className="text-xl text-maine-100 mb-8 leading-relaxed">
                Calculate how much you could save by moving to Maine. Our veteran-focused 
                tool considers military benefits, state taxes, and real cost-of-living data 
                to give you accurate projections.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/calculator"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-maine-700 font-semibold rounded-lg hover:bg-maine-50 transition-all duration-200 shadow-lg"
                  >
                    <Calculator className="mr-2 h-5 w-5" />
                    Start Calculating
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-maine-700 font-semibold rounded-lg hover:bg-maine-50 transition-all duration-200 shadow-lg"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                )}
                
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-maine-700 transition-all duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="text-2xl font-bold mb-6 text-center">Quick Preview</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                    <span className="text-maine-100">Housing Costs</span>
                    <div className="flex items-center text-green-300">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      <span className="font-bold">-15% avg</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                    <span className="text-maine-100">State Income Tax</span>
                    <div className="flex items-center text-green-300">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-bold">$0 on military retirement</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-white/10 rounded-lg">
                    <span className="text-maine-100">Property Tax</span>
                    <div className="flex items-center text-green-300">
                      <Shield className="h-4 w-4 mr-1" />
                      <span className="font-bold">Veteran exemptions</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-maine-200 text-sm">
                    * Actual savings vary by individual circumstances
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Calculator?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get accurate, personalized cost comparisons based on real data and veteran-specific benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-maine-100 rounded-full mb-4 group-hover:bg-maine-600 group-hover:text-white transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-maine-600 group-hover:text-white" />
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

      {/* Maine Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Maine: A Veteran-Friendly State
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Maine offers numerous advantages for veterans, from financial benefits 
                to quality of life improvements. Here's what makes Maine special:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Average Veteran Savings in Maine
              </h3>
              
              <div className="space-y-6">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-green-600">$15,600</span>
                    <span className="text-gray-500 ml-2 mb-1">per year</span>
                  </div>
                  <p className="text-sm text-gray-600">Average housing savings</p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-blue-600">$0</span>
                    <span className="text-gray-500 ml-2 mb-1">tax</span>
                  </div>
                  <p className="text-sm text-gray-600">On military retirement income</p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-purple-600">$6,000</span>
                    <span className="text-gray-500 ml-2 mb-1">exemption</span>
                  </div>
                  <p className="text-sm text-gray-600">Homestead property tax exemption</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-maine-50 rounded-lg">
                <p className="text-sm text-maine-700 font-medium">
                  Ready to see your personalized savings?
                </p>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="inline-block mt-2 text-maine-600 hover:text-maine-700 font-medium"
                  >
                    Start your free calculation →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Veterans Are Saying
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from veterans who made the move to Maine
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.branch}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-maine-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-maine-200 mr-2" />
                <span className="text-4xl font-bold">40,000+</span>
              </div>
              <p className="text-maine-200">Veterans in Maine</p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-8 w-8 text-maine-200 mr-2" />
                <span className="text-4xl font-bold">23%</span>
              </div>
              <p className="text-maine-200">Lower housing costs</p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-8 w-8 text-maine-200 mr-2" />
                <span className="text-4xl font-bold">$0</span>
              </div>
              <p className="text-maine-200">Tax on military retirement</p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="h-8 w-8 text-maine-200 mr-2" />
                <span className="text-4xl font-bold">#3</span>
              </div>
              <p className="text-maine-200">Safest state in US</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Discover Your Savings?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of veterans who've used our calculator to make informed decisions about moving to Maine.
          </p>

          {isAuthenticated ? (
            <div className="space-y-4">
              <Link
                to="/calculator"
                className="inline-flex items-center px-8 py-4 bg-maine-600 hover:bg-maine-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                <Calculator className="mr-2 h-5 w-5" />
                Start Your Calculation
              </Link>
              <div>
                <Link
                  to="/dashboard"
                  className="text-maine-300 hover:text-maine-200 underline"
                >
                  Or view your dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-maine-600 hover:bg-maine-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Get Started - It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
              <p className="text-sm text-gray-400">
                Already have an account? 
                <Link to="/login" className="text-maine-300 hover:text-maine-200 ml-1 underline">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home