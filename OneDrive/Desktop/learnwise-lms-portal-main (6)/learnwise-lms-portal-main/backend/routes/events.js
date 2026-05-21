
const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events for the current user based on visibility rules
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('Fetching events for user:', req.user.email, 'role:', req.user.role);
    
    let events;
    
    if (req.user.role === 'admin') {
      // Admin can see all events - ensure proper population
      events = await Event.find()
        .populate('course', 'title')
        .populate({
          path: 'createdBy',
          select: 'firstName lastName role',
          // Handle case where createdBy might be missing
          options: { 
            strictPopulate: false,
            // Set default values if population fails
            transform: (doc) => {
              if (!doc) {
                return {
                  firstName: 'Unknown',
                  lastName: 'User',
                  role: 'unknown'
                };
              }
              return doc;
            }
          }
        })
        .sort({ startDate: 1 });
    } else if (req.user.role === 'instructor') {
      // Instructor can see their own events, public events, and events visible to instructors
      events = await Event.find({
        $or: [
          { createdBy: req.user._id },
          { visibilityType: 'all' },
          { visibilityType: 'role', visibleToRoles: 'instructor' },
          { participants: req.user._id }
        ]
      })
        .populate('course', 'title')
        .populate({
          path: 'createdBy',
          select: 'firstName lastName role',
          options: { strictPopulate: false }
        })
        .sort({ startDate: 1 });
    } else {
      // Students can see public events, events visible to students, and events they're specifically invited to
      const userEnrollments = await require('../models/Enrollment').find({ 
        student: req.user._id 
      }).select('course');
      
      const enrolledCourseIds = userEnrollments.map(enrollment => enrollment.course);
      
      events = await Event.find({
        $or: [
          { visibilityType: 'all' },
          { visibilityType: 'role', visibleToRoles: 'student' },
          { participants: req.user._id },
          { course: { $in: enrolledCourseIds } }
        ]
      })
        .populate('course', 'title')
        .populate({
          path: 'createdBy',
          select: 'firstName lastName role',
          options: { strictPopulate: false }
        })
        .sort({ startDate: 1 });
    }

    // Filter out events with null createdBy and set defaults
    events = events.map(event => {
      if (!event.createdBy) {
        event.createdBy = {
          _id: null,
          firstName: 'System',
          lastName: 'User',
          role: 'system'
        };
      }
      return event;
    });

    console.log('Found', events.length, 'events for user');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Admin/Instructor
router.post('/', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    console.log('Creating event by user:', req.user.email, 'role:', req.user.role);
    
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      allDay,
      location,
      meetLink,
      course,
      participants,
      visibilityType,
      visibleToRoles
    } = req.body;

    const event = await Event.create({
      title,
      description,
      eventType,
      startDate,
      endDate,
      allDay,
      location,
      meetLink,
      course,
      participants: participants || [],
      visibilityType: visibilityType || 'all',
      visibleToRoles: visibleToRoles || [],
      createdBy: req.user._id
    });

    await event.populate('course', 'title');
    await event.populate('createdBy', 'firstName lastName role');

    console.log('Event created successfully:', event._id);

    // Create notifications for relevant users
    const Notification = require('../models/Notification');
    
    try {
      if (visibilityType === 'all' || (visibilityType === 'role' && visibleToRoles.includes('student'))) {
        // Notify all users or specific roles
        const User = require('../models/User');
        let targetUsers;
        
        if (visibilityType === 'all') {
          targetUsers = await User.find({ role: { $in: ['student', 'instructor'] } });
        } else {
          targetUsers = await User.find({ role: { $in: visibleToRoles } });
        }
        
        const notifications = targetUsers.map(user => ({
          recipient: user._id,
          title: `New ${eventType}: ${title}`,
          message: description || `A new ${eventType} has been scheduled.`,
          type: 'system',
          relatedTo: {
            model: 'Event',
            id: event._id
          }
        }));

        await Notification.insertMany(notifications);
      } else if (visibilityType === 'specific' && participants && participants.length > 0) {
        // Notify specific participants
        const notifications = participants.map(participantId => ({
          recipient: participantId,
          title: `New event: ${title}`,
          message: description || 'You have been invited to a new event.',
          type: 'event',
          relatedTo: {
            model: 'Event',
            id: event._id
          }
        }));

        await Notification.insertMany(notifications);
      } else if (course) {
        // Notify students enrolled in the course
        const Enrollment = require('../models/Enrollment');
        const enrollments = await Enrollment.find({ course }).populate('student');
        
        const notifications = enrollments.map(enrollment => ({
          recipient: enrollment.student._id,
          title: `New event in ${event.course?.title}: ${title}`,
          message: description || 'A new event has been added to your course.',
          type: 'course',
          relatedTo: {
            model: 'Event',
            id: event._id
          }
        }));

        await Notification.insertMany(notifications);
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the event creation if notifications fail
    }

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private/Admin/Instructor (own events)
router.put('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can edit this event
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this event'
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course', 'title').populate('createdBy', 'firstName lastName');

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private/Admin/Instructor (own events)
router.delete('/:id', protect, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can delete this event
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
