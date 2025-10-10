// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Middleware to protect routes.
 * Checks for JWT in cookies or Authorization header.
 */
module.exports = function (req, res, next) {
  // Get token from cookies or Authorization header
  const token =
    req.cookies?.token ||
    (req.header('Authorization') ? req.header('Authorization').split(' ')[1] : null);

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user payload to request
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
