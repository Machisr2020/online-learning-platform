const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/messages');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

// Helper function to create notification (optimized)
const createMessageNotification = async (sender, receiverId, messageContent, isMedia = false) => {
  try {
    const notificationContent = isMedia ? 
      `Sent you a ${messageContent}` : 
      (messageContent.length > 50 ? messageContent.substring(0, 47) + '...' : messageContent);
    
    await Notification.create({
      recipient: receiverId,
      title: `New message from ${sender.firstName} ${sender.lastName}`,
      message: notificationContent,
      type: 'message',
      relatedTo: {
        model: 'Message'
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// IMPORTANT: Specific routes MUST come before parameterized routes

// @route   GET /api/messages/unread/count
// @desc    Get count of unread messages
// @access  Private
router.get('/unread/count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      readStatus: false
    });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/contacts/all
// @desc    Get all users the current user has chatted with (optimized)
// @access  Private
router.get('/contacts/all', protect, async (req, res) => {
  try {
    let contacts = [];

    // Get all messages involving the current user
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$content' },
          lastMessageTime: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$readStatus', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get user details for contacts
    const userIds = messages.map(m => m._id);
    const users = await User.find({
      _id: { $in: userIds }
    }).select('firstName lastName avatar lastLogin role');

    // Combine user data with message data
    contacts = users.map(user => {
      const messageData = messages.find(m => m._id.toString() === user._id.toString());
      return {
        ...user.toObject(),
        lastMessage: messageData?.lastMessage || null,
        lastMessageTime: messageData?.lastMessageTime || null,
        unread: messageData?.unreadCount || 0
      };
    });

    // Sort by last message time
    contacts.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
    
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/all-instructors
// @desc    Get all instructors
// @access  Private
router.get('/all-instructors', protect, async (req, res) => {
  try {
    console.log('Fetching all instructors for user:', req.user.role);
    
    const instructors = await User.find({ 
      role: 'instructor', 
      isActive: { $ne: false }
    })
      .select('firstName lastName avatar role lastLogin')
      .sort({ firstName: 1 });
    
    console.log('Found instructors:', instructors.length);
    
    // Add unread message counts efficiently
    const instructorIds = instructors.map(i => i._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          sender: { $in: instructorIds },
          receiver: req.user._id,
          readStatus: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));
    
    const result = instructors.map(instructor => ({
      ...instructor.toObject(),
      unread: unreadMap.get(instructor._id.toString()) || 0
    }));
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Get all instructors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/all-admins
// @desc    Get all admins
// @access  Private
router.get('/all-admins', protect, async (req, res) => {
  try {
    console.log('Fetching all admins for user:', req.user.role);
    
    const admins = await User.find({ 
      role: 'admin', 
      isActive: { $ne: false }
    })
      .select('firstName lastName avatar role lastLogin')
      .sort({ firstName: 1 });
    
    console.log('Found admins:', admins.length);
    
    // Add unread message counts efficiently
    const adminIds = admins.map(a => a._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          sender: { $in: adminIds },
          receiver: req.user._id,
          readStatus: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));
    
    const result = admins.map(admin => ({
      ...admin.toObject(),
      unread: unreadMap.get(admin._id.toString()) || 0
    }));
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/all-students
// @desc    Get all students
// @access  Private
router.get('/all-students', protect, async (req, res) => {
  try {
    console.log('Fetching all students for user:', req.user.role);
    
    const students = await User.find({ 
      role: 'student', 
      isActive: { $ne: false }
    })
      .select('firstName lastName avatar role lastLogin')
      .sort({ firstName: 1 });
    
    console.log('Found students:', students.length);
    
    // Add unread message counts efficiently
    const studentIds = students.map(s => s._id);
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          sender: { $in: studentIds },
          receiver: req.user._id,
          readStatus: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = new Map(unreadCounts.map(u => [u._id.toString(), u.count]));
    
    const result = students.map(student => ({
      ...student.toObject(),
      unread: unreadMap.get(student._id.toString()) || 0
    }));
    
    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/instructors
// @desc    Get instructors for student's enrolled courses
// @access  Private/Student
router.get('/instructors', protect, async (req, res) => {
  try {
    // Get all enrollments for the student
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'instructor title',
        populate: {
          path: 'instructor',
          select: 'firstName lastName avatar role'
        }
      });
    
    // Extract unique instructors
    const instructorMap = new Map();
    enrollments.forEach(enrollment => {
      if (enrollment.course && enrollment.course.instructor) {
        const instructor = enrollment.course.instructor;
        instructorMap.set(instructor._id.toString(), {
          _id: instructor._id,
          firstName: instructor.firstName,
          lastName: instructor.lastName,
          avatar: instructor.avatar,
          role: instructor.role
        });
      }
    });
    
    const instructors = Array.from(instructorMap.values());
    
    res.status(200).json({
      success: true,
      count: instructors.length,
      data: instructors
    });
  } catch (error) {
    console.error('Get instructors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/students
// @desc    Get students for instructor's courses
// @access  Private/Instructor
router.get('/students', protect, async (req, res) => {
  try {
    // Get all courses for the instructor
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(course => course._id);
    
    // Get all enrollments for instructor's courses
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'firstName lastName avatar role lastLogin');
    
    // Extract unique students
    const studentMap = new Map();
    enrollments.forEach(enrollment => {
      if (enrollment.student) {
        const student = enrollment.student;
        studentMap.set(student._id.toString(), {
          _id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          avatar: student.avatar,
          role: student.role,
          lastLogin: student.lastLogin
        });
      }
    });
    
    const students = Array.from(studentMap.values());
    
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages/report-user
// @desc    Report a user to admin (enhanced)
// @access  Private
router.post('/report-user', protect, async (req, res) => {
  try {
    const { userId, reason, description } = req.body;
    
    // Verify user exists
    const reportedUser = await User.findById(userId);
    if (!reportedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find all admins
    const admins = await User.find({ role: 'admin' });
    
    // Create notifications for all admins
    const notificationPromises = admins.map(admin => 
      Notification.create({
        recipient: admin._id,
        title: `User Report from ${req.user.firstName} ${req.user.lastName}`,
        message: `${reportedUser.role} ${reportedUser.firstName} ${reportedUser.lastName} reported for: ${reason}`,
        type: 'system',
        relatedTo: {
          model: 'User',
          id: userId
        }
      })
    );
    
    await Promise.all(notificationPromises);
    
    res.status(200).json({
      success: true,
      message: 'User reported successfully. Admins have been notified.'
    });
  } catch (error) {
    console.error('Report user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Legacy support for report-student
router.post('/report-student', protect, async (req, res) => {
  req.body.userId = req.body.studentId;
  delete req.body.studentId;
  // Forward to report-user handler
  return router.handle(Object.assign(req, { url: '/report-user', method: 'POST' }), res);
});

// @route   POST /api/messages/media
// @desc    Send a message with media attachment
// @access  Private
router.post('/media', protect, upload.single('media'), async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No media file provided'
      });
    }

    // Create message with media
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content: content || `Shared ${req.file.originalname}`,
      messageType: 'media',
      mediaUrl: `/uploads/messages/${req.file.filename}`,
      mediaType: req.file.mimetype,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar');

    // Create notification for receiver
    await createMessageNotification(req.user, receiverId, req.file.originalname, true);
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send media message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/messages
// @desc    Send a new message (optimized)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }
    
    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      deliveredAt: new Date()
    });

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar');
    
    // Create notification for receiver
    await createMessageNotification(req.user, receiverId, content);
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read (optimized)
// @access  Private
router.put('/:messageId/read', protect, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.messageId,
        receiver: req.user._id
      },
      {
        readStatus: true,
        readAt: new Date()
      },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or not authorized'
      });
    }
    
    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/messages/:userId
// @desc    Get conversation with a specific user (optimized)
// @access  Private
router.get('/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Validate that user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find messages with optimized query
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar')
      .lean(); // Use lean for better performance
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PATCH /api/messages/conversation/:userId/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.patch('/conversation/:userId/read', protect, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Mark all messages from this user to current user as read
    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        readStatus: false
      },
      {
        readStatus: true,
        readAt: new Date()
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`
    });
  } catch (error) {
    console.error('Mark conversation as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Serve uploaded media files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, '../uploads/messages', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
});

module.exports = router;
