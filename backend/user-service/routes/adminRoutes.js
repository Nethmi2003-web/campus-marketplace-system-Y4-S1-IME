const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/adminController');
const {
  listSellerRequests,
  getSellerRequest,
  approveSellerRequest,
  rejectSellerRequest
} = require('../controllers/sellerRequestController');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

router.get('/stats', protect, adminOnly, getPlatformStats);

router.get('/seller-requests', protect, adminOnly, listSellerRequests);
router.get('/seller-requests/:id', protect, adminOnly, getSellerRequest);
router.put('/seller-requests/:id/approve', protect, adminOnly, approveSellerRequest);
router.put('/seller-requests/:id/reject', protect, adminOnly, rejectSellerRequest);

module.exports = router;
