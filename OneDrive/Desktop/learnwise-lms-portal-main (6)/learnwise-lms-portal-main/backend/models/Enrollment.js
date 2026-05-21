
const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  progress: {
    type: Number, // percentage
    default: 0
  },
  completedModules: [{
    module: {
      type: mongoose.Schema.Types.ObjectId
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  moduleNotes: [{
    module: {
      type: mongoose.Schema.Types.ObjectId
    },
    notes: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  certificate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Certificate'
  },
  rated: {
    type: Boolean,
    default: false
  },
  quizzesAttempted: {
    type: Number,
    default: 0
  }
});

// Method to update progress
EnrollmentSchema.methods.updateProgress = function(courseModulesCount) {
  if (courseModulesCount === 0) {
    this.progress = 0;
    return;
  }
  this.progress = (this.completedModules.length / courseModulesCount) * 100;
};

// Method to mark course as completed
EnrollmentSchema.methods.markAsCompleted = function() {
  if (this.progress === 100) {
    this.status = 'completed';
    this.completedAt = Date.now();
  }
};

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
