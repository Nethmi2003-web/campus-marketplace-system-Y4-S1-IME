const mongoose = require("mongoose");

const sellerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    decidedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User"
    },
    decidedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

sellerRequestSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("SellerRequest", sellerRequestSchema);

