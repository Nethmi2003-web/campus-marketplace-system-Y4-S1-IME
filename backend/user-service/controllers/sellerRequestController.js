const asyncHandler = require("express-async-handler");
const SellerRequest = require("../models/SellerRequest");
const UserModel = require("../models/User");
const User = UserModel.default || UserModel;

// @desc    List seller registration requests
// @route   GET /api/admin/seller-requests?status=pending|approved|rejected|all
// @access  Private/Admin
const listSellerRequests = asyncHandler(async (req, res) => {
  const status = String(req.query.status || "pending").toLowerCase();
  const query = {};
  if (status && status !== "all") query.status = status;

  const requests = await SellerRequest.find(query)
    .sort("-createdAt")
    .populate({ path: "user", select: "firstName lastName faculty universityEmail phone role createdAt" })
    .populate({ path: "decidedBy", select: "firstName lastName universityEmail role" });

  res.status(200).json({ success: true, data: requests });
});

// @desc    Get a single seller request
// @route   GET /api/admin/seller-requests/:id
// @access  Private/Admin
const getSellerRequest = asyncHandler(async (req, res) => {
  const request = await SellerRequest.findById(req.params.id)
    .populate({ path: "user", select: "firstName lastName faculty universityEmail phone role createdAt" })
    .populate({ path: "decidedBy", select: "firstName lastName universityEmail role" });

  if (!request) {
    res.status(404);
    throw new Error("Seller request not found");
  }

  res.status(200).json({ success: true, data: request });
});

// @desc    Approve seller request (promote user to seller)
// @route   PUT /api/admin/seller-requests/:id/approve
// @access  Private/Admin
const approveSellerRequest = asyncHandler(async (req, res) => {
  const request = await SellerRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Seller request not found");
  }
  if (request.status !== "pending") {
    res.status(400);
    throw new Error("This request is already processed");
  }

  const user = await User.findById(request.user);
  if (!user) {
    res.status(404);
    throw new Error("User not found for this request");
  }

  user.role = "seller";
  await user.save();

  request.status = "approved";
  request.decidedAt = new Date();
  request.decidedBy = req.user?._id;
  request.rejectionReason = undefined;
  await request.save();

  await request.populate({ path: "user", select: "firstName lastName faculty universityEmail phone role createdAt" });
  await request.populate({ path: "decidedBy", select: "firstName lastName universityEmail role" });

  res.status(200).json({ success: true, data: request });
});

// @desc    Reject seller request
// @route   PUT /api/admin/seller-requests/:id/reject
// @access  Private/Admin
const rejectSellerRequest = asyncHandler(async (req, res) => {
  const request = await SellerRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Seller request not found");
  }
  if (request.status !== "pending") {
    res.status(400);
    throw new Error("This request is already processed");
  }

  request.status = "rejected";
  request.decidedAt = new Date();
  request.decidedBy = req.user?._id;
  request.rejectionReason = String(req.body?.reason || "").trim() || undefined;
  await request.save();

  await request.populate({ path: "user", select: "firstName lastName faculty universityEmail phone role createdAt" });
  await request.populate({ path: "decidedBy", select: "firstName lastName universityEmail role" });

  res.status(200).json({ success: true, data: request });
});

module.exports = {
  listSellerRequests,
  getSellerRequest,
  approveSellerRequest,
  rejectSellerRequest
};

