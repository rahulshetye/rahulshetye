// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes.
 * Expects a Bearer token in Authorization header.
 */
module.exports = function (req, res, next) {
  // Get token from Authorization header
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // attach user payload
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
