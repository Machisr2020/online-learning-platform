
const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/certificates
// @desc    Generate certificate for completed course
// @access  Private/Admin or Instructor
router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    // Check if enrollment exists and is completed
    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    if (enrollment.progress < 100 || enrollment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Course not completed, cannot issue certificate'
      });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      student: enrollment.student,
      course: enrollment.course
    });

    if (certificate) {
      return res.status(400).json({
        success: false,
        message: 'Certificate already issued for this course'
      });
    }

    // Create certificate
    certificate = await Certificate.create({
      student: enrollment.student,
      course: enrollment.course
    });

    // Update enrollment with certificate
    enrollment.certificate = certificate._id;
    await enrollment.save();

    res.status(201).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/certificates/student
// @desc    Get all certificates for a student
// @access  Private/Student
router.get('/student', protect, async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate({
        path: 'course',
        select: 'title description category instructor thumbnail',
        populate: {
          path: 'instructor',
          select: 'firstName lastName'
        }
      });
    
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/certificates/:id/verify
// @desc    Verify certificate by ID
// @access  Public
router.get('/:id/verify', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.id })
      .populate({
        path: 'student',
        select: 'firstName lastName'
      })
      .populate({
        path: 'course',
        select: 'title instructor',
        populate: {
          path: 'instructor',
          select: 'firstName lastName'
        }
      });
    
    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Invalid certificate ID'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        certificateId: certificate.certificateId,
        student: `${certificate.student.firstName} ${certificate.student.lastName}`,
        course: certificate.course.title,
        instructor: `${certificate.course.instructor.firstName} ${certificate.course.instructor.lastName}`,
        issuedAt: certificate.issuedAt,
        isValid: true
      }
    });
  } catch (error) {
    console.error('Certificate verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/certificates/auto-generate
// @desc    Auto-generate certificate when course is completed
// @access  Private
router.post('/auto-generate', protect, async (req, res) => {
  try {
    const { enrollmentId } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId);
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    // Only generate if course is completed and no certificate exists
    if (enrollment.progress === 100 && enrollment.status === 'completed') {
      const existingCertificate = await Certificate.findOne({
        student: enrollment.student,
        course: enrollment.course
      });

      if (!existingCertificate) {
        const certificate = await Certificate.create({
          student: enrollment.student,
          course: enrollment.course
        });

        enrollment.certificate = certificate._id;
        await enrollment.save();

        return res.status(201).json({
          success: true,
          data: certificate
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Certificate already exists or course not completed'
    });
  } catch (error) {
    console.error('Auto-generate certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
