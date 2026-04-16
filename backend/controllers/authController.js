const validator = require('validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check all fields present
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
  }

  // 2. Validate name length
  if (name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({ success: false, message: 'Name must be between 2 and 50 characters' });
  }

  // 3. Validate real email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  // 4. Strong password check: min 6 chars, at least 1 letter and 1 number
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
    return res.status(400).json({ success: false, message: 'Password must contain at least one letter and one number' });
  }

  // 5. Check duplicate email (normalized to lowercase)
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // 6. Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  // Validate email format before hitting DB
  if (!validator.isEmail(email)) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  // Find user (include password field which is excluded by default)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Use same error message for wrong email OR wrong password (prevents user enumeration)
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Validate new email if provided
  if (req.body.email) {
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    // Check email not taken by another user
    const emailExists = await User.findOne({ email: req.body.email.toLowerCase(), _id: { $ne: user._id } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    user.email = req.body.email.toLowerCase();
  }

  if (req.body.name) {
    if (req.body.name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }
    user.name = req.body.name.trim();
  }

  if (req.body.password) {
    if (req.body.password.length < 6 || !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(req.body.password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters with a letter and number' });
    }
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  const token = generateToken(updatedUser._id);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    token,
    user: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
  });
};

module.exports = { signup, login, getProfile, updateProfile };