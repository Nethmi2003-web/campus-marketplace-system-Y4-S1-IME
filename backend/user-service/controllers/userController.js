const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
// Handle both CommonJS and ES Module default exports gracefully just in case User.js is transpiled or native ESM
const UserModel = require('../models/User');
const User = UserModel.default || UserModel;
const SellerRequest = require('../models/SellerRequest');

// Generate standard JWT token without aggressive concurrent tracking
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @desc  Register new user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, faculty, universityEmail, password, confirmPassword, role } = req.body;

  if (!firstName || !lastName || !faculty || !universityEmail || !password || !confirmPassword) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }

  const userExists = await User.findOne({ universityEmail });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this university email');
  }

  // Public registration should never be able to create privileged roles.
  const requestedRole = String(role || 'user').trim().toLowerCase();
  const allowedRoles = new Set(['user', 'seller']);
  if (!allowedRoles.has(requestedRole)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Sellers require admin approval; create as a normal user first and file a request.
  const createRole = requestedRole === 'seller' ? 'user' : requestedRole;

  // Pass confirmPassword to satisfy Mongoose virtual validation hook
  const user = await User.create({ 
    firstName, 
    lastName, 
    faculty, 
    universityEmail, 
    password, 
    confirmPassword,
    role: createRole
  });

  let sellerRequest = null;
  if (requestedRole === 'seller') {
    sellerRequest = await SellerRequest.create({ user: user._id });
  }

  res.status(201).json({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    universityEmail: user.universityEmail,
    role: user.role,
    sellerRequest: sellerRequest
      ? { _id: sellerRequest._id, status: sellerRequest.status, createdAt: sellerRequest.createdAt }
      : null,
    token: generateToken(user._id),
  });
});

// @desc  Login user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  // Mapping the frontend 'email' input payload to 'universityEmail' for the DB check
  const { email, password } = req.body;

  const user = await User.findOne({ universityEmail: email });

  if (user && (await user.matchPassword(password))) {
    const latestSellerRequest = await SellerRequest.findOne({ user: user._id })
      .sort('-createdAt')
      .select('_id status createdAt decidedAt rejectionReason');
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      universityEmail: user.universityEmail,
      role: user.role,
      sellerRequest: latestSellerRequest
        ? {
            _id: latestSellerRequest._id,
            status: latestSellerRequest.status,
            createdAt: latestSellerRequest.createdAt,
            decidedAt: latestSellerRequest.decidedAt,
            rejectionReason: latestSellerRequest.rejectionReason
          }
        : null,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc  Get current user's latest seller request (if any)
// @route GET /api/users/seller-request
// @access Private
const getMySellerRequest = asyncHandler(async (req, res) => {
  const latest = await SellerRequest.findOne({ user: req.user._id })
    .sort("-createdAt")
    .select("_id status createdAt decidedAt rejectionReason decidedBy")
    .populate({ path: "decidedBy", select: "firstName lastName universityEmail role" });

  res.status(200).json({ success: true, data: latest || null });
});

// @desc  Get logged-in user profile
// @route GET /api/users/me
// @access Private
const getUserProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc  Update user profile
// @route PUT /api/users/me
// @access Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.firstName = req.body.firstName || user.firstName;
  user.lastName = req.body.lastName || user.lastName;
  user.phone = req.body.phone || user.phone;
  user.bio = req.body.bio || user.bio;
  
  if (req.body.password) {
    user.password = req.body.password;
    if (req.body.confirmPassword) {
      user.confirmPassword = req.body.confirmPassword;
    } else {
      user.confirmPassword = req.body.password; // automatically bypass confirm on backend patch
    }
  }

  const updated = await user.save();
  res.json({ 
    _id: updated._id, 
    firstName: updated.firstName, 
    lastName: updated.lastName, 
    universityEmail: updated.universityEmail, 
    role: updated.role 
  });
});

// @desc  Get all users (admin)
// @route GET /api/users
// @access Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

module.exports = {
  registerUser,
  loginUser,
  getMySellerRequest,
  getUserProfile,
  updateUserProfile,
  getAllUsers
};
