
const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'award'
  },
  color: {
    type: String,
    default: 'purple'
  },
  criteria: {
    type: String,
    required: true // e.g., 'complete_2_modules_1_hour', 'complete_course_fast', 'login_streak_7'
  },
  goal: {
    type: Number,
    required: true // The target number to achieve
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Badge', BadgeSchema);
