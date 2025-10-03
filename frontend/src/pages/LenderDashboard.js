import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, Users, Eye, Filter } from 'lucide-react';

const LenderDashboard = () => {
  const availableLoans = [
    {
      id: 1,
      title: 'Small Business Expansion',
      borrower: 'John Smith',
      amount: 25000,
      interestRate: 8.5,
      tenure: 24,
      purpose: 'business',
      riskScore: 7,
      creditScore: 750,
    },
    {
      id: 2,
      title: 'Home Renovation',
      borrower: 'Sarah Johnson',
      amount: 15000,
      interestRate: 7.2,
      tenure: 36,
      purpose: 'home-improvement',
      riskScore: 5,
      creditScore: 720,
    },
    {
      id: 3,
      title: 'Education Loan',
      borrower: 'Mike Wilson',
      amount: 10000,
      interestRate: 6.8,
      tenure: 48,
      purpose: 'education',
      riskScore: 3,
      creditScore: 780,
    },
  ];

  const myInvestments = [
    {
      id: 1,
      title: 'Tech Startup Funding',
      borrower: 'Alex Chen',
      amount: 5000,
      interestRate: 9.5,
      status: 'active',
      monthlyReturn: 45,
      totalReturn: 540,
    },
    {
      id: 2,
      title: 'Restaurant Equipment',
      borrower: 'Maria Garcia',
      amount: 8000,
      interestRate: 8.0,
      status: 'active',
      monthlyReturn: 64,
      totalReturn: 768,
    },
  ];

  const getRiskColor = (score) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lender Dashboard</h1>
          <p className="text-gray-600">Discover investment opportunities and manage your portfolio</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Invested</p>
              <p className="text-2xl font-semibold text-gray-900">$13,000</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Monthly Returns</p>
              <p className="text-2xl font-semibold text-gray-900">$109</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Investments</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Returns</p>
              <p className="text-2xl font-semibold text-gray-900">$1,308</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Loans */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Available Loans</h3>
        </div>
        <div className="space-y-4">
          {availableLoans.map((loan) => (
            <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {loan.title}
                    </h4>
                    <span className={`ml-3 badge ${
                      loan.riskScore <= 3 ? 'badge-success' : 
                      loan.riskScore <= 6 ? 'badge-warning' : 'badge-danger'
                    }`}>
                      Risk: {loan.riskScore}/10
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Borrower:</span> {loan.borrower}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> ${loan.amount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> {loan.interestRate}%
                    </div>
                    <div>
                      <span className="font-medium">Credit Score:</span> {loan.creditScore}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/loans/${loan.id}`}
                    className="btn btn-outline flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                  <button className="btn btn-primary">
                    Invest
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Investments */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">My Investments</h3>
        </div>
        <div className="space-y-4">
          {myInvestments.map((investment) => (
            <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {investment.title}
                    </h4>
                    <span className={`ml-3 badge ${getStatusColor(investment.status)}`}>
                      {investment.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Borrower:</span> {investment.borrower}
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span> ${investment.amount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> {investment.interestRate}%
                    </div>
                    <div>
                      <span className="font-medium">Monthly Return:</span> ${investment.monthlyReturn}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/loans/${investment.id}`}
                    className="btn btn-outline flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LenderDashboard;
