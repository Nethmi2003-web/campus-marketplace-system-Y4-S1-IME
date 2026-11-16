const asyncHandler = require('express-async-handler');
const { database } = require('../../config/database');

const settingsRef = database.ref('settings/platform');

exports.getSettings = asyncHandler(async (req, res) => {
  const snapshot = await settingsRef.get();
  let settings = snapshot.val();
  if (!settings) {
    settings = {
      platformFee: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await settingsRef.set(settings);
  }

  res.status(200).json({ success: true, data: { ...settings, _id: 'platform' } });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const platformFee = Number(req.body.platformFee);
  if (!Number.isFinite(platformFee) || platformFee < 0 || platformFee > 100) {
    res.status(400);
    throw new Error('Platform fee must be a number between 0 and 100');
  }

  const ref = settingsRef;
  const result = await ref.transaction((current) => ({
    ...(current || { createdAt: new Date().toISOString() }),
    platformFee,
    updatedAt: new Date().toISOString()
  }));
  res.status(200).json({ success: true, data: { ...result.snapshot.val(), _id: 'platform' } });
});
