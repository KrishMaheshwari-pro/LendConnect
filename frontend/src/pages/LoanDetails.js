import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, User, Shield } from 'lucide-react';

const LoanDetails = () => {
  const { id } = useParams();

  // Mock data - in real app, this would come from API
  const loan = {
    id: id,
    title: 'Small Business Expansion',
    description: 'Looking to expand my restaurant business by opening a second location. Need funds for equipment, renovation, and initial inventory.',
    borrower: {
      name: 'John Smith',
      email: 'john@example.com',
      creditScore: 750,
      verificationStatus: {
        email: true,
        phone: true,
        identity: true,
        address: false,
        income: true
      }
    },
    amount: 25000,
    interestRate: 8.5,
    tenure: 24,
    tenureUnit: 'months',
    purpose: 'business',
    category: 'unsecured',
    status: 'pending',
    monthlyPayment: 1250,
    totalAmount: 30000,
    totalInterest: 5000,
    createdAt: '2024-01-15',
    fundingProgress: {
      fundedAmount: 0,
      fundedPercentage: 0,
      fundedBy: []
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-info';
      case 'funded':
        return 'badge-success';
      default:
        return 'badge-gray';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{loan.title}</h1>
          <p className="text-gray-600">Loan ID: #{loan.id}</p>
        </div>
        <div className="ml-auto">
          <span className={`badge ${getStatusColor(loan.status)}`}>
            {loan.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loan Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-gray-600 mt-1">{loan.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Purpose</h4>
                  <p className="text-gray-600 capitalize">{loan.purpose.replace('-', ' ')}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Category</h4>
                  <p className="text-gray-600 capitalize">{loan.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Created</h4>
                  <p className="text-gray-600">{new Date(loan.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <span className={`badge ${getStatusColor(loan.status)}`}>
                    {loan.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Borrower Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">{loan.borrower.name}</h4>
                  <p className="text-gray-600">{loan.borrower.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Credit Score</h4>
                  <p className="text-gray-600">{loan.borrower.creditScore}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Verification Status</h4>
                  <div className="flex space-x-2">
                    {Object.entries(loan.borrower.verificationStatus).map(([key, verified]) => (
                      <span
                        key={key}
                        className={`badge ${verified ? 'badge-success' : 'badge-warning'}`}
                      >
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Loan Amount</span>
                </div>
                <span className="font-semibold text-gray-900">${loan.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Interest Rate</span>
                </div>
                <span className="font-semibold text-gray-900">{loan.interestRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Term</span>
                </div>
                <span className="font-semibold text-gray-900">{loan.tenure} {loan.tenureUnit}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Monthly Payment</span>
                </div>
                <span className="font-semibold text-gray-900">${loan.monthlyPayment.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Total Amount</span>
                </div>
                <span className="font-semibold text-gray-900">${loan.totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Total Interest</span>
                </div>
                <span className="font-semibold text-gray-900">${loan.totalInterest.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Funded Amount</span>
                  <span>${loan.fundingProgress.fundedAmount.toLocaleString()} / ${loan.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${loan.fundingProgress.fundedPercentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {loan.fundingProgress.fundedPercentage}% funded
                </p>
              </div>
              
              {loan.fundingProgress.fundedBy.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Lenders</h4>
                  <div className="space-y-2">
                    {loan.fundingProgress.fundedBy.map((funding, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">Lender {index + 1}</span>
                        <span className="font-medium">${funding.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn btn-primary">
                Fund This Loan
              </button>
              <button className="w-full btn btn-outline">
                Contact Borrower
              </button>
              <button className="w-full btn btn-outline">
                Save for Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
