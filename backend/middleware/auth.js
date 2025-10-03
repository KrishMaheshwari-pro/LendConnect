const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token is valid but user no longer exists.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact support.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired. Please login again.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during authentication.' 
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is verified
 */
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required.' 
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({ 
      message: 'Account verification required. Please verify your account to access this feature.' 
    });
  }

  next();
};

/**
 * Middleware to check if user can access loan
 */
const canAccessLoan = async (req, res, next) => {
  try {
    const loanId = req.params.loanId || req.params.id;
    
    if (!loanId) {
      return res.status(400).json({ 
        message: 'Loan ID is required.' 
      });
    }

    const Loan = require('../models/Loan');
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found.' 
      });
    }

    // Check if user is borrower, lender, or admin
    const isBorrower = loan.borrower.toString() === req.user._id.toString();
    const isLender = loan.fundingProgress.fundedBy.some(
      funding => funding.lender.toString() === req.user._id.toString()
    );
    const isAdmin = req.user.role === 'admin'; // Assuming admin role exists

    if (!isBorrower && !isLender && !isAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. You are not authorized to view this loan.' 
      });
    }

    req.loan = loan;
    next();
  } catch (error) {
    console.error('Loan access middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during loan access check.' 
    });
  }
};

/**
 * Middleware to check if user can access message thread
 */
const canAccessMessageThread = async (req, res, next) => {
  try {
    const threadId = req.params.threadId || req.params.id;
    
    if (!threadId) {
      return res.status(400).json({ 
        message: 'Thread ID is required.' 
      });
    }

    const { MessageThread } = require('../models/Message');
    const thread = await MessageThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ 
        message: 'Message thread not found.' 
      });
    }

    // Check if user is participant in the thread
    const isParticipant = thread.participants.some(
      participant => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a participant in this conversation.' 
      });
    }

    req.thread = thread;
    next();
  } catch (error) {
    console.error('Message thread access middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during message thread access check.' 
    });
  }
};

/**
 * Middleware to check if user can modify their own profile
 */
const canModifyProfile = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (!userId) {
    return res.status(400).json({ 
      message: 'User ID is required.' 
    });
  }

  if (req.user._id.toString() !== userId.toString()) {
    return res.status(403).json({ 
      message: 'Access denied. You can only modify your own profile.' 
    });
  }

  next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Don't fail on optional auth errors
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireVerification,
  canAccessLoan,
  canAccessMessageThread,
  canModifyProfile,
  optionalAuth
};
