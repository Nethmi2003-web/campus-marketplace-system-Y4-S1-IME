const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { getRecord } = require('../config/database');

const protect = asyncHandler(async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    res.status(500);
    throw new Error('JWT_SECRET is not configured.');
  }

  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  let decoded;
  try {
    decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET);
  } catch {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }

  const user = await getRecord('users', decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  const { passwordHash, ...safeUser } = user;
  req.user = { ...safeUser, id: safeUser._id };
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'sportAdmin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied – Admins only');
  }
};

const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'seller') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied – Sellers only');
  }
};

module.exports = { protect, adminOnly, sellerOnly };
