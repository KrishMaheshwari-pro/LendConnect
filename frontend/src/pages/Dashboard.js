import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard,
  Plus,
  ArrowRight,
  Eye
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Loans',
      value: '12',
      change: '+2 from last month',
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      name: 'Active Investments',
      value: '$45,231',
      change: '+12.5% from last month',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Credit Score',
      value: '750',
      change: '+15 points',
      changeType: 'positive',
      icon: CreditCard,
    },
    {
      name: 'Connections',
      value: '24',
      change: '+3 new this week',
      changeType: 'positive',
      icon: Users,
    },
  ];

  const recentLoans = [
    {
      id: 1,
      title: 'Business Expansion Loan',
      amount: 25000,
      status: 'active',
      borrower: 'John Smith',
      interestRate: 8.5,
      dueDate: '2024-03-15',
    },
    {
      id: 2,
      title: 'Home Renovation',
      amount: 15000,
      status: 'pending',
      borrower: 'Sarah Johnson',
      interestRate: 7.2,
      dueDate: '2024-04-20',
    },
    {
      id: 3,
      title: 'Emergency Fund',
      amount: 5000,
      status: 'completed',
      borrower: 'Mike Wilson',
      interestRate: 9.0,
      dueDate: '2024-01-10',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'completed':
        return 'badge-info';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-blue-100">
          Here's what's happening with your LendConnect account today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(user?.role === 'borrower' || user?.role === 'both') && (
          <Link
            to="/create-loan"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Apply for Loan</h3>
                <p className="text-gray-600">Get funding for your needs</p>
              </div>
            </div>
          </Link>
        )}

        {(user?.role === 'lender' || user?.role === 'both') && (
          <Link
            to="/lender"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Browse Loans</h3>
                <p className="text-gray-600">Find investment opportunities</p>
              </div>
            </div>
          </Link>
        )}

        <Link
          to="/messages"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <p className="text-gray-600">Connect with users</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </dd>
                    <dd className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Loans</h3>
            <Link
              to="/loans"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentLoans.map((loan) => (
            <div key={loan.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-sm font-medium text-gray-900">
                      {loan.title}
                    </h4>
                    <span className={`ml-2 badge ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span>Borrower: {loan.borrower}</span>
                    <span className="mx-2">•</span>
                    <span>Rate: {loan.interestRate}%</span>
                    <span className="mx-2">•</span>
                    <span>Due: {loan.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold text-gray-900">
                    ${loan.amount.toLocaleString()}
                  </span>
                  <Link
                    to={`/loans/${loan.id}`}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Pro Tip
        </h3>
        <p className="text-blue-800">
          {user?.role === 'borrower' || user?.role === 'both'
            ? 'Complete your profile verification to get better loan rates and faster approvals.'
            : 'Diversify your investments across different loan types and risk levels to maximize returns while managing risk.'}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
