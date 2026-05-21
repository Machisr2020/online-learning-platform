
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  
  console.log('Auth middleware - checking authorization header...');
  
  // Check if auth header exists and starts with "Bearer"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted from Bearer header');
  }

  // Make sure token exists
  if (!token) {
    console.log('No token found in request headers');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - no token provided'
    });
  }

  try {
    console.log('Verifying JWT token...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully, user ID:', decoded.id);
    
    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      console.log('User not found in database for token');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User authenticated:', req.user.email, 'role:', req.user.role);
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - invalid token'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('Checking user role authorization:', req.user.role, 'allowed roles:', roles);
    if (!roles.includes(req.user.role)) {
      console.log('User role not authorized for this route');
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    console.log('User role authorized');
    next();
  };
};
