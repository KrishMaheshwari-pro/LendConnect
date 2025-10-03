const express = require('express');
const { body, validationResult } = require('express-validator');
const { Message, MessageThread } = require('../models/Message');
const { authenticate, canAccessMessageThread } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/messages/threads
 * @desc    Get user's message threads
 * @access  Private
 */
router.get('/threads', authenticate, async (req, res) => {
  try {
    const threads = await MessageThread.findByUser(req.user._id);

    res.json({
      message: 'Message threads retrieved successfully',
      threads
    });

  } catch (error) {
    console.error('Get message threads error:', error);
    res.status(500).json({
      message: 'Server error retrieving message threads',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/messages/threads
 * @desc    Create a new message thread
 * @access  Private
 */
router.post('/threads', [
  authenticate,
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*')
    .isMongoId()
    .withMessage('Invalid participant ID'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  body('loanId')
    .optional()
    .isMongoId()
    .withMessage('Invalid loan ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participants, subject, loanId } = req.body;

    // Add current user to participants if not already included
    const allParticipants = [...new Set([req.user._id, ...participants])];

    // Check if thread already exists between these participants
    const existingThread = await MessageThread.findByParticipants(allParticipants);
    if (existingThread) {
      return res.json({
        message: 'Thread already exists',
        thread: existingThread
      });
    }

    // Create new thread
    const thread = new MessageThread({
      participants: allParticipants,
      subject,
      loan: loanId
    });

    await thread.save();

    res.status(201).json({
      message: 'Message thread created successfully',
      thread
    });

  } catch (error) {
    console.error('Create message thread error:', error);
    res.status(500).json({
      message: 'Server error creating message thread',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/threads/:threadId
 * @desc    Get messages in a thread
 * @access  Private
 */
router.get('/threads/:threadId', [
  authenticate,
  canAccessMessageThread
], async (req, res) => {
  try {
    const { threadId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.findByThread(threadId, limit * 1);

    // Mark messages as read
    await Message.markAsRead(threadId, req.user._id);

    res.json({
      message: 'Messages retrieved successfully',
      messages,
      thread: req.thread
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Server error retrieving messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/messages/threads/:threadId/messages
 * @desc    Send a message in a thread
 * @access  Private
 */
router.post('/threads/:threadId/messages', [
  authenticate,
  canAccessMessageThread,
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message content must be between 1 and 2000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file', 'loan-offer', 'loan-request', 'system'])
    .withMessage('Invalid message type'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid reply message ID'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { threadId } = req.params;
    const { content, messageType = 'text', replyTo, priority = 'normal' } = req.body;

    // Get other participants in the thread
    const otherParticipants = req.thread.participants.filter(
      participant => participant.toString() !== req.user._id.toString()
    );

    if (otherParticipants.length === 0) {
      return res.status(400).json({
        message: 'Cannot send message to yourself'
      });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      recipient: otherParticipants[0], // For simplicity, send to first other participant
      content,
      messageType,
      threadId,
      replyTo,
      priority,
      status: 'sent'
    });

    await message.save();

    // Update thread's last message
    req.thread.lastMessage = message._id;
    req.thread.lastMessageAt = message.createdAt;
    
    // Update unread count for other participants
    otherParticipants.forEach(participantId => {
      req.thread.updateUnreadCount(participantId.toString(), 1);
    });

    await req.thread.save();

    // Populate sender information
    await message.populate('sender', 'firstName lastName profileImage');

    res.status(201).json({
      message: 'Message sent successfully',
      message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Server error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get unread message count for user
 * @access  Private
 */
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user._id);

    res.json({
      message: 'Unread count retrieved successfully',
      unreadCount
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      message: 'Server error retrieving unread count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/messages/threads/:threadId/read
 * @desc    Mark thread messages as read
 * @access  Private
 */
router.post('/threads/:threadId/read', [
  authenticate,
  canAccessMessageThread
], async (req, res) => {
  try {
    const { threadId } = req.params;

    // Mark messages as read
    await Message.markAsRead(threadId, req.user._id);

    // Reset unread count for this user
    await req.thread.resetUnreadCount(req.user._id.toString());

    res.json({
      message: 'Messages marked as read successfully'
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      message: 'Server error marking messages as read',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/messages/:messageId/actions
 * @desc    Execute message action (for interactive messages)
 * @access  Private
 */
router.post('/:messageId/actions', [
  authenticate,
  body('actionType')
    .isIn(['approve', 'reject', 'counter-offer', 'accept', 'decline'])
    .withMessage('Invalid action type'),
  body('actionData')
    .optional()
    .isObject()
    .withMessage('Action data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { actionType, actionData } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the recipient can execute message actions'
      });
    }

    // Find the action
    const action = message.actions.find(a => a.type === actionType);
    if (!action) {
      return res.status(400).json({
        message: 'Action not found in message'
      });
    }

    if (action.isExecuted) {
      return res.status(400).json({
        message: 'Action has already been executed'
      });
    }

    // Execute the action
    action.isExecuted = true;
    action.executedAt = new Date();
    if (actionData) {
      action.data = { ...action.data, ...actionData };
    }

    await message.save();

    res.json({
      message: 'Action executed successfully',
      action
    });

  } catch (error) {
    console.error('Execute message action error:', error);
    res.status(500).json({
      message: 'Server error executing message action',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:messageId', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the sender can delete a message'
      });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user._id;

    await message.save();

    res.json({
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      message: 'Server error deleting message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/messages/search
 * @desc    Search messages
 * @access  Private
 */
router.get('/search', authenticate, async (req, res) => {
  try {
    const {
      query,
      messageType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    // Build search query
    const searchQuery = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id }
      ],
      isDeleted: false
    };

    if (query) {
      searchQuery.content = { $regex: query, $options: 'i' };
    }

    if (messageType) {
      searchQuery.messageType = messageType;
    }

    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) {
        searchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        searchQuery.createdAt.$lte = new Date(endDate);
      }
    }

    const messages = await Message.find(searchQuery)
      .populate('sender', 'firstName lastName profileImage')
      .populate('recipient', 'firstName lastName profileImage')
      .populate('threadId', 'subject')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(searchQuery);

    res.json({
      message: 'Messages retrieved successfully',
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      message: 'Server error searching messages',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
