const express = require('express');
const {
  getItems,
  getMyItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

const router = express.Router();

const { protect, sellerOnly } = require('../../middleware/authMiddleware');
const { uploadItemImage } = require('../middleware/itemImageUpload');

router
  .route('/')
  .get(getItems)
  .post(protect, sellerOnly, uploadItemImage.single('image'), createItem);

router.get('/mine', protect, sellerOnly, getMyItems);

router
  .route('/:id')
  .get(getItem)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;
