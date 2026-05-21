
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required']
  },
  messageType: {
    type: String,
    enum: ['text', 'media'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String, // image/jpeg, video/mp4, application/pdf, etc.
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, readStatus: 1 });

// Update readAt when marking as read
MessageSchema.pre('save', function(next) {
  if (this.isModified('readStatus') && this.readStatus === true && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
