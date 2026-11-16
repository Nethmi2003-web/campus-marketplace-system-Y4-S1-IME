const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  createRecord,
  findRecordByField,
  getRecord,
  listRecords,
  updateRecord
} = require('../../config/database');

const publicUser = (user) => {
  if (!user) return null;
  const { passwordHash, password, ...safeUser } = user;
  return safeUser;
};

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const latestSellerRequest = async (userId) => {
  const requests = (await listRecords('sellerRequests'))
    .filter((request) => request.user === userId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return requests[0] || null;
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    faculty,
    universityEmail,
    password,
    confirmPassword,
    role
  } = req.body;

  if (!firstName || !lastName || !faculty || !universityEmail || !password || !confirmPassword) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Passwords do not match');
  }
  if (String(password).length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const normalizedEmail = String(universityEmail).trim().toLowerCase();
  if (!/.+@(my\.sliit\.lk|sliit\.lk|.*\.ac\.lk|.*\.edu)$/.test(normalizedEmail)) {
    res.status(400);
    throw new Error('Please use a valid university email address');
  }
  if (await findRecordByField('users', 'universityEmail', normalizedEmail)) {
    res.status(400);
    throw new Error('User already exists with this university email');
  }

  const requestedRole = String(role || 'user').trim().toLowerCase();
  if (!['user', 'seller'].includes(requestedRole)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createRecord('users', {
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    faculty: String(faculty).trim(),
    universityEmail: normalizedEmail,
    passwordHash,
    role: 'user',
    sessionVersion: 0
  });

  let sellerRequest = null;
  if (requestedRole === 'seller') {
    sellerRequest = await createRecord('sellerRequests', {
      user: user._id,
      status: 'pending'
    });
  }

  res.status(201).json({
    ...publicUser(user),
    sellerRequest: sellerRequest
      ? {
          _id: sellerRequest._id,
          status: sellerRequest.status,
          createdAt: sellerRequest.createdAt
        }
      : null,
    token: generateToken(user._id)
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;
  const user = await findRecordByField('users', 'universityEmail', email);

  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash || ''))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const request = await latestSellerRequest(user._id);
  res.json({
    ...publicUser(user),
    sellerRequest: request
      ? {
          _id: request._id,
          status: request.status,
          createdAt: request.createdAt,
          decidedAt: request.decidedAt,
          rejectionReason: request.rejectionReason
        }
      : null,
    token: generateToken(user._id)
  });
});

const getMySellerRequest = asyncHandler(async (req, res) => {
  const request = await latestSellerRequest(req.user._id);
  if (request) {
    request.decidedBy = request.decidedBy
      ? publicUser(await getRecord('users', request.decidedBy))
      : null;
  }
  res.status(200).json({ success: true, data: request });
});

const getUserProfile = asyncHandler(async (req, res) => {
  res.json(publicUser(req.user));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of ['firstName', 'lastName', 'phone', 'bio']) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (req.body.password) {
    if (String(req.body.password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    if (req.body.confirmPassword && req.body.password !== req.body.confirmPassword) {
      res.status(400);
      throw new Error('Passwords do not match');
    }
    updates.passwordHash = await bcrypt.hash(req.body.password, 10);
  }

  const updated = await updateRecord('users', req.user._id, updates);
  if (!updated) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(publicUser(updated));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = (await listRecords('users')).map(publicUser);
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
