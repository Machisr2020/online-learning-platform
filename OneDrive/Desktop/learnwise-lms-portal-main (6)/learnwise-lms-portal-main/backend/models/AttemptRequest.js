
const mongoose = require('mongoose');

const AttemptRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  used: {
    type: Boolean,
    default: false
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for better query performance
AttemptRequestSchema.index({ student: 1, quiz: 1 });
AttemptRequestSchema.index({ status: 1 });

module.exports = mongoose.model('AttemptRequest', AttemptRequestSchema);
