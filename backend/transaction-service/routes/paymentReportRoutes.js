const express = require('express');
const {
  createPaymentReport,
  getAllPaymentReports,
  getSellerPaymentReports,
  getPaymentReportSlip
} = require('../controllers/paymentReportController');
const { uploadPaymentSlip } = require('../middleware/paymentSlipUpload');
const { protect, adminOnly, sellerOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', adminOnly, getAllPaymentReports);
router.get('/seller', sellerOnly, getSellerPaymentReports);
router.get('/:id/slip', getPaymentReportSlip);
router.post('/', uploadPaymentSlip.single('slip'), createPaymentReport);

module.exports = router;
