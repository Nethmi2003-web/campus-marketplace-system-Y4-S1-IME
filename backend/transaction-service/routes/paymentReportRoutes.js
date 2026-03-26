const express = require('express');
const { createPaymentReport, getAllPaymentReports, getPaymentReportSlip } = require('../controllers/paymentReportController');
const { uploadPaymentSlip } = require('../middleware/paymentSlipUpload');
const { protect, adminOnly } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', adminOnly, getAllPaymentReports);
router.get('/:id/slip', adminOnly, getPaymentReportSlip);
router.post('/', uploadPaymentSlip.single('slip'), createPaymentReport);

module.exports = router;
