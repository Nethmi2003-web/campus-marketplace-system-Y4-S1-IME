const asyncHandler = require('express-async-handler');
const {
  getRecord,
  listRecords,
  updateRecord
} = require('../../config/database');

const publicUser = (user) => {
  if (!user) return null;
  const { passwordHash, password, ...safeUser } = user;
  return safeUser;
};

const populateRequest = async (request) => {
  if (!request) return null;
  const [user, decidedBy] = await Promise.all([
    getRecord('users', request.user),
    request.decidedBy ? getRecord('users', request.decidedBy) : null
  ]);
  return {
    ...request,
    user: publicUser(user),
    decidedBy: publicUser(decidedBy)
  };
};

const listSellerRequests = asyncHandler(async (req, res) => {
  const status = String(req.query.status || 'pending').toLowerCase();
  const requests = (await listRecords('sellerRequests'))
    .filter((request) => status === 'all' || request.status === status)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  res.status(200).json({
    success: true,
    data: await Promise.all(requests.map(populateRequest))
  });
});

const getSellerRequest = asyncHandler(async (req, res) => {
  const request = await getRecord('sellerRequests', req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Seller request not found');
  }
  res.status(200).json({ success: true, data: await populateRequest(request) });
});

const approveSellerRequest = asyncHandler(async (req, res) => {
  const request = await getRecord('sellerRequests', req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Seller request not found');
  }
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error('This request is already processed');
  }

  const user = await updateRecord('users', request.user, { role: 'seller' });
  if (!user) {
    res.status(404);
    throw new Error('User not found for this request');
  }

  const updated = await updateRecord('sellerRequests', request._id, {
    status: 'approved',
    decidedAt: new Date().toISOString(),
    decidedBy: req.user._id,
    rejectionReason: null
  });

  res.status(200).json({ success: true, data: await populateRequest(updated) });
});

const rejectSellerRequest = asyncHandler(async (req, res) => {
  const request = await getRecord('sellerRequests', req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Seller request not found');
  }
  if (request.status !== 'pending') {
    res.status(400);
    throw new Error('This request is already processed');
  }

  const updated = await updateRecord('sellerRequests', request._id, {
    status: 'rejected',
    decidedAt: new Date().toISOString(),
    decidedBy: req.user._id,
    rejectionReason: String(req.body.reason || '').trim() || null
  });

  res.status(200).json({ success: true, data: await populateRequest(updated) });
});

module.exports = {
  listSellerRequests,
  getSellerRequest,
  approveSellerRequest,
  rejectSellerRequest
};
