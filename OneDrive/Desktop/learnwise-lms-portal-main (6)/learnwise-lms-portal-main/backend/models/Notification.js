
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide notification title'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Please provide notification message']
  },
  type: {
    type: String,
    enum: ['message', 'course', 'quiz', 'certificate', 'system', 'approval'],
    default: 'system'
  },
  readStatus: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Course', 'Quiz', 'Message', 'Certificate']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
NotificationSchema.index({ recipient: 1, readStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
