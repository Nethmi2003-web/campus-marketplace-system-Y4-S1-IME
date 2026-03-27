const PaymentReport = require('../models/PaymentReport');
const Order = require('../models/Order');
const Item = require('../../item-management/models/Item');
const https = require('https');
const path = require('path');

// @desc    Create payment report (buyer)
// @route   POST /api/payment-reports
// @access  Private
exports.createPaymentReport = async (req, res, next) => {
  try {
    const { orderId, name, studentNumber, description, purchaseDate } = req.body;

    if (!orderId || !name || !studentNumber || !description || !purchaseDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the buyer can report a payment issue for their own order.
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to report this order' });
    }

    const products = Array.from(new Set(order.items.map((i) => i.product.toString())));
    if (products.length === 0) {
      return res.status(400).json({ success: false, message: 'Order has no products' });
    }

    // Resolve seller(s) for the reported products so the report can be filtered per seller.
    const productDocs = await Item.find({ _id: { $in: products } }).select('seller');
    const sellers = Array.from(
      new Set(productDocs.map((p) => (p?.seller ? String(p.seller) : null)).filter(Boolean))
    );

    if (sellers.length === 0) {
      return res.status(400).json({ success: false, message: 'Unable to resolve seller for reported products' });
    }

    const slipUrl = req.file?.secure_url || req.file?.url || req.file?.path;
    const slipPublicId = req.file?.public_id || req.file?.file_id || req.file?.filename;

    const parsedPurchaseDate = new Date(purchaseDate);
    if (Number.isNaN(parsedPurchaseDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid purchase date' });
    }

    const report = await PaymentReport.create({
      user: req.user.id,
      sellers,
      order: order._id,
      products,
      name: String(name).trim(),
      studentNumber: String(studentNumber).trim(),
      description: String(description).trim(),
      purchaseDate: parsedPurchaseDate,
      slipUrl,
      slipPublicId
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all payment reports (admin)
// @route   GET /api/payment-reports
// @access  Private/Admin
exports.getAllPaymentReports = async (req, res, next) => {
  try {
    const reports = await PaymentReport.find()
      .populate('user', 'firstName lastName universityEmail')
      .populate('sellers', 'firstName lastName universityEmail')
      .populate('order', 'totalAmount paymentMethod paymentStatus createdAt')
      .populate('products', 'title imageUrl price category seller sellerName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get payment reports for the current seller (seller)
// @route   GET /api/payment-reports/seller
// @access  Private/Seller
exports.getSellerPaymentReports = async (req, res, next) => {
  try {
    const sellerId = String(req.user.id || req.user._id);

    // Include legacy reports created before the `sellers` field existed.
    const baseQuery = {
      $or: [{ sellers: sellerId }, { sellers: { $exists: false } }, { sellers: { $size: 0 } }]
    };

    const reports = await PaymentReport.find(baseQuery)
      .populate('user', 'firstName lastName universityEmail')
      .populate('order', 'totalAmount paymentMethod paymentStatus createdAt')
      .populate('products', 'title imageUrl price category seller sellerName')
      .sort('-createdAt');

    const filtered = reports
      .map((r) => r.toObject({ virtuals: true }))
      .map((r) => {
        const products = Array.isArray(r.products) ? r.products : [];
        const sellerProducts = products.filter((p) => {
          const pSeller = p?.seller?._id ? String(p.seller._id) : String(p?.seller || "");
          return pSeller === sellerId;
        });

        const sellers = Array.isArray(r.sellers) ? r.sellers.map((s) => String(s?._id || s)) : [];
        const matches = sellers.includes(sellerId) || sellerProducts.length > 0;
        return matches ? { ...r, products: sellerProducts } : null;
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: filtered
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Stream a payment slip (admin)
// @route   GET /api/payment-reports/:id/slip
// @access  Private (Admin, Seller-in-report, or the reporting buyer)
exports.getPaymentReportSlip = async (req, res, next) => {
  try {
    const report = await PaymentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Payment report not found' });
    }

    const role = String(req.user?.role || '').toLowerCase();
    const isAdmin = role === 'admin' || role === 'sportadmin';
    const isBuyerOwner = String(report.user) === String(req.user.id);
    let isSellerInReport = Array.isArray(report.sellers) && report.sellers.map(String).includes(String(req.user.id));

    // Legacy fallback: old reports may not have `sellers` stored yet.
    if (!isSellerInReport && role === 'seller' && Array.isArray(report.products) && report.products.length > 0) {
      const productDocs = await Item.find({ _id: { $in: report.products } }).select('seller');
      isSellerInReport = productDocs.some((p) => String(p?.seller || '') === String(req.user.id));
    }

    if (!isAdmin && !isBuyerOwner && !isSellerInReport) {
      return res.status(403).json({ success: false, message: 'Not allowed to view this slip' });
    }

    if (!report.slipUrl) {
      return res.status(404).json({ success: false, message: 'No slip uploaded for this report' });
    }

    // Proxy the Cloudinary file so the frontend can fetch with auth headers and open it as a blob.
    const proxyFile = (url, redirectsLeft = 3) => {
      https.get(url, (r) => {
        // Follow redirects (Cloudinary/CDN can redirect).
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && redirectsLeft > 0) {
          r.resume();
          return proxyFile(r.headers.location, redirectsLeft - 1);
        }

        if (r.statusCode < 200 || r.statusCode >= 300) {
          r.resume();
          return res.status(502).json({ success: false, message: 'Failed to fetch slip from storage' });
        }

        const contentType = r.headers['content-type'] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);

        // Avoid Cloudinary content-disposition and force inline viewing in the browser.
        let ext = '';
        try {
          const urlObj = new URL(url);
          ext = path.extname(urlObj.pathname || '');
        } catch (e) {
          ext = '';
        }
        const safeExt = ext && ext.length <= 10 ? ext : '';
        res.setHeader('Content-Disposition', `inline; filename=\"payment-slip-${report._id}${safeExt}\"`);

        r.pipe(res);
      }).on('error', (err) => {
        console.error('Slip proxy error:', err.message);
        res.status(502).json({ success: false, message: 'Slip proxy error' });
      });
    };

    proxyFile(report.slipUrl);
  } catch (err) {
    next(err);
  }
};
