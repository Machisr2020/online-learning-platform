const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

// Helper function to create notification for admin
const createAdminNotification = async (course) => {
  try {
    const admins = await require('../models/User').find({ role: 'admin' });
    
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Course Approval Request',
        message: `Course "${course.title}" has been submitted for approval by instructor.`,
        type: 'approval',
        relatedTo: {
          model: 'Course',
          id: course._id
        }
      });
    }
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};

// @route   GET /api/courses/pending/approval
// @desc    Get all pending courses for admin approval
// @access  Private/Admin
router.get('/pending/approval', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingCourses = await Course.find({ status: 'pending' })
      .populate('instructor', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingCourses.length,
      data: pendingCourses
    });
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/courses/:id/approve
// @desc    Approve a course
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.status = 'published';
    course.isPublished = true;
    await course.save();

    // Create notification for instructor
    await Notification.create({
      recipient: course.instructor._id,
      title: 'Course Approved',
      message: `Your course "${course.title}" has been approved and is now live for students.`,
      type: 'approval',
      relatedTo: {
        model: 'Course',
        id: course._id
      }
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/courses/:id/reject
// @desc    Reject a course
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'firstName lastName');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.status = 'draft';
    course.isPublished = false;
    await course.save();

    // Create notification for instructor
    await Notification.create({
      recipient: course.instructor._id,
      title: 'Course Rejected',
      message: `Your course "${course.title}" has been rejected. Reason: ${reason || 'No reason provided'}`,
      type: 'approval',
      relatedTo: {
        model: 'Course',
        id: course._id
      }
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Reject course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/courses
// @desc    Get all published courses
// @access  Public
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' })
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/courses/instructor
// @desc    Get courses created by the logged-in instructor
// @access  Private/Instructor
router.get('/instructor', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate('instructor', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'firstName lastName');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private/Instructor
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    // Add user id to req.body
    req.body.instructor = req.user.id;
    
    // Set default status to pending for approval
    if (!req.body.status) {
      req.body.status = 'pending';
    }

    const course = await Course.create(req.body);
    
    // If course is created with pending status, notify admins
    if (course.status === 'pending') {
      await createAdminNotification(course);
    }
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private/Instructor
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this course'
      });
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Make sure user is course instructor
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this course'
      });
    }

    await course.remove();

    // Also delete all enrollments for this course
    await Enrollment.deleteMany({ course: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/courses/rating
// @desc    Submit course rating
// @access  Private/Student
router.post('/rating', protect, authorize('student'), async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if student is enrolled and completed the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: 'completed'
    });
    
    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'You must complete the course before rating it'
      });
    }
    
    // Check if already rated
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user.id.toString()
    );
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this course'
      });
    }
    
    // Add rating to course
    course.reviews.push({
      user: req.user.id,
      rating,
      comment,
      createdAt: new Date()
    });
    
    // Recalculate average rating
    course.rating = course.calculateRating();
    await course.save();
    
    // Mark enrollment as rated
    enrollment.rated = true;
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating: course.rating,
        totalReviews: course.reviews.length
      }
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
