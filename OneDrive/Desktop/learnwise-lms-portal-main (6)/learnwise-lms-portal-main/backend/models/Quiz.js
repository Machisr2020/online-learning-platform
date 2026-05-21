
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    default: 'multiple-choice'
  },
  options: [String],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be String or Array of Strings for multiple correct options
    required: true
  },
  points: {
    type: Number,
    default: 1
  }
});

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide quiz title'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    default: null // Optional - can be associated with a specific module
  },
  description: {
    type: String
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  questions: [QuestionSchema],
  passScore: {
    type: Number, // percentage to pass
    default: 70
  },
  maxAttempts: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'pending'
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  showAfterModuleComplete: {
    type: Boolean,
    default: true // Quiz appears after completing associated module
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field
QuizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if quiz should be available to student
QuizSchema.methods.isAvailableToStudent = function(completedModules) {
  if (this.status !== 'published') return false;
  if (!this.showAfterModuleComplete) return true;
  if (!this.module) return true;
  
  return completedModules.includes(this.module.toString());
};

module.exports = mongoose.model('Quiz', QuizSchema);
