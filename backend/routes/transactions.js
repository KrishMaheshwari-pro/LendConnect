const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/transactions
 * @desc    Get user transactions
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      type,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      $or: [{ from: req.user._id }, { to: req.user._id }]
    };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transactions = await Transaction.find(query)
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('loan', 'title amount')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      message: 'Transactions retrieved successfully',
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      message: 'Server error retrieving transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('loan', 'title amount status');

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in this transaction
    const isInvolved = transaction.from.toString() === req.user._id.toString() ||
                      transaction.to.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({
        message: 'Access denied. You are not authorized to view this transaction.'
      });
    }

    res.json({
      message: 'Transaction retrieved successfully',
      transaction
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      message: 'Server error retrieving transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/transactions/balance
 * @desc    Get user balance
 * @access  Private
 */
router.get('/balance', authenticate, async (req, res) => {
  try {
    const balance = await Transaction.calculateBalance(req.user._id);

    res.json({
      message: 'Balance retrieved successfully',
      balance
    });

  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({
      message: 'Server error retrieving balance',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/transactions/stats
 * @desc    Get transaction statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      groupBy = 'type'
    } = req.query;

    // Build match query
    const matchQuery = {
      $or: [{ from: req.user._id }, { to: req.user._id }],
      status: 'completed'
    };

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) {
        matchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const stats = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get total summary
    const summary = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' }
        }
      }
    ]);

    res.json({
      message: 'Transaction statistics retrieved successfully',
      stats,
      summary: summary[0] || {
        totalTransactions: 0,
        totalAmount: 0,
        averageAmount: 0
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving transaction statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/transactions/repay
 * @desc    Create loan repayment transaction
 * @access  Private (Borrowers)
 */
router.post('/repay', [
  authenticate,
  body('loanId')
    .isMongoId()
    .withMessage('Valid loan ID is required'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('paymentMethod')
    .isIn(['bank-transfer', 'credit-card', 'debit-card', 'check', 'other'])
    .withMessage('Invalid payment method'),
  body('installmentNumber')
    .isInt({ min: 1 })
    .withMessage('Installment number must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { loanId, amount, paymentMethod, installmentNumber } = req.body;

    // Get loan details
    const Loan = require('../models/Loan');
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    // Check if user is the borrower
    if (loan.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the borrower can make repayments'
      });
    }

    // Check if loan is active
    if (loan.status !== 'active') {
      return res.status(400).json({
        message: 'Loan is not active'
      });
    }

    // Create repayment transaction
    const transaction = new Transaction({
      from: req.user._id,
      to: loan.fundingProgress.fundedBy[0].lender, // Assuming single lender for simplicity
      type: 'loan-repayment',
      amount: parseFloat(amount),
      loan: loanId,
      installmentNumber: parseInt(installmentNumber),
      paymentMethod: {
        type: paymentMethod
      },
      description: `Repayment for loan: ${loan.title}`,
      status: 'pending'
    });

    await transaction.save();

    res.status(201).json({
      message: 'Repayment transaction created successfully',
      transaction
    });

  } catch (error) {
    console.error('Create repayment error:', error);
    res.status(500).json({
      message: 'Server error creating repayment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/transactions/:id/complete
 * @desc    Mark transaction as completed
 * @access  Private
 */
router.post('/:id/complete', [
  authenticate,
  body('gatewayTransactionId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Gateway transaction ID is required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { gatewayTransactionId } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in this transaction
    const isInvolved = transaction.from.toString() === req.user._id.toString() ||
                      transaction.to.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({
        message: 'Access denied. You are not authorized to complete this transaction.'
      });
    }

    // Update transaction status
    await transaction.updateStatus('completed', req.user._id, 'Transaction completed');

    if (gatewayTransactionId) {
      transaction.gateway.gatewayTransactionId = gatewayTransactionId;
      await transaction.save();
    }

    res.json({
      message: 'Transaction completed successfully',
      transaction
    });

  } catch (error) {
    console.error('Complete transaction error:', error);
    res.status(500).json({
      message: 'Server error completing transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/transactions/:id/cancel
 * @desc    Cancel a transaction
 * @access  Private
 */
router.post('/:id/cancel', [
  authenticate,
  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Cancellation reason must be between 5 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check if user is involved in this transaction
    const isInvolved = transaction.from.toString() === req.user._id.toString() ||
                      transaction.to.toString() === req.user._id.toString();

    if (!isInvolved) {
      return res.status(403).json({
        message: 'Access denied. You are not authorized to cancel this transaction.'
      });
    }

    // Check if transaction can be cancelled
    if (!['pending', 'processing'].includes(transaction.status)) {
      return res.status(400).json({
        message: 'Only pending or processing transactions can be cancelled'
      });
    }

    // Update transaction status
    await transaction.updateStatus('cancelled', req.user._id, `Transaction cancelled: ${reason}`);

    res.json({
      message: 'Transaction cancelled successfully',
      transaction
    });

  } catch (error) {
    console.error('Cancel transaction error:', error);
    res.status(500).json({
      message: 'Server error cancelling transaction',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
