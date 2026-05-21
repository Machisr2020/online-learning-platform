
const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const AttemptRequest = require('../models/AttemptRequest');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

// Submission model inline
const SubmissionSchema = new mongoose.Schema({
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
  answers: [{
    questionId: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: Number // in seconds
});
const Submission = mongoose.model('Submission', SubmissionSchema);

// AttemptRequest Schema
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
    required: true
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
});
const AttemptRequest = mongoose.model('AttemptRequest', AttemptRequestSchema);

// @route   POST /api/submissions
// @desc    Submit quiz
// @access  Private/Student
router.post('/', protect, async (req, res) => {
  try {
    const { quizId, answers, timeSpent } = req.body;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Check current attempts
    const currentAttempts = await Submission.countDocuments({ 
      student: req.user.id, 
      quiz: quizId 
    });

    // Check approved and unused extra attempts
    const approvedExtraAttempts = await AttemptRequest.countDocuments({ 
      student: req.user.id, 
      quiz: quizId, 
      status: 'approved', 
      used: false 
    });

    const totalAllowedAttempts = quiz.maxAttempts + approvedExtraAttempts;

    // Strict attempt checking - must have available attempts
    if (currentAttempts >= totalAllowedAttempts) {
      return res.status(400).json({
        success: false,
        message: `No attempts remaining. You have used ${currentAttempts} out of ${totalAllowedAttempts} allowed attempts.`
      });
    }

    // Calculate score
    let score = 0;
    const maxScore = quiz.questions.reduce((total, question) => total + question.points, 0);
    
    answers.forEach(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) return;
      
      let isCorrect = false;
      
      if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
        isCorrect = answer.answer === question.correctAnswer;
      } else if (question.questionType === 'short-answer') {
        isCorrect = answer.answer.toLowerCase() === question.correctAnswer.toLowerCase();
      }
      
      if (isCorrect) {
        score += question.points;
      }
    });

    const percentage = (score / maxScore) * 100;
    const passed = percentage >= quiz.passScore;

    // Create submission
    const submission = await Submission.create({
      student: req.user.id,
      quiz: quizId,
      answers,
      score,
      maxScore,
      passed,
      timeSpent
    });

    // If this was an extra attempt, mark it as used
    if (currentAttempts >= quiz.maxAttempts) {
      await AttemptRequest.findOneAndUpdate(
        { 
          student: req.user.id, 
          quiz: quizId, 
          status: 'approved', 
          used: false 
        },
        { used: true }
      );
    }

    res.status(201).json({
      success: true,
      data: {
        score,
        maxScore,
        percentage,
        passed,
        submissionId: submission._id
      }
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/submissions/student
// @desc    Get all submissions for a student
// @access  Private/Student
router.get('/student', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user.id })
      .populate({
        path: 'quiz',
        select: 'title course timeLimit',
        populate: {
          path: 'course',
          select: 'title'
        }
      })
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/submissions/:id
// @desc    Get submission by ID
// @access  Private/Student
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'quiz',
        select: 'title course timeLimit passScore maxAttempts questions',
        populate: {
          path: 'course',
          select: 'title _id'
        }
      });
      
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    if (submission.student.toString() !== req.user.id.toString()) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this submission'
        });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/submissions/quiz/:quizId
// @desc    Get all submissions for a quiz
// @access  Private/Instructor
router.get('/quiz/:quizId', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }

    const submissions = await Submission.find({ quiz: req.params.quizId })
      .populate({
        path: 'student',
        select: 'firstName lastName email'
      })
      .sort({ submittedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    console.error('Get quiz submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/submissions/quiz/:quizId/attempts
// @desc    Get user's attempt count for a quiz
// @access  Private/Student
router.get('/quiz/:quizId/attempts', protect, async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const attempts = await Submission.countDocuments({
            student: studentId,
            quiz: quizId
        });

        res.status(200).json({
            success: true,
            count: attempts
        });

    } catch (error) {
        console.error('Get quiz attempts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/submissions/quiz/:quizId/available-attempts
// @desc    Get user's available attempts for a quiz
// @access  Private/Student
router.get('/quiz/:quizId/available-attempts', protect, async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        const submissionsCount = await Submission.countDocuments({
            student: studentId,
            quiz: quizId
        });
        
        const approvedExtraAttempts = await AttemptRequest.countDocuments({ 
            student: studentId, 
            quiz: quizId, 
            status: 'approved', 
            used: false 
        });

        const totalAllowedAttempts = quiz.maxAttempts + approvedExtraAttempts;
        const availableAttempts = Math.max(0, totalAllowedAttempts - submissionsCount);

        res.status(200).json({
            success: true,
            data: {
                availableAttempts,
                totalAllowedAttempts,
                submissionsCount,
                baseAttempts: quiz.maxAttempts,
                extraAttempts: approvedExtraAttempts
            }
        });
    } catch (error) {
        console.error('Get available quiz attempts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/submissions/quiz/:quizId/pending-request
// @desc    Check if student has a pending request for a quiz
// @access  Private/Student
router.get('/quiz/:quizId/pending-request', protect, async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        console.log('[PENDING REQUEST CHECK] Checking for student:', studentId, 'quiz:', quizId);

        const pendingRequest = await AttemptRequest.findOne({ 
            student: studentId, 
            quiz: quizId, 
            status: 'pending' 
        });

        console.log('[PENDING REQUEST CHECK] Found request:', pendingRequest ? pendingRequest._id : 'none');

        res.status(200).json({
            success: true,
            data: {
                hasPendingRequest: !!pendingRequest,
                request: pendingRequest
            }
        });
    } catch (error) {
        console.error('[PENDING REQUEST CHECK] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/submissions/available-attempts-batch
// @desc    Get available attempts for a batch of quizzes
// @access  Private/Student
router.post('/available-attempts-batch', protect, async (req, res) => {
    try {
        const { quizIds } = req.body;
        const studentId = req.user.id;

        if (!Array.isArray(quizIds) || quizIds.length === 0) {
            return res.status(200).json({ success: true, data: {} });
        }

        const quizIdObjects = quizIds.map(id => new mongoose.Types.ObjectId(id));
        const quizzes = await Quiz.find({ '_id': { $in: quizIdObjects } }).select('maxAttempts');
        
        const submissions = await Submission.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId), quiz: { $in: quizIdObjects } } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);
        
        const extraAttempts = await AttemptRequest.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId), quiz: { $in: quizIdObjects }, status: 'approved', used: false } },
            { $group: { _id: '$quiz', count: { $sum: 1 } } }
        ]);

        const submissionsMap = submissions.reduce((acc, sub) => {
            acc[sub._id.toString()] = sub.count;
            return acc;
        }, {});

        const extraAttemptsMap = extraAttempts.reduce((acc, att) => {
            acc[att._id.toString()] = att.count;
            return acc;
        }, {});

        const result = quizzes.reduce((acc, quiz) => {
            const quizId = quiz._id.toString();
            const totalAllowed = quiz.maxAttempts + (extraAttemptsMap[quizId] || 0);
            const subsCount = submissionsMap[quizId] || 0;
            acc[quizId] = {
                availableAttempts: Math.max(0, totalAllowed - subsCount)
            };
            return acc;
        });
        
        res.status(200).json({ success: true, data: result });

    } catch (error) {
        console.error('Batch available attempts error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/submissions/request-extra-attempt
// @desc    Request an extra attempt for a quiz
// @access  Private/Student
router.post('/request-extra-attempt', protect, async (req, res) => {
    try {
        const { quizId, reason } = req.body;
        const studentId = req.user.id;

        console.log('[EXTRA ATTEMPT REQUEST] Received:', { quizId, reason, studentId });

        // Basic validation
        if (!quizId || !reason) {
            console.log('[EXTRA ATTEMPT REQUEST] Missing required fields');
            return res.status(400).json({ 
                success: false, 
                message: 'Quiz ID and reason are required' 
            });
        }

        // Trim and validate
        const trimmedQuizId = String(quizId).trim();
        const trimmedReason = String(reason).trim();

        if (!trimmedReason) {
            console.log('[EXTRA ATTEMPT REQUEST] Empty reason after trim');
            return res.status(400).json({ 
                success: false, 
                message: 'Reason cannot be empty' 
            });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(trimmedQuizId)) {
            console.log('[EXTRA ATTEMPT REQUEST] Invalid quiz ID format');
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid quiz ID format' 
            });
        }

        // Check if quiz exists
        const quiz = await Quiz.findById(trimmedQuizId);
        if (!quiz) {
            console.log('[EXTRA ATTEMPT REQUEST] Quiz not found:', trimmedQuizId);
            return res.status(404).json({ 
                success: false, 
                message: 'Quiz not found' 
            });
        }

        // Check for existing pending request
        const existingRequest = await AttemptRequest.findOne({ 
            student: studentId, 
            quiz: trimmedQuizId, 
            status: 'pending' 
        });
        
        if (existingRequest) {
            console.log('[EXTRA ATTEMPT REQUEST] Existing pending request found');
            return res.status(400).json({ 
                success: false, 
                message: 'You already have a pending request for this quiz' 
            });
        }

        // Create the request
        const requestData = {
            student: studentId,
            quiz: trimmedQuizId,
            reason: trimmedReason
        };

        console.log('[EXTRA ATTEMPT REQUEST] Creating request with data:', requestData);
        
        const request = await AttemptRequest.create(requestData);
        
        console.log('[EXTRA ATTEMPT REQUEST] Request created successfully:', request._id);

        // Populate the created request for response
        const populatedRequest = await AttemptRequest.findById(request._id)
            .populate('student', 'firstName lastName email')
            .populate('quiz', 'title description');

        res.status(201).json({ 
            success: true, 
            data: populatedRequest,
            message: 'Request submitted successfully'
        });
    } catch (error) {
        console.error('[EXTRA ATTEMPT REQUEST] Server error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while processing request',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/submissions/pending-requests
// @desc    Get pending attempt requests for admin
// @access  Private/Admin
router.get('/pending-requests', protect, async (req, res) => {
    try {
        console.log('[PENDING REQUESTS] Admin fetching pending requests');
        console.log('[PENDING REQUESTS] User info:', {
            id: req.user?.id,
            role: req.user?.role,
            email: req.user?.email
        });
        
        // Check if user exists and has admin role
        if (!req.user) {
            console.log('[PENDING REQUESTS] No user found in request');
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }
        
        if (req.user.role !== 'admin') {
            console.log('[PENDING REQUESTS] Access denied - user role:', req.user.role);
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }
        
        // Check total requests for debugging
        const totalRequests = await AttemptRequest.countDocuments({});
        const pendingCount = await AttemptRequest.countDocuments({ status: 'pending' });
        
        console.log('[PENDING REQUESTS] Database stats:', {
            totalRequests,
            pendingCount
        });
        
        // Fetch pending requests with populated fields
        const requests = await AttemptRequest.find({ status: 'pending' })
            .populate({
                path: 'student',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'quiz',
                select: 'title description'
            })
            .sort({ requestedAt: -1 })
            .lean();
        
        console.log(`[PENDING REQUESTS] Found ${requests.length} pending requests`);
        
        // Log each request for debugging
        requests.forEach((request, index) => {
            console.log(`[PENDING REQUESTS][${index + 1}]`, {
                id: request._id,
                student: request.student ? `${request.student.firstName} ${request.student.lastName}` : 'Missing student',
                quiz: request.quiz ? request.quiz.title : 'Missing quiz',
                reason: request.reason,
                status: request.status,
                requestedAt: request.requestedAt
            });
        });
        
        res.status(200).json({ 
            success: true, 
            data: requests,
            count: requests.length,
            debug: {
                totalRequests,
                pendingCount,
                userRole: req.user.role,
                userId: req.user.id
            }
        });
    } catch (error) {
        console.error('[PENDING REQUESTS] Detailed error:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching pending requests',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   PUT /api/submissions/requests/:id/approve
// @desc    Approve an attempt request
// @access  Private/Admin
router.put('/requests/:id/approve', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        console.log('[APPROVE REQUEST] Approving request:', req.params.id);

        const request = await AttemptRequest.findByIdAndUpdate(
            req.params.id, 
            {
                status: 'approved',
                reviewedBy: req.user.id,
                reviewedAt: new Date()
            }, 
            { new: true }
        ).populate('student', 'firstName lastName email')
         .populate('quiz', 'title description');

        if (!request) {
            console.log('[APPROVE REQUEST] Request not found:', req.params.id);
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found' 
            });
        }

        console.log('[APPROVE REQUEST] Request approved successfully');
        res.status(200).json({ 
            success: true, 
            data: request,
            message: 'Request approved successfully'
        });
    } catch (error) {
        console.error('[APPROVE REQUEST] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while approving request' 
        });
    }
});

// @route   PUT /api/submissions/requests/:id/reject
// @desc    Reject an attempt request
// @access  Private/Admin
router.put('/requests/:id/reject', protect, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin privileges required.' 
            });
        }

        console.log('[REJECT REQUEST] Rejecting request:', req.params.id);

        const request = await AttemptRequest.findByIdAndUpdate(
            req.params.id, 
            {
                status: 'rejected',
                reviewedBy: req.user.id,
                reviewedAt: new Date()
            }, 
            { new: true }
        ).populate('student', 'firstName lastName email')
         .populate('quiz', 'title description');
        
        if (!request) {
            console.log('[REJECT REQUEST] Request not found:', req.params.id);
            return res.status(404).json({ 
                success: false, 
                message: 'Request not found' 
            });
        }

        console.log('[REJECT REQUEST] Request rejected successfully');
        res.status(200).json({ 
            success: true, 
            data: request,
            message: 'Request rejected successfully'
        });
    } catch (error) {
        console.error('[REJECT REQUEST] Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while rejecting request' 
        });
    }
});

module.exports = router;
