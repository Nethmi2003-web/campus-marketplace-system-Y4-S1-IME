const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');

// @desc    Get global platform settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({ platformFee: 5 });
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update global platform settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findOneAndUpdate({}, req.body, {
      new: true,
      runValidators: true
    });
  }

  res.status(200).json({
    success: true,
    data: settings
  });
});
