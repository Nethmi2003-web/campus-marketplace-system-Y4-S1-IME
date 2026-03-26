const Item = require('../models/Item');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
exports.getItems = async (req, res, next) => {
  try {
    let query = { status: 'available' };
    
    if (req.query.category && req.query.category !== 'All Categories') {
      query.category = req.query.category;
    }

    const items = await Item.find(query).populate({
      path: 'seller',
      select: 'firstName lastName universityEmail phone'
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get items for the current seller
// @route   GET /api/items/mine
// @access  Private
exports.getMyItems = async (req, res, next) => {
  try {
    const query = { seller: req.user.id };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    if (req.query.category && req.query.category !== 'All Categories') {
      query.category = req.query.category;
    }

    const items = await Item.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate({
      path: 'seller',
      select: 'firstName lastName universityEmail phone'
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res, next) => {
  try {
    if (req.file) {
      const uploadedUrl = req.file.secure_url || req.file.url || req.file.path;
      if (uploadedUrl) {
        req.body.imageUrl = uploadedUrl;
      }
    }

    // Add seller to req.body
    // Assuming authMiddleware adds user to req.user
    if (req.user) {
      req.body.seller = req.user.id;
      const sellerName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim();
      if (sellerName) req.body.sellerName = sellerName;
    }

    const item = await Item.create(req.body);
    await item.populate({
      path: 'seller',
      select: 'firstName lastName universityEmail phone'
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user is item seller or admin
    if (req.user && item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this item`
      });
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user is item seller or admin
    if (req.user && item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this item`
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
