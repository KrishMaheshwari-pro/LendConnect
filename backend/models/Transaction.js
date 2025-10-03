const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Identification
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  reference: {
    type: String,
    required: [true, 'Transaction reference is required'],
    unique: true
  },
  
  // Parties Involved
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Transaction Details
  type: {
    type: String,
    enum: [
      'loan-funding',      // Lender funding a loan
      'loan-repayment',    // Borrower repaying loan
      'interest-payment',  // Interest payment
      'late-fee',          // Late payment fee
      'refund',            // Refund transaction
      'penalty',           // Penalty fee
      'withdrawal',        // User withdrawal
      'deposit',           // User deposit
      'transfer'           // General transfer
    ],
    required: [true, 'Transaction type is required']
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  
  // Related Loan (if applicable)
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: function() {
      return ['loan-funding', 'loan-repayment', 'interest-payment', 'late-fee'].includes(this.type);
    }
  },
  installmentNumber: {
    type: Number,
    required: function() {
      return this.type === 'loan-repayment';
    }
  },
  
  // Payment Method
  paymentMethod: {
    type: {
      type: String,
      enum: ['bank-transfer', 'credit-card', 'debit-card', 'check', 'wallet', 'crypto'],
      required: [true, 'Payment method is required']
    },
    details: {
      bankName: String,
      accountLast4: String,
      cardLast4: String,
      walletAddress: String
    }
  },
  
  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Processing Information
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true
  },
  
  // External Payment Gateway
  gateway: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'square', 'internal'],
      default: 'internal'
    },
    gatewayTransactionId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  
  // Timestamps
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // Additional Information
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  
  // Audit Trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'processed', 'completed', 'failed', 'cancelled', 'refunded'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String,
    previousStatus: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for transaction duration
transactionSchema.virtual('duration').get(function() {
  if (this.completedAt && this.createdAt) {
    return this.completedAt - this.createdAt;
  }
  return null;
});

// Virtual for is successful
transactionSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

// Indexes for better query performance
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ reference: 1 });
transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ loan: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'gateway.gatewayTransactionId': 1 });

// Pre-save middleware to generate transaction ID and reference
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate unique transaction ID
    this.transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate unique reference
    this.reference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Calculate net amount
    this.netAmount = this.amount - this.processingFee;
    
    // Add initial audit trail entry
    this.auditTrail.push({
      action: 'created',
      details: 'Transaction created',
      previousStatus: null
    });
  }
  next();
});

// Pre-save middleware to update audit trail on status changes
transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    const previousStatus = this.constructor.findById(this._id).select('status');
    this.auditTrail.push({
      action: 'updated',
      details: `Status changed from ${previousStatus} to ${this.status}`,
      previousStatus: previousStatus
    });
  }
  next();
});

// Static method to find transactions by user
transactionSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [{ from: userId }, { to: userId }]
  }).sort({ createdAt: -1 });
};

// Static method to find transactions by loan
transactionSchema.statics.findByLoan = function(loanId) {
  return this.find({ loan: loanId }).sort({ createdAt: -1 });
};

// Static method to find transactions by type
transactionSchema.statics.findByType = function(type) {
  return this.find({ type }).sort({ createdAt: -1 });
};

// Static method to calculate user balance
transactionSchema.statics.calculateBalance = async function(userId) {
  const transactions = await this.find({
    $or: [{ from: userId }, { to: userId }],
    status: 'completed'
  });
  
  let balance = 0;
  transactions.forEach(transaction => {
    if (transaction.to.toString() === userId.toString()) {
      balance += transaction.netAmount;
    } else {
      balance -= transaction.netAmount;
    }
  });
  
  return balance;
};

// Instance method to update status
transactionSchema.methods.updateStatus = function(newStatus, performedBy, details) {
  const previousStatus = this.status;
  this.status = newStatus;
  
  if (newStatus === 'completed') {
    this.completedAt = new Date();
  }
  
  this.auditTrail.push({
    action: 'updated',
    details: details || `Status updated to ${newStatus}`,
    previousStatus: previousStatus,
    performedBy: performedBy
  });
  
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema);
