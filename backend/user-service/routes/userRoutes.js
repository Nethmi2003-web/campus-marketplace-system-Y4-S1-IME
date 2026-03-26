const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMySellerRequest,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/seller-request', protect, getMySellerRequest);
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
