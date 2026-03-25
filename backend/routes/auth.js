const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../integrations/google');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = req.body.email.toLowerCase().trim();
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user = await User.create({ name, email, password, verificationToken });

    sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email });
    console.log(`Login attempt for ${email}. User found: ${!!user}, isVerified: ${user?.isVerified}`);

    if (user && (await user.matchPassword(password))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email address before logging in. Check your inbox.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/auth/verify/:token
router.get('/verify/:token', async (req, res) => {
  try {
    // Using findOneAndUpdate to bypass any pre-save logic issues and ensure persistence
    const user = await User.findOneAndUpdate(
      { verificationToken: req.params.token },
      { $set: { isVerified: true }, $unset: { verificationToken: "" } },
      { new: true }
    );

    if (!user) {
      console.log(`Verification failed for token: ${req.params.token.substring(0, 10)}... (Token not found or already verified)`);
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    console.log(`User ${user.email} successfully verified: ${user.isVerified}`);

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

module.exports = router;
