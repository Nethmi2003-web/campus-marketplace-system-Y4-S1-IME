const multer = require('multer');
const cloudinaryStorage = require('multer-storage-cloudinary');
const { cloudinary } = require('../../config/cloudinary');

const storage = cloudinaryStorage({
  cloudinary,
  folder: 'campus_marketplace/items',
  allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
  transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
});

const uploadItemImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = { uploadItemImage };

