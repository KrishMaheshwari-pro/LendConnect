import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, DollarSign, Calendar, FileText } from 'lucide-react';

const CreateLoan = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log('Loan data:', data);
    // Handle loan creation
  };

  const loanAmount = watch('amount');
  const interestRate = watch('interestRate');
  const tenure = watch('tenure');

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    if (loanAmount && interestRate && tenure) {
      const monthlyRate = interestRate / 100 / 12;
      const totalMonths = tenure;
      return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
             (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }
    return 0;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalAmount = monthlyPayment * tenure;
  const totalInterest = totalAmount - loanAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Loan Request</h1>
          <p className="text-gray-600">Fill out the form below to apply for a loan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Loan Title
                  </label>
                  <input
                    {...register('title', { required: 'Loan title is required' })}
                    type="text"
                    className={`input ${errors.title ? 'input-error' : ''}`}
                    placeholder="e.g., Business Expansion Loan"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={4}
                    className={`input ${errors.description ? 'input-error' : ''}`}
                    placeholder="Describe how you plan to use the loan funds..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                    Loan Purpose
                  </label>
                  <select
                    {...register('purpose', { required: 'Purpose is required' })}
                    className={`input ${errors.purpose ? 'input-error' : ''}`}
                  >
                    <option value="">Select purpose</option>
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                    <option value="medical">Medical</option>
                    <option value="home-improvement">Home Improvement</option>
                    <option value="debt-consolidation">Debt Consolidation</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.purpose && (
                    <p className="mt-1 text-sm text-red-600">{errors.purpose.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('amount', { 
                        required: 'Amount is required',
                        min: { value: 100, message: 'Minimum amount is $100' },
                        max: { value: 1000000, message: 'Maximum amount is $1,000,000' }
                      })}
                      type="number"
                      className={`input pl-10 ${errors.amount ? 'input-error' : ''}`}
                      placeholder="25000"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                    Interest Rate (%)
                  </label>
                  <input
                    {...register('interestRate', { 
                      required: 'Interest rate is required',
                      min: { value: 0, message: 'Rate must be positive' },
                      max: { value: 50, message: 'Rate cannot exceed 50%' }
                    })}
                    type="number"
                    step="0.1"
                    className={`input ${errors.interestRate ? 'input-error' : ''}`}
                    placeholder="8.5"
                  />
                  {errors.interestRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.interestRate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="tenure" className="block text-sm font-medium text-gray-700">
                    Loan Term (Months)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('tenure', { 
                        required: 'Term is required',
                        min: { value: 1, message: 'Minimum term is 1 month' },
                        max: { value: 60, message: 'Maximum term is 60 months' }
                      })}
                      type="number"
                      className={`input pl-10 ${errors.tenure ? 'input-error' : ''}`}
                      placeholder="24"
                    />
                  </div>
                  {errors.tenure && (
                    <p className="mt-1 text-sm text-red-600">{errors.tenure.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Loan Category
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`input ${errors.category ? 'input-error' : ''}`}
                  >
                    <option value="">Select category</option>
                    <option value="unsecured">Unsecured</option>
                    <option value="secured">Secured</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Collateral Information (if secured) */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Collateral Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="collateralType" className="block text-sm font-medium text-gray-700">
                    Collateral Type
                  </label>
                  <select
                    {...register('collateralType')}
                    className="input"
                  >
                    <option value="">Select collateral type</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="equipment">Equipment</option>
                    <option value="jewelry">Jewelry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="collateralDescription" className="block text-sm font-medium text-gray-700">
                    Collateral Description
                  </label>
                  <textarea
                    {...register('collateralDescription')}
                    rows={3}
                    className="input"
                    placeholder="Describe your collateral..."
                  />
                </div>

                <div>
                  <label htmlFor="collateralValue" className="block text-sm font-medium text-gray-700">
                    Collateral Value
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('collateralValue')}
                      type="number"
                      className="input pl-10"
                      placeholder="50000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Loan Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loan Amount</span>
                  <span className="font-semibold">${loanAmount?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-semibold">{interestRate || '0'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Term</span>
                  <span className="font-semibold">{tenure || '0'} months</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Payment</span>
                    <span className="font-semibold text-lg">${monthlyPayment.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-semibold">${totalInterest.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Income Proof</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Identity Document</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Address Proof</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-600">Bank Statements</span>
                </div>
              </div>
              <button
                type="button"
                className="w-full mt-4 btn btn-outline"
              >
                Upload Documents
              </button>
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full btn btn-primary"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  className="w-full btn btn-outline"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateLoan;
