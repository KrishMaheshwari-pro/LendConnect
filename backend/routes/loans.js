const express = require('express');
const { body, validationResult } = require('express-validator');
const Loan = require('../models/Loan');
const Transaction = require('../models/Transaction');
const { authenticate, authorize, canAccessLoan } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/loans
 * @desc    Create a new loan request
 * @access  Private (Borrowers)
 */
router.post('/', [
  authenticate,
  authorize('borrower', 'both'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 100, max: 1000000 })
    .withMessage('Amount must be between $100 and $1,000,000'),
  body('interestRate')
    .isNumeric()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Interest rate must be between 0% and 50%'),
  body('tenure')
    .isNumeric()
    .isInt({ min: 1, max: 60 })
    .withMessage('Tenure must be between 1 and 60 months'),
  body('tenureUnit')
    .optional()
    .isIn(['months', 'years'])
    .withMessage('Tenure unit must be months or years'),
  body('purpose')
    .isIn([
      'personal', 'business', 'education', 'medical', 'home-improvement',
      'debt-consolidation', 'emergency', 'wedding', 'vacation', 'other'
    ])
    .withMessage('Invalid loan purpose'),
  body('category')
    .isIn(['unsecured', 'secured'])
    .withMessage('Category must be unsecured or secured'),
  body('collateral.type')
    .if(body('category').equals('secured'))
    .isIn(['real-estate', 'vehicle', 'equipment', 'jewelry', 'other'])
    .withMessage('Collateral type is required for secured loans'),
  body('collateral.description')
    .if(body('category').equals('secured'))
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Collateral description is required for secured loans'),
  body('collateral.value')
    .if(body('category').equals('secured'))
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Collateral value is required for secured loans')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const loanData = {
      ...req.body,
      borrower: req.user._id,
      status: 'draft'
    };

    const loan = new Loan(loanData);
    await loan.save();

    // Add to timeline
    loan.timeline.push({
      status: 'draft',
      note: 'Loan request created',
      updatedBy: req.user._id
    });

    await loan.save();

    res.status(201).json({
      message: 'Loan request created successfully',
      loan
    });

  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({
      message: 'Server error creating loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/loans
 * @desc    Get loans with filters
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      status,
      purpose,
      minAmount,
      maxAmount,
      minInterestRate,
      maxInterestRate,
      category,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'borrower') {
      // Borrowers can only see their own loans
      query.borrower = req.user._id;
    } else if (req.user.role === 'lender') {
      // Lenders can see loans they've funded or available loans
      query.$or = [
        { 'fundingProgress.fundedBy.lender': req.user._id },
        { status: { $in: ['pending', 'approved'] } }
      ];
    } else if (req.user.role === 'both') {
      // Users with both roles can see their own loans and available loans
      query.$or = [
        { borrower: req.user._id },
        { 'fundingProgress.fundedBy.lender': req.user._id },
        { status: { $in: ['pending', 'approved'] } }
      ];
    }

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (purpose) {
      query.purpose = purpose;
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }
    if (minInterestRate || maxInterestRate) {
      query.interestRate = {};
      if (minInterestRate) query.interestRate.$gte = parseFloat(minInterestRate);
      if (maxInterestRate) query.interestRate.$lte = parseFloat(maxInterestRate);
    }
    if (category) {
      query.category = category;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const loans = await Loan.find(query)
      .populate('borrower', 'firstName lastName email profileImage rating')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Loan.countDocuments(query);

    res.json({
      message: 'Loans retrieved successfully',
      loans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({
      message: 'Server error retrieving loans',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/loans/:id
 * @desc    Get loan by ID
 * @access  Private
 */
router.get('/:id', [authenticate, canAccessLoan], async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('borrower', 'firstName lastName email profileImage rating verificationStatus')
      .populate('fundingProgress.fundedBy.lender', 'firstName lastName email profileImage rating');

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    res.json({
      message: 'Loan retrieved successfully',
      loan
    });

  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({
      message: 'Server error retrieving loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/loans/:id
 * @desc    Update loan
 * @access  Private (Borrower only)
 */
router.put('/:id', [
  authenticate,
  authorize('borrower', 'both'),
  canAccessLoan,
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Only allow updates if loan is in draft status
    if (req.loan.status !== 'draft') {
      return res.status(400).json({
        message: 'Only draft loans can be updated'
      });
    }

    // Only borrower can update their loan
    if (req.loan.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the borrower can update this loan'
      });
    }

    const updateData = req.body;
    delete updateData.borrower;
    delete updateData.status;
    delete updateData.fundingProgress;

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('borrower', 'firstName lastName email profileImage rating');

    // Add to timeline
    loan.timeline.push({
      status: 'draft',
      note: 'Loan request updated',
      updatedBy: req.user._id
    });

    await loan.save();

    res.json({
      message: 'Loan updated successfully',
      loan
    });

  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({
      message: 'Server error updating loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/loans/:id/submit
 * @desc    Submit loan for approval
 * @access  Private (Borrower only)
 */
router.post('/:id/submit', [
  authenticate,
  authorize('borrower', 'both'),
  canAccessLoan
], async (req, res) => {
  try {
    // Only borrower can submit their loan
    if (req.loan.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the borrower can submit this loan'
      });
    }

    // Only draft loans can be submitted
    if (req.loan.status !== 'draft') {
      return res.status(400).json({
        message: 'Only draft loans can be submitted'
      });
    }

    // Update loan status
    req.loan.status = 'pending';
    req.loan.timeline.push({
      status: 'pending',
      note: 'Loan submitted for approval',
      updatedBy: req.user._id
    });

    await req.loan.save();

    res.json({
      message: 'Loan submitted successfully',
      loan: req.loan
    });

  } catch (error) {
    console.error('Submit loan error:', error);
    res.status(500).json({
      message: 'Server error submitting loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/loans/:id/fund
 * @desc    Fund a loan
 * @access  Private (Lenders only)
 */
router.post('/:id/fund', [
  authenticate,
  authorize('lender', 'both'),
  body('amount')
    .isNumeric()
    .isFloat({ min: 1 })
    .withMessage('Funding amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { amount } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    // Check if loan is available for funding
    if (!['pending', 'approved'].includes(loan.status)) {
      return res.status(400).json({
        message: 'Loan is not available for funding'
      });
    }

    // Check if user has already funded this loan
    const alreadyFunded = loan.fundingProgress.fundedBy.some(
      funding => funding.lender.toString() === req.user._id.toString()
    );

    if (alreadyFunded) {
      return res.status(400).json({
        message: 'You have already funded this loan'
      });
    }

    // Check if funding amount is valid
    const remainingAmount = loan.amount - loan.fundingProgress.fundedAmount;
    if (amount > remainingAmount) {
      return res.status(400).json({
        message: `Maximum funding amount is $${remainingAmount}`
      });
    }

    // Add funding
    loan.fundingProgress.fundedBy.push({
      lender: req.user._id,
      amount: parseFloat(amount)
    });

    loan.fundingProgress.fundedAmount += parseFloat(amount);
    loan.fundingProgress.fundedPercentage = (loan.fundingProgress.fundedAmount / loan.amount) * 100;

    // Check if fully funded
    if (loan.fundingProgress.fundedAmount >= loan.amount) {
      loan.status = 'funded';
      loan.timeline.push({
        status: 'funded',
        note: 'Loan fully funded',
        updatedBy: req.user._id
      });
    }

    loan.timeline.push({
      status: 'funded',
      note: `Loan funded with $${amount}`,
      updatedBy: req.user._id
    });

    await loan.save();

    // Create transaction record
    const transaction = new Transaction({
      from: req.user._id,
      to: loan.borrower,
      type: 'loan-funding',
      amount: parseFloat(amount),
      loan: loan._id,
      description: `Funding for loan: ${loan.title}`,
      status: 'completed'
    });

    await transaction.save();

    res.json({
      message: 'Loan funded successfully',
      loan,
      transaction
    });

  } catch (error) {
    console.error('Fund loan error:', error);
    res.status(500).json({
      message: 'Server error funding loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/loans/:id/approve
 * @desc    Approve a loan
 * @access  Private (Admin or system)
 */
router.post('/:id/approve', [
  authenticate,
  // In a real app, you'd have admin authorization here
], async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending loans can be approved'
      });
    }

    loan.status = 'approved';
    loan.timeline.push({
      status: 'approved',
      note: 'Loan approved by system',
      updatedBy: req.user._id
    });

    await loan.save();

    res.json({
      message: 'Loan approved successfully',
      loan
    });

  } catch (error) {
    console.error('Approve loan error:', error);
    res.status(500).json({
      message: 'Server error approving loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/loans/:id/reject
 * @desc    Reject a loan
 * @access  Private (Admin or system)
 */
router.post('/:id/reject', [
  authenticate,
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters')
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
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        message: 'Loan not found'
      });
    }

    if (!['pending', 'approved'].includes(loan.status)) {
      return res.status(400).json({
        message: 'Only pending or approved loans can be rejected'
      });
    }

    loan.status = 'rejected';
    loan.timeline.push({
      status: 'rejected',
      note: `Loan rejected: ${reason}`,
      updatedBy: req.user._id
    });

    await loan.save();

    res.json({
      message: 'Loan rejected successfully',
      loan
    });

  } catch (error) {
    console.error('Reject loan error:', error);
    res.status(500).json({
      message: 'Server error rejecting loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/loans/:id
 * @desc    Delete a loan (only if draft)
 * @access  Private (Borrower only)
 */
router.delete('/:id', [
  authenticate,
  authorize('borrower', 'both'),
  canAccessLoan
], async (req, res) => {
  try {
    // Only borrower can delete their loan
    if (req.loan.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the borrower can delete this loan'
      });
    }

    // Only draft loans can be deleted
    if (req.loan.status !== 'draft') {
      return res.status(400).json({
        message: 'Only draft loans can be deleted'
      });
    }

    await Loan.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Loan deleted successfully'
    });

  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({
      message: 'Server error deleting loan',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
