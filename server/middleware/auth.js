const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Log incoming cookies
  console.log("Cookies received:", req.cookies);

  // Get token from cookie
  const token = req.cookies?.token;
  console.log("Token extracted:", token);

  if (!token) {
    console.warn("No token found, authorization denied");
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT payload:", decoded);

    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
