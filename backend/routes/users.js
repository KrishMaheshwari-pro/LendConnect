const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate, canModifyProfile, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/profile/:userId
 * @desc    Get user profile by ID
 * @access  Private
 */
router.get('/profile/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Return public profile for other users, full profile for own account
    const isOwnProfile = req.user._id.toString() === userId;
    const profileData = isOwnProfile ? user.getPublicProfile() : user.getPublicProfile();

    res.json({
      message: 'User profile retrieved successfully',
      user: profileData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Server error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/profile/:userId
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile/:userId', [
  authenticate,
  canModifyProfile,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters'),
  body('annualIncome')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Annual income must be a positive number'),
  body('employmentStatus')
    .optional()
    .isIn(['employed', 'self-employed', 'unemployed', 'retired', 'student'])
    .withMessage('Invalid employment status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.isActive;
    delete updateData.isVerified;
    delete updateData.verificationStatus;
    delete updateData.rating;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', [
  authenticate,
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Server error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/users/upload-document
 * @desc    Upload user document
 * @access  Private
 */
router.post('/upload-document', [
  authenticate,
  body('type')
    .isIn(['identity', 'address', 'income', 'employment', 'other'])
    .withMessage('Invalid document type'),
  body('fileName')
    .trim()
    .notEmpty()
    .withMessage('File name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, fileName, filePath } = req.body;

    // In a real application, you would handle file upload here
    // For now, we'll just add the document to the user's documents array
    const user = await User.findById(req.user._id);
    
    user.documents.push({
      type,
      fileName,
      filePath: filePath || `/uploads/documents/${req.user._id}/${fileName}`,
      status: 'pending'
    });

    await user.save();

    res.json({
      message: 'Document uploaded successfully',
      document: user.documents[user.documents.length - 1]
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      message: 'Server error uploading document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/documents
 * @desc    Get user documents
 * @access  Private
 */
router.get('/documents', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('documents');
    
    res.json({
      message: 'Documents retrieved successfully',
      documents: user.documents
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      message: 'Server error retrieving documents',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/users/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', [
  authenticate,
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notification preference must be boolean'),
  body('privacy.showProfile')
    .optional()
    .isBoolean()
    .withMessage('Show profile preference must be boolean'),
  body('privacy.showContact')
    .optional()
    .isBoolean()
    .withMessage('Show contact preference must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { notifications, privacy } = req.body;
    const updateData = {};

    if (notifications) {
      updateData['preferences.notifications'] = {
        ...req.user.preferences.notifications,
        ...notifications
      };
    }

    if (privacy) {
      updateData['preferences.privacy'] = {
        ...req.user.preferences.privacy,
        ...privacy
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      message: 'Server error updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/search
 * @desc    Search users (for lenders to find borrowers)
 * @access  Private
 */
router.get('/search', [
  authenticate,
  authorize('lender', 'both')
], async (req, res) => {
  try {
    const {
      role,
      city,
      state,
      minCreditScore,
      maxCreditScore,
      employmentStatus,
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    const query = { isActive: true };

    if (role) {
      query.role = role;
    }

    if (city || state) {
      query.$or = [];
      if (city) {
        query.$or.push({ 'address.city': new RegExp(city, 'i') });
      }
      if (state) {
        query.$or.push({ 'address.state': new RegExp(state, 'i') });
      }
    }

    if (minCreditScore || maxCreditScore) {
      query.creditScore = {};
      if (minCreditScore) {
        query.creditScore.$gte = parseInt(minCreditScore);
      }
      if (maxCreditScore) {
        query.creditScore.$lte = parseInt(maxCreditScore);
      }
    }

    if (employmentStatus) {
      query.employmentStatus = employmentStatus;
    }

    // Exclude current user
    query._id = { $ne: req.user._id };

    const users = await User.find(query)
      .select('-password -documents -preferences')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      message: 'Users retrieved successfully',
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      message: 'Server error searching users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const Loan = require('../models/Loan');
    const Transaction = require('../models/Transaction');

    const userId = req.user._id;

    // Get loan statistics
    const loanStats = await Loan.aggregate([
      { $match: { borrower: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get transaction statistics
    const transactionStats = await Transaction.aggregate([
      {
        $match: {
          $or: [{ from: userId }, { to: userId }],
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate balance
    const balance = await Transaction.calculateBalance(userId);

    res.json({
      message: 'User statistics retrieved successfully',
      stats: {
        loans: loanStats,
        transactions: transactionStats,
        balance
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Server error retrieving user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
