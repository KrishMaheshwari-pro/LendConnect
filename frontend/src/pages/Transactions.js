import React from 'react';
import { DollarSign, TrendingUp, Calendar, Filter, Download } from 'lucide-react';

const Transactions = () => {
  const transactions = [
    {
      id: 'TXN_001',
      type: 'loan-funding',
      amount: 5000,
      status: 'completed',
      date: '2024-01-15',
      description: 'Funding for Business Expansion Loan',
      counterparty: 'John Smith',
    },
    {
      id: 'TXN_002',
      type: 'loan-repayment',
      amount: 1250,
      status: 'completed',
      date: '2024-01-10',
      description: 'Monthly payment for Restaurant Equipment Loan',
      counterparty: 'Maria Garcia',
    },
    {
      id: 'TXN_003',
      type: 'interest-payment',
      amount: 45,
      status: 'completed',
      date: '2024-01-05',
      description: 'Interest payment for Tech Startup Funding',
      counterparty: 'Alex Chen',
    },
    {
      id: 'TXN_004',
      type: 'loan-funding',
      amount: 8000,
      status: 'pending',
      date: '2024-01-20',
      description: 'Funding for Home Renovation Loan',
      counterparty: 'Sarah Johnson',
    },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'loan-funding':
        return 'text-green-600';
      case 'loan-repayment':
        return 'text-blue-600';
      case 'interest-payment':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-danger';
      default:
        return 'badge-gray';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'loan-funding':
        return 'Loan Funding';
      case 'loan-repayment':
        return 'Loan Repayment';
      case 'interest-payment':
        return 'Interest Payment';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View your transaction history and manage payments</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn btn-outline flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
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
              <p className="text-sm text-gray-600">Total Returns</p>
              <p className="text-2xl font-semibold text-gray-900">$1,308</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">$2,295</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">$8,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Counterparty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                      {getTypeLabel(transaction.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${transaction.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.counterparty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Transactions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select className="input">
              <option value="">All Types</option>
              <option value="loan-funding">Loan Funding</option>
              <option value="loan-repayment">Loan Repayment</option>
              <option value="interest-payment">Interest Payment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select className="input">
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">From Date</label>
            <input type="date" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input type="date" className="input" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary">Apply Filters</button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
