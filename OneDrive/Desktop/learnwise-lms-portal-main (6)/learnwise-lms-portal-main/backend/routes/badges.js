
const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Enrollment = require('../models/Enrollment');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/badges/user
// @desc    Get user's badges
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const userBadges = await UserBadge.find({ user: req.user.id })
      .populate('badge')
      .sort({ earnedAt: -1 });
    
    const allBadges = await Badge.find({ isActive: true });
    
    // Calculate progress for incomplete badges
    const badgesWithProgress = allBadges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badge._id.toString() === badge._id.toString());
      
      if (userBadge) {
        return {
          ...badge.toObject(),
          earned: true,
          earnedAt: userBadge.earnedAt,
          progress: userBadge.progress
        };
      }
      
      return {
        ...badge.toObject(),
        earned: false,
        progress: 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: badgesWithProgress
    });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/badges/check-progress
// @desc    Check and update badge progress
// @access  Private
router.post('/check-progress', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await Enrollment.find({ student: userId });
    
    // Get all active badges
    const badges = await Badge.find({ isActive: true });
    
    const newlyEarnedBadges = [];
    
    for (const badge of badges) {
      // Check if user already earned this badge
      const existingUserBadge = await UserBadge.findOne({ user: userId, badge: badge._id });
      if (existingUserBadge && existingUserBadge.isCompleted) continue;
      
      let progress = 0;
      let achieved = false;
      
      switch (badge.criteria) {
        case 'complete_2_modules_1_hour':
          // Count modules completed in last hour
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          const recentModules = enrollments.reduce((count, enrollment) => {
            return count + enrollment.completedModules.filter(module => 
              new Date(module.completedAt) > oneHourAgo
            ).length;
          }, 0);
          progress = Math.min(recentModules, badge.goal);
          achieved = recentModules >= badge.goal;
          break;
          
        case 'complete_course_fast':
          // Course completed in less than expected time
          const fastCompletions = enrollments.filter(enrollment => {
            if (enrollment.status !== 'completed') return false;
            const enrollTime = new Date(enrollment.enrolledAt);
            const completeTime = new Date(enrollment.completedAt);
            const daysTaken = (completeTime.getTime() - enrollTime.getTime()) / (1000 * 60 * 60 * 24);
            return daysTaken <= 7; // Completed within a week
          });
          progress = Math.min(fastCompletions.length, badge.goal);
          achieved = fastCompletions.length >= badge.goal;
          break;
          
        case 'complete_courses':
          const completedCourses = enrollments.filter(e => e.status === 'completed').length;
          progress = Math.min(completedCourses, badge.goal);
          achieved = completedCourses >= badge.goal;
          break;
          
        case 'quiz_perfect_score':
          // This would need quiz submission data
          progress = 0; // Placeholder
          achieved = false;
          break;
          
        case 'login_streak':
          // This would need login tracking
          progress = 0; // Placeholder
          achieved = false;
          break;
      }
      
      // Update or create user badge
      if (existingUserBadge) {
        existingUserBadge.progress = progress;
        if (achieved && !existingUserBadge.isCompleted) {
          existingUserBadge.isCompleted = true;
          existingUserBadge.earnedAt = new Date();
          newlyEarnedBadges.push(badge);
        }
        await existingUserBadge.save();
      } else if (progress > 0 || achieved) {
        const newUserBadge = await UserBadge.create({
          user: userId,
          badge: badge._id,
          progress,
          isCompleted: achieved
        });
        if (achieved) {
          newlyEarnedBadges.push(badge);
        }
      }
    }
    
    res.status(200).json({
      success: true,
      newlyEarned: newlyEarnedBadges
    });
  } catch (error) {
    console.error('Check badge progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/badges
// @desc    Create new badge
// @access  Private/Admin/Instructor
router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const badge = await Badge.create(req.body);
    
    res.status(201).json({
      success: true,
      data: badge
    });
  } catch (error) {
    console.error('Create badge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
