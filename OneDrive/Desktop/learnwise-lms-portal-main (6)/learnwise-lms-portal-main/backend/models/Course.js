
const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide module title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide module description']
  },
  contentType: {
    type: String,
    enum: ['video', 'text', 'pdf', 'quiz'],
    default: 'video'
  },
  content: {
    type: String, // URL for video/pdf or actual content for text
    required: [true, 'Please provide module content']
  },
  instructorNotes: {
    type: String, // URL to PDF notes from instructor
    default: null
  },
  duration: {
    type: Number,
    default: 0
  }, // in minutes
  order: {
    type: Number,
    default: 1
  },
  isPublished: {
    type: Boolean,
    default: false
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

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide course description']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please provide course category'],
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'UI/UX Design', 'Game Development', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Economics', 'Political Science', 'Indian Constitution', 'Data Structures', 'Other']
  },
  thumbnail: {
    type: String,
    default: 'default-course.jpg'
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  }, // Price in Indian Rupees (₹)
  currency: {
    type: String,
    default: 'INR'
  },
  mainVideo: {
    type: String, // URL or path to main course video
    default: null
  },
  modules: [ModuleSchema],
  duration: {
    type: Number,
    default: 0
  }, // total duration in minutes
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'archived'],
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
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
CourseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate average rating
CourseSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) return 0;
  
  const sum = this.reviews.reduce((total, review) => total + review.rating, 0);
  return sum / this.reviews.length;
};

module.exports = mongoose.model('Course', CourseSchema);
