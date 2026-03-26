const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  platformFee: {
    type: Number,
    required: true,
    default: 5,
    min: 0,
    max: 100
  },
  // We can add more global settings here later
}, { timestamps: true });

// Ensure only one settings document exists
SettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ platformFee: 5 });
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
