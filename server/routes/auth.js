const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: isProduction,           // must be true on HTTPS
  sameSite: isProduction ? "None" : "Lax",
  maxAge: 1000 * 60 * 60,        // 1 hour
};


// =================== REGISTER ===================
router.post(
  '/register',
  [body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      if (await User.findOne({ email })) return res.status(400).json({ msg: 'User exists' });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      res
        .cookie('token', token, COOKIE_OPTS)
        .json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// =================== LOGIN ===================
router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

      // ✅ Set cookie with correct flags
      res
        .cookie('token', token, COOKIE_OPTS)
        .json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// =================== PROFILE ===================
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

// =================== LOGOUT ===================
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;
