import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, DollarSign, Clock, CheckCircle } from 'lucide-react';

const BorrowerDashboard = () => {
  const loans = [
    {
      id: 1,
      title: 'Business Expansion',
      amount: 25000,
      status: 'active',
      interestRate: 8.5,
      monthlyPayment: 1250,
      remainingBalance: 20000,
      nextPayment: '2024-02-15',
    },
    {
      id: 2,
      title: 'Equipment Purchase',
      amount: 15000,
      status: 'pending',
      interestRate: 7.2,
      monthlyPayment: 750,
      remainingBalance: 15000,
      nextPayment: '2024-03-01',
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Borrower Dashboard</h1>
          <p className="text-gray-600">Manage your loan applications and repayments</p>
        </div>
        <Link
          to="/create-loan"
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Apply for Loan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-semibold text-gray-900">$40,000</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Loans</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Applications</p>
              <p className="text-2xl font-semibold text-gray-900">1</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Monthly Payment</p>
              <p className="text-2xl font-semibold text-gray-900">$2,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* My Loans */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">My Loans</h3>
        </div>
        <div className="space-y-4">
          {loans.map((loan) => (
            <div key={loan.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className="text-lg font-medium text-gray-900">
                      {loan.title}
                    </h4>
                    <span className={`ml-3 badge ${getStatusColor(loan.status)}`}>
                      {loan.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Amount:</span> ${loan.amount.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Rate:</span> {loan.interestRate}%
                    </div>
                    <div>
                      <span className="font-medium">Monthly Payment:</span> ${loan.monthlyPayment}
                    </div>
                    <div>
                      <span className="font-medium">Next Payment:</span> {loan.nextPayment}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/loans/${loan.id}`}
                    className="btn btn-outline"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/create-loan"
              className="w-full btn btn-primary flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Apply for New Loan
            </Link>
            <Link
              to="/transactions"
              className="w-full btn btn-outline flex items-center justify-center"
            >
              <DollarSign className="h-5 w-5 mr-2" />
              View Payment History
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Tips</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Make payments on time to improve your credit score</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Consider shorter loan terms for lower total interest</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Keep your loan-to-income ratio below 40%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDashboard;
