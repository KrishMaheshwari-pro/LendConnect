import React from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, 
  Shield, 
  Users, 
  TrendingUp, 
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: DollarSign,
      title: 'Quick Loans',
      description: 'Get access to funds quickly with our streamlined application process.'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data and transactions are protected with bank-level security.'
    },
    {
      icon: Users,
      title: 'Peer-to-Peer',
      description: 'Connect directly with lenders and borrowers in your community.'
    },
    {
      icon: TrendingUp,
      title: 'Better Rates',
      description: 'Competitive interest rates for both borrowers and lenders.'
    }
  ];

  const benefits = [
    'No hidden fees or charges',
    'Transparent loan terms',
    '24/7 customer support',
    'Mobile-friendly platform',
    'Quick approval process',
    'Flexible repayment options'
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '$50M+', label: 'Loans Processed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.8/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">LendConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect. Lend. Grow.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              The modern way to borrow and lend money with trusted peers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center justify-center"
              >
                Start Lending
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center justify-center"
              >
                Apply for Loan
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose LendConnect?
            </h2>
            <p className="text-xl text-gray-600">
              We make lending and borrowing simple, secure, and profitable
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Everything you need to succeed
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Our platform provides all the tools and features you need to make informed lending and borrowing decisions.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Ready to get started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of users who are already using LendConnect to grow their wealth and achieve their financial goals.
              </p>
              <div className="flex items-center mb-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center"
                    >
                      <span className="text-xs text-white font-semibold">
                        {i}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">4.8/5 from 1,000+ reviews</p>
                </div>
              </div>
              <Link
                to="/register"
                className="w-full bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg text-center font-semibold inline-block"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your financial future?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join LendConnect today and start your journey towards financial freedom
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LendConnect</h3>
              <p className="text-gray-400">
                The modern way to borrow and lend money with trusted peers.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Borrowers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Apply for Loan</a></li>
                <li><a href="#" className="hover:text-white">Loan Calculator</a></li>
                <li><a href="#" className="hover:text-white">Repayment Options</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Lenders</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Browse Loans</a></li>
                <li><a href="#" className="hover:text-white">Investment Guide</a></li>
                <li><a href="#" className="hover:text-white">Portfolio Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LendConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
