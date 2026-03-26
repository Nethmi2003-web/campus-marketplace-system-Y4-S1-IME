const mongoose = require('mongoose');

const PaymentReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Item',
      required: true
    }
  ],
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentNumber: {
    type: String,
    required: true,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  slipUrl: {
    type: String
  },
  slipPublicId: {
    type: String
  },
  status: {
    type: String,
    enum: ['submitted', 'in_review', 'resolved', 'rejected'],
    default: 'submitted'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentReport', PaymentReportSchema);

