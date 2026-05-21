
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

let io;

// Helper function to authenticate socket connection
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    socket.user = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };
    
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
};

// Helper function to create notification (optimized)
const createMessageNotification = async (sender, receiverId, messageContent) => {
  try {
    await Notification.create({
      recipient: receiverId,
      title: `New message from ${sender.firstName} ${sender.lastName}`,
      message: messageContent.length > 50 ? messageContent.substring(0, 47) + '...' : messageContent,
      type: 'message',
      relatedTo: {
        model: 'Message'
      }
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Initialize socket.io with enhanced configuration
const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25001,
    transports: ['websocket', 'polling'],
    allowEIO3: true
  });
  
  // Use authentication middleware
  io.use(authenticateSocket);
  
  // Handle connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);
    
    // Join user's personal room
    socket.join(socket.user.id.toString());
    
    // Update user status to online
    socket.broadcast.emit('user:status', { 
      userId: socket.user.id, 
      status: 'online',
      lastSeen: new Date()
    });
    
    // Handle private message with optimized processing
    socket.on('message:send', async (data, callback) => {
      try {
        const { receiverId, content } = data;
        
        // Validate data
        if (!receiverId || !content) {
          const error = { message: 'Invalid message data' };
          if (callback) callback(error);
          return socket.emit('error', error);
        }
        
        // Check if receiver exists
        const receiver = await User.findById(receiverId).select('_id firstName lastName');
        if (!receiver) {
          const error = { message: 'Receiver not found' };
          if (callback) callback(error);
          return socket.emit('error', error);
        }
        
        // Create message in database with optimized fields
        const message = await Message.create({
          sender: socket.user.id,
          receiver: receiverId,
          content,
          deliveredAt: new Date()
        });
        
        // Populate sender info only (receiver already known)
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'firstName lastName avatar')
          .populate('receiver', 'firstName lastName avatar')
          .lean();
        
        // Create notification asynchronously
        createMessageNotification(socket.user, receiverId, content);
        
        // Send to receiver if online (faster delivery)
        const receiverSockets = await io.in(receiverId).fetchSockets();
        if (receiverSockets.length > 0) {
          io.to(receiverId).emit('message:received', populatedMessage);
          // Mark as delivered immediately if receiver is online
          await Message.findByIdAndUpdate(message._id, { deliveredAt: new Date() });
        }
        
        // Send confirmation to sender
        socket.emit('message:sent', populatedMessage);
        
        // Notify about new notification
        io.to(receiverId).emit('notification:new');
        
        // Call callback if provided for acknowledgment
        if (callback) callback({ success: true, messageId: message._id });
        
      } catch (error) {
        console.error('Socket message error:', error);
        const errorMsg = { message: 'Server error sending message' };
        if (callback) callback(errorMsg);
        socket.emit('error', errorMsg);
      }
    });
    
    // Handle mark message as read with batch processing
    socket.on('message:read', async (messageId) => {
      try {
        const message = await Message.findOneAndUpdate(
          {
            _id: messageId,
            receiver: socket.user.id
          },
          {
            readStatus: true,
            readAt: new Date()
          },
          { new: true }
        );
        
        if (!message) {
          return socket.emit('error', { message: 'Message not found or not authorized' });
        }
        
        // Notify sender about read receipt
        io.to(message.sender.toString()).emit('message:readReceipt', { 
          messageId,
          readAt: message.readAt
        });
        
      } catch (error) {
        console.error('Socket read message error:', error);
        socket.emit('error', { message: 'Server error updating message' });
      }
    });
    
    // Handle bulk mark as read for conversation
    socket.on('messages:readAll', async (senderId) => {
      try {
        const result = await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.user.id,
            readStatus: false
          },
          {
            readStatus: true,
            readAt: new Date()
          }
        );
        
        // Notify sender about read receipts
        if (result.modifiedCount > 0) {
          io.to(senderId).emit('messages:readReceiptBulk', {
            receiverId: socket.user.id,
            count: result.modifiedCount,
            readAt: new Date()
          });
        }
        
      } catch (error) {
        console.error('Socket bulk read error:', error);
        socket.emit('error', { message: 'Server error updating messages' });
      }
    });
    
    // Handle typing indicator with debouncing
    const typingTimeouts = new Map();
    
    socket.on('typing:start', (receiverId) => {
      // Clear existing timeout
      if (typingTimeouts.has(receiverId)) {
        clearTimeout(typingTimeouts.get(receiverId));
      }
      
      // Send typing indicator
      io.to(receiverId).emit('typing:indicator', {
        userId: socket.user.id,
        status: 'typing'
      });
      
      // Auto-stop typing after 3 seconds
      const timeout = setTimeout(() => {
        io.to(receiverId).emit('typing:indicator', {
          userId: socket.user.id,
          status: 'idle'
        });
        typingTimeouts.delete(receiverId);
      }, 3000);
      
      typingTimeouts.set(receiverId, timeout);
    });
    
    // Handle stopped typing
    socket.on('typing:stop', (receiverId) => {
      if (typingTimeouts.has(receiverId)) {
        clearTimeout(typingTimeouts.get(receiverId));
        typingTimeouts.delete(receiverId);
      }
      
      io.to(receiverId).emit('typing:indicator', {
        userId: socket.user.id,
        status: 'idle'
      });
    });
    
    // Handle new calendar event
    socket.on('calendar:eventCreated', (eventData) => {
      // Notify all participants
      if (eventData.participants && Array.isArray(eventData.participants)) {
        eventData.participants.forEach(participantId => {
          io.to(participantId).emit('calendar:newEvent', eventData);
        });
      }
    });
    
    // Handle event updated
    socket.on('calendar:eventUpdated', (eventData) => {
      // Notify all participants
      if (eventData.participants && Array.isArray(eventData.participants)) {
        eventData.participants.forEach(participantId => {
          io.to(participantId).emit('calendar:eventUpdate', eventData);
        });
      }
    });
    
    // Handle join conversation room for better performance
    socket.on('conversation:join', (otherUserId) => {
      const roomName = [socket.user.id, otherUserId].sort().join('-');
      socket.join(roomName);
      console.log(`User ${socket.user.id} joined conversation room: ${roomName}`);
    });
    
    // Handle leave conversation room
    socket.on('conversation:leave', (otherUserId) => {
      const roomName = [socket.user.id, otherUserId].sort().join('-');
      socket.leave(roomName);
      console.log(`User ${socket.user.id} left conversation room: ${roomName}`);
    });
    
    // Handle disconnect with cleanup
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.id} (${reason})`);
      
      // Clear all typing timeouts
      typingTimeouts.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.clear();
      
      // Update user status to offline
      socket.broadcast.emit('user:status', { 
        userId: socket.user.id, 
        status: 'offline',
        lastSeen: new Date()
      });
    });
  });
  
  return io;
};

// Function to get io instance
const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo
};
