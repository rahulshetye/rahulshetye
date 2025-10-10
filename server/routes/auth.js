const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');



const COOKIE_OPTS = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 1000*60*60 };

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, COOKIE_OPTS).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).send('Server error'); }
});

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req,res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
    if (!await bcrypt.compare(password, user.password)) return res.status(400).json({ msg: 'Invalid credentials' });
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', token, COOKIE_OPTS).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { res.status(500).send('Server error'); }
});

router.get('/me', auth, async (req,res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

router.post("/logout", auth, (req, res) => {
  // Use same options as when setting the cookie, but set secure=false for localhost
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", { 
    httpOnly: true, 
    sameSite: isProduction ? "None" : "Lax", 
    secure: isProduction 
  });

  res.json({ msg: "Logged out successfully" });
});


module.exports = router;
