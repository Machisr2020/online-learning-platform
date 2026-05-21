
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Submission = require('../models/Submission');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCertificates = await Certificate.countDocuments();
    
    // Get enrollment statistics by month (last 12 months)
    const enrollmentByMonth = await getEnrollmentByMonth();
    
    // Get course completion data
    const courseCompletionData = await getCourseCompletionData();
    
    // Get revenue data
    const revenueData = await getRevenueData();
    
    // Get course categories distribution
    const categoryDistribution = await getCategoryDistribution();
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          students: totalStudents,
          instructors: totalInstructors,
          courses: totalCourses,
          enrollments: totalEnrollments,
          certificates: totalCertificates
        },
        enrollmentByMonth,
        courseCompletionData,
        revenueData,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/analytics/instructor
// @desc    Get instructor analytics
// @access  Private/Instructor
router.get('/instructor', protect, authorize('instructor'), async (req, res) => {
  try {
    const instructorId = req.user.id;
    
    // Get counts for instructor's courses
    const totalCourses = await Course.countDocuments({ instructor: instructorId });
    const totalStudents = await Enrollment.distinct('student', { 
      course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') }
    }).then(students => students.length);
    
    const totalQuizzes = await Quiz.countDocuments({ 
      createdBy: instructorId 
    });
    
    const totalSubmissions = await Submission.countDocuments({
      quiz: { $in: await Quiz.find({ createdBy: instructorId }).distinct('_id') }
    });
    
    // Get course statistics
    const courseStats = await Course.find({ instructor: instructorId })
      .select('title enrollmentCount')
      .sort('-enrollmentCount')
      .limit(5);
    
    // Get recent enrollments
    const recentEnrollments = await Enrollment.find({
      course: { $in: await Course.find({ instructor: instructorId }).distinct('_id') }
    })
      .populate('student', 'firstName lastName')
      .populate('course', 'title')
      .sort('-enrolledAt')
      .limit(10);
    
    res.status(200).json({
      success: true,
      data: {
        counts: {
          courses: totalCourses,
          students: totalStudents,
          quizzes: totalQuizzes,
          submissions: totalSubmissions
        },
        courseStats,
        recentEnrollments
      }
    });
  } catch (error) {
    console.error('Get instructor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions for analytics data
async function getEnrollmentByMonth() {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Mock data for demonstration purposes
  // In a real app, this would be generated from the database
  return monthLabels.map((month, index) => {
    const adjustedIndex = (currentMonth + index + 1) % 12;
    const value = 65 + Math.floor(Math.random() * 10) + adjustedIndex * 15;
    return {
      name: month,
      students: value
    };
  });
}

async function getCourseCompletionData() {
  // Mock data for demonstration purposes
  return [
    { name: 'Web Dev', completed: 83, total: 100 },
    { name: 'JavaScript', completed: 65, total: 85 },
    { name: 'React', completed: 42, total: 60 },
    { name: 'UI/UX', completed: 55, total: 70 },
    { name: 'Python', completed: 35, total: 50 },
    { name: 'Data Science', completed: 28, total: 40 }
  ];
}

async function getRevenueData() {
  // Mock data for demonstration purposes
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return monthLabels.map((month, index) => {
    return {
      name: month,
      revenue: 4000 + (index * 500) + Math.floor(Math.random() * 300)
    };
  });
}

async function getCategoryDistribution() {
  // Mock data for demonstration purposes
  return [
    { name: 'Web Development', value: 40 },
    { name: 'Data Science', value: 25 },
    { name: 'UI/UX Design', value: 15 },
    { name: 'Mobile Development', value: 12 },
    { name: 'Game Development', value: 8 }
  ];
}

module.exports = router;
