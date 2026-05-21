const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for PDF upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Simple PDF text extraction (placeholder - in production, use a proper PDF parser)
const extractQuestionsFromPDF = (pdfBuffer) => {
  // This is a placeholder implementation
  // In a real application, you would use a library like pdf-parse or pdf2pic
  // to extract text from the PDF and then parse it for questions
  
  // For now, return sample questions
  return [
    {
      question: "What is the capital of France?",
      questionType: "multiple-choice",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      points: 1
    },
    {
      question: "JavaScript is a programming language.",
      questionType: "true-false",
      options: ["True", "False"],
      correctAnswer: "True",
      points: 1
    }
  ];
};

// @route   POST /api/quizzes/extract-pdf
// @desc    Extract questions from PDF
// @access  Private/Instructor
router.post('/extract-pdf', protect, authorize('instructor', 'admin'), upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Extract questions from PDF
    const questions = extractQuestionsFromPDF(req.file.buffer);

    res.status(200).json({
      success: true,
      data: {
        questions: questions
      }
    });
  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract questions from PDF'
    });
  }
});

// Helper function to create notification for admin
const createAdminNotification = async (quiz) => {
  try {
    const admins = await require('../models/User').find({ role: 'admin' });
    
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        title: 'New Quiz Approval Request',
        message: `Quiz "${quiz.title}" has been submitted for approval by instructor.`,
        type: 'approval',
        relatedTo: {
          model: 'Quiz',
          id: quiz._id
        }
      });
    }
  } catch (error) {
    console.error('Error creating admin notification:', error);
  }
};

// @route   GET /api/quizzes
// @desc    Get all quizzes for instructor
// @access  Private/Instructor
router.get('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quizzes/pending
// @desc    Get all pending quizzes for admin approval
// @access  Private/Admin
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingQuizzes = await Quiz.find({ status: 'pending' })
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: pendingQuizzes.length,
      data: pendingQuizzes
    });
  } catch (error) {
    console.error('Get pending quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/quizzes/:id/approve
// @desc    Approve a quiz
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('course', 'title');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    quiz.status = 'published';
    await quiz.save();

    // Create notification for instructor
    await Notification.create({
      recipient: quiz.createdBy._id,
      title: 'Quiz Approved',
      message: `Your quiz "${quiz.title}" has been approved and is now live for students.`,
      type: 'approval',
      relatedTo: {
        model: 'Quiz',
        id: quiz._id
      }
    });

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Approve quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/quizzes/:id/reject
// @desc    Reject a quiz
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    quiz.status = 'draft';
    await quiz.save();

    // Create notification for instructor
    await Notification.create({
      recipient: quiz.createdBy._id,
      title: 'Quiz Rejected',
      message: `Your quiz "${quiz.title}" has been rejected. Reason: ${reason || 'No reason provided'}`,
      type: 'approval',
      relatedTo: {
        model: 'Quiz',
        id: quiz._id
      }
    });

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Reject quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/quizzes
// @desc    Create a quiz
// @access  Private/Instructor
router.post('/', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    console.log('Creating quiz with data:', req.body);
    
    // Validate required fields
    const { title, course, questions } = req.body;
    
    if (!title || !course || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, course, and at least one question are required'
      });
    }

    // Add logged in user as creator
    req.body.createdBy = req.user.id;
    
    const quiz = await Quiz.create(req.body);
    
    // If quiz is created with pending status, notify admins
    if (quiz.status === 'pending') {
      await createAdminNotification(quiz);
    }
    
    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    
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

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'firstName lastName');
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Students should not see the correctAnswer for unpublished quizzes
    if (req.user.role === 'student' && quiz.status !== 'published') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Quiz not published'
      });
    }

    // Hide correct answers for students until they submit
    if (req.user.role === 'student') {
      const sanitizedQuiz = { ...quiz.toObject() };
      sanitizedQuiz.questions = sanitizedQuiz.questions.map(question => {
        const { correctAnswer, ...sanitizedQuestion } = question;
        return sanitizedQuestion;
      });
      
      return res.status(200).json({
        success: true,
        data: sanitizedQuiz
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Update quiz
// @access  Private/Instructor
router.put('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Make sure user is quiz creator or an admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this quiz'
      });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete quiz
// @access  Private/Instructor
router.delete('/:id', protect, authorize('instructor', 'admin'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Make sure user is quiz creator or an admin
    if (quiz.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this quiz'
      });
    }

    await quiz.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quizzes/course/:courseId
// @desc    Get quizzes for a course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    let query = { course: req.params.courseId };
    
    // Students can only see published quizzes
    if (req.user.role === 'student') {
      query.status = 'published';
    }

    const quizzes = await Quiz.find(query)
      .select('title description timeLimit status dueDate maxAttempts')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    console.error('Get course quizzes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
