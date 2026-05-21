const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private/Student
router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId
    });
    
    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });
    
    res.status(201).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/enrollments/student
// @desc    Get student's enrollments with full course data including modules
// @access  Private/Student
router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    console.log('Fetching enrollments for student:', req.user._id);
    
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title description thumbnail category level duration modules instructor enrollmentCount rating',
        populate: {
          path: 'instructor',
          select: 'firstName lastName'
        }
      })
      .lean();

    console.log(`Found ${enrollments.length} enrollments`);

    // Transform the data to include enrollment details with course data
    const transformedEnrollments = enrollments.map(enrollment => {
      const courseData = enrollment.course;
      
      // Ensure modules exist and have proper structure
      if (!courseData.modules || !Array.isArray(courseData.modules)) {
        console.warn(`Course ${courseData._id} has no modules or invalid module structure`);
        courseData.modules = [];
      }

      // Recalculate progress based on completed modules
      const totalModules = courseData.modules.length;
      const completedModulesCount = enrollment.completedModules ? enrollment.completedModules.length : 0;
      const calculatedProgress = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;
      
      // Update enrollment status based on progress
      let status = enrollment.status;
      if (calculatedProgress === 100 && status !== 'completed') {
        status = 'completed';
        // Update the enrollment in the database
        Enrollment.findByIdAndUpdate(enrollment._id, { 
          status: 'completed', 
          progress: 100,
          completedAt: enrollment.completedAt || new Date()
        }).exec();
      }

      console.log(`Course: ${courseData.title}, Modules: ${courseData.modules.length}, Progress: ${calculatedProgress}%`);
      
      return {
        _id: courseData._id,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        instructor: courseData.instructor,
        enrollmentCount: courseData.enrollmentCount,
        rating: courseData.rating,
        modules: courseData.modules,
        enrollmentId: enrollment._id,
        progress: calculatedProgress,
        status: status,
        enrolledAt: enrollment.enrolledAt,
        lastAccessed: enrollment.lastAccessed,
        completedAt: enrollment.completedAt,
        completedModules: enrollment.completedModules || [],
        rated: enrollment.rated || false
      };
    });
    
    console.log('Transformed enrollments:', transformedEnrollments.map(e => ({
      title: e.title,
      modulesCount: e.modules?.length || 0,
      progress: e.progress,
      status: e.status
    })));

    res.status(200).json({
      success: true,
      count: transformedEnrollments.length,
      data: transformedEnrollments
    });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/enrollments/course/:courseId
// @desc    Get enrollment by course ID for current student
// @access  Private/Student
router.get('/course/:courseId', protect, authorize('student'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    }).populate({
      path: 'course',
      populate: {
        path: 'instructor',
        select: 'firstName lastName'
      }
    });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Get enrollment by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/enrollments/:id/progress
// @desc    Update enrollment progress
// @access  Private/Student
router.put('/:id/progress', protect, authorize('student'), async (req, res) => {
  try {
    const { moduleId, completed } = req.body;
    
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Update completed modules - assuming completed is true when marking as complete
    const alreadyCompleted = enrollment.completedModules.some(
      module => module.module.toString() === moduleId
    );
    
    if (!alreadyCompleted) {
      enrollment.completedModules.push({ module: moduleId });
    }
    
    // Get course to calculate progress
    const course = await Course.findById(enrollment.course);
    if (course) {
      const totalModules = course.modules.length;
      const completedCount = enrollment.completedModules.length;
      enrollment.progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
      
      // Mark as completed if all modules are done
      if (enrollment.progress === 100) {
        enrollment.status = 'completed';
        if (!enrollment.completedAt) {
          enrollment.completedAt = new Date();
        }
      }
    }
    
    enrollment.lastAccessed = Date.now();
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/enrollments/:id/notes
// @desc    Save module notes
// @access  Private/Student
router.put('/:id/notes', protect, authorize('student'), async (req, res) => {
  try {
    const { moduleId, notes } = req.body;
    
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Find existing note or create new one
    const existingNoteIndex = enrollment.moduleNotes.findIndex(
      note => note.module.toString() === moduleId
    );
    
    if (existingNoteIndex >= 0) {
      enrollment.moduleNotes[existingNoteIndex].notes = notes;
      enrollment.moduleNotes[existingNoteIndex].updatedAt = Date.now();
    } else {
      enrollment.moduleNotes.push({
        module: moduleId,
        notes: notes
      });
    }
    
    enrollment.lastAccessed = Date.now();
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Save notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/enrollments/:id/notes/:moduleId
// @desc    Get module notes
// @access  Private/Student
router.get('/:id/notes/:moduleId', protect, authorize('student'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if student owns this enrollment
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const moduleNote = enrollment.moduleNotes.find(
      note => note.module.toString() === req.params.moduleId
    );
    
    res.status(200).json({
      success: true,
      data: moduleNote ? moduleNote.notes : ''
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
