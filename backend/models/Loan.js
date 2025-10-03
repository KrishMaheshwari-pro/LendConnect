const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  // Basic Loan Information
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Borrower is required']
  },
  title: {
    type: String,
    required: [true, 'Loan title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Loan description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: [true, 'Loan amount is required'],
    min: [100, 'Minimum loan amount is $100'],
    max: [1000000, 'Maximum loan amount is $1,000,000']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative'],
    max: [50, 'Interest rate cannot exceed 50%']
  },
  tenure: {
    type: Number,
    required: [true, 'Loan tenure is required'],
    min: [1, 'Minimum tenure is 1 month'],
    max: [60, 'Maximum tenure is 60 months']
  },
  tenureUnit: {
    type: String,
    enum: ['months', 'years'],
    default: 'months'
  },
  
  // Loan Status and Progress
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'funded', 'active', 'completed', 'defaulted', 'cancelled'],
    default: 'draft'
  },
  fundingProgress: {
    fundedAmount: { type: Number, default: 0 },
    fundedPercentage: { type: Number, default: 0 },
    fundedBy: [{
      lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      amount: { type: Number, required: true },
      fundedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Purpose and Category
  purpose: {
    type: String,
    required: [true, 'Loan purpose is required'],
    enum: [
      'personal', 'business', 'education', 'medical', 'home-improvement',
      'debt-consolidation', 'emergency', 'wedding', 'vacation', 'other'
    ]
  },
  category: {
    type: String,
    enum: ['unsecured', 'secured'],
    default: 'unsecured'
  },
  
  // Collateral (for secured loans)
  collateral: {
    type: {
      type: String,
      enum: ['real-estate', 'vehicle', 'equipment', 'jewelry', 'other'],
      required: function() { return this.category === 'secured'; }
    },
    description: {
      type: String,
      required: function() { return this.category === 'secured'; }
    },
    value: {
      type: Number,
      required: function() { return this.category === 'secured'; }
    },
    documents: [{
      fileName: String,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Repayment Schedule
  repaymentSchedule: [{
    installmentNumber: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    principalAmount: { type: Number, required: true },
    interestAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paidAt: { type: Date, default: null },
    lateFee: { type: Number, default: 0 }
  }],
  
  // Payment Tracking
  payments: [{
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ['bank-transfer', 'credit-card', 'debit-card', 'check', 'other'],
      required: true
    },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    installmentNumber: { type: Number, required: true }
  }],
  
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  riskFactors: [{
    factor: { type: String, required: true },
    impact: { type: String, enum: ['low', 'medium', 'high'], required: true },
    description: { type: String, required: true }
  }],
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['income-proof', 'identity', 'address', 'employment', 'bank-statement', 'other'],
      required: true
    },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Timeline
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  // Reviews and Ratings
  reviews: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Auto-calculated fields
  monthlyPayment: {
    type: Number,
    default: function() {
      if (this.amount && this.interestRate && this.tenure) {
        const monthlyRate = this.interestRate / 100 / 12;
        const totalMonths = this.tenureUnit === 'years' ? this.tenure * 12 : this.tenure;
        return (this.amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
               (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }
      return 0;
    }
  },
  totalAmount: {
    type: Number,
    default: function() {
      return this.monthlyPayment * (this.tenureUnit === 'years' ? this.tenure * 12 : this.tenure);
    }
  },
  totalInterest: {
    type: Number,
    default: function() {
      return this.totalAmount - this.amount;
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for remaining amount
loanSchema.virtual('remainingAmount').get(function() {
  return this.amount - this.fundingProgress.fundedAmount;
});

// Virtual for days until funding deadline
loanSchema.virtual('daysUntilDeadline').get(function() {
  if (this.fundingDeadline) {
    const now = new Date();
    const deadline = new Date(this.fundingDeadline);
    const diffTime = deadline - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Indexes for better query performance
loanSchema.index({ borrower: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ amount: 1 });
loanSchema.index({ interestRate: 1 });
loanSchema.index({ purpose: 1 });
loanSchema.index({ createdAt: -1 });
loanSchema.index({ 'fundingProgress.fundedBy.lender': 1 });

// Pre-save middleware to calculate monthly payment
loanSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('interestRate') || this.isModified('tenure')) {
    const monthlyRate = this.interestRate / 100 / 12;
    const totalMonths = this.tenureUnit === 'years' ? this.tenure * 12 : this.tenure;
    this.monthlyPayment = (this.amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                         (Math.pow(1 + monthlyRate, totalMonths) - 1);
    this.totalAmount = this.monthlyPayment * totalMonths;
    this.totalInterest = this.totalAmount - this.amount;
  }
  next();
});

// Static method to find loans by status
loanSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('borrower', 'firstName lastName email');
};

// Static method to find loans by borrower
loanSchema.statics.findByBorrower = function(borrowerId) {
  return this.find({ borrower: borrowerId }).sort({ createdAt: -1 });
};

// Static method to find loans by lender
loanSchema.statics.findByLender = function(lenderId) {
  return this.find({ 'fundingProgress.fundedBy.lender': lenderId }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Loan', loanSchema);
