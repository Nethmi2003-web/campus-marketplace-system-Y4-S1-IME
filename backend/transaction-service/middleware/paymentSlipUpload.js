const multer = require('multer');
const cloudinaryStorage = require('multer-storage-cloudinary');
const { cloudinary } = require('../../config/cloudinary');

const storage = cloudinaryStorage({
  cloudinary,
  params: (req, file, cb) => {
    cb(null, {
      folder: 'campus_marketplace/payment_reports',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
      public_id: `payment_report_${req.user?.id || 'user'}_${Date.now()}`
    });
  }
});

const uploadPaymentSlip = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

module.exports = { uploadPaymentSlip };

