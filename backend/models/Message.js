const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Participants
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  
  // Message Content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'loan-offer', 'loan-request', 'system'],
    default: 'text'
  },
  
  // Related Context
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: function() {
      return ['loan-offer', 'loan-request'].includes(this.messageType);
    }
  },
  
  // Message Status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Read Status
  readAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: Date.now
  },
  
  // Attachments
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Message Thread
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MessageThread',
    required: [true, 'Thread ID is required']
  },
  
  // Reply Information
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  
  // Message Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // System Messages
  systemMessage: {
    type: {
      type: String,
      enum: ['loan-approved', 'loan-rejected', 'payment-due', 'payment-received', 'loan-completed', 'loan-defaulted'],
      required: function() {
        return this.messageType === 'system';
      }
    },
    data: mongoose.Schema.Types.Mixed
  },
  
  // Message Actions (for interactive messages)
  actions: [{
    type: {
      type: String,
      enum: ['approve', 'reject', 'counter-offer', 'accept', 'decline'],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    data: mongoose.Schema.Types.Mixed,
    isExecuted: {
      type: Boolean,
      default: false
    },
    executedAt: {
      type: Date,
      default: null
    }
  }],
  
  // Message Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    location: {
      country: String,
      city: String
    }
  },
  
  // Deletion
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Message Thread Schema
const messageThreadSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    default: null
  },
  subject: {
    type: String,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  }
}, {
  timestamps: true
});

// Virtual for message age
messageSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for is unread
messageSchema.virtual('isUnread').get(function() {
  return this.status === 'delivered' && !this.readAt;
});

// Indexes for better query performance
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1 });
messageSchema.index({ threadId: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ messageType: 1 });
messageSchema.index({ loan: 1 });

messageThreadSchema.index({ participants: 1 });
messageThreadSchema.index({ loan: 1 });
messageThreadSchema.index({ lastMessageAt: -1 });
messageThreadSchema.index({ isActive: 1 });

// Pre-save middleware to update thread's last message
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Update thread's last message
    await MessageThread.findByIdAndUpdate(this.threadId, {
      lastMessage: this._id,
      lastMessageAt: this.createdAt
    });
  }
  next();
});

// Pre-save middleware to update read status
messageSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Static method to find messages between two users
messageSchema.statics.findBetweenUsers = function(user1Id, user2Id, limit = 50) {
  return this.find({
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id }
    ],
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'firstName lastName profileImage')
  .populate('recipient', 'firstName lastName profileImage');
};

// Static method to find messages in a thread
messageSchema.statics.findByThread = function(threadId, limit = 50) {
  return this.find({
    threadId: threadId,
    isDeleted: false
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('sender', 'firstName lastName profileImage')
  .populate('recipient', 'firstName lastName profileImage');
};

// Static method to mark messages as read
messageSchema.statics.markAsRead = function(threadId, userId) {
  return this.updateMany(
    {
      threadId: threadId,
      recipient: userId,
      status: 'delivered'
    },
    {
      $set: {
        status: 'read',
        readAt: new Date()
      }
    }
  );
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    status: 'delivered',
    readAt: null,
    isDeleted: false
  });
};

// MessageThread static methods
messageThreadSchema.statics.findByParticipants = function(participantIds) {
  return this.findOne({
    participants: { $all: participantIds },
    isActive: true
  });
};

messageThreadSchema.statics.findByUser = function(userId) {
  return this.find({
    participants: userId,
    isActive: true
  })
  .sort({ lastMessageAt: -1 })
  .populate('participants', 'firstName lastName profileImage')
  .populate('lastMessage')
  .populate('loan', 'title amount status');
};

// Instance method to add participant to thread
messageThreadSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    this.unreadCount.set(userId.toString(), 0);
  }
  return this.save();
};

// Instance method to remove participant from thread
messageThreadSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => id.toString() !== userId.toString());
  this.unreadCount.delete(userId.toString());
  return this.save();
};

// Instance method to update unread count
messageThreadSchema.methods.updateUnreadCount = function(userId, increment = 1) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + increment);
  return this.save();
};

// Instance method to reset unread count
messageThreadSchema.methods.resetUnreadCount = function(userId) {
  this.unreadCount.set(userId.toString(), 0);
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);
const MessageThread = mongoose.model('MessageThread', messageThreadSchema);

module.exports = { Message, MessageThread };
