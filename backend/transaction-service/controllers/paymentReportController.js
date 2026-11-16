const {
  createRecord,
  getRecord,
  listRecords
} = require('../../config/database');
const https = require('https');
const path = require('path');

const publicUser = (user, fields = ['firstName', 'lastName', 'universityEmail']) => {
  if (!user) return null;
  return Object.fromEntries([
    ['_id', user._id],
    ...fields.filter((field) => user[field] !== undefined).map((field) => [field, user[field]])
  ]);
};

const populateReport = async (report) => {
  const [user, sellers, order, products] = await Promise.all([
    getRecord('users', report.user),
    Promise.all((report.sellers || []).map((id) => getRecord('users', id))),
    getRecord('orders', report.order),
    Promise.all((report.products || []).map(async (id) => {
      const product = await getRecord('items', id);
      if (!product) return null;
      return {
        _id: product._id,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        category: product.category,
        seller: publicUser(await getRecord('users', product.seller)),
        sellerName: product.sellerName
      };
    }))
  ]);

  return {
    ...report,
    user: publicUser(user),
    sellers: sellers.map((seller) => publicUser(seller)),
    order: order
      ? {
          _id: order._id,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt
        }
      : null,
    products: products.filter(Boolean)
  };
};

exports.createPaymentReport = async (req, res, next) => {
  try {
    const { orderId, name, studentNumber, description, purchaseDate } = req.body;
    if (!orderId || !name || !studentNumber || !description || !purchaseDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const order = await getRecord('orders', orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Not allowed to report this order' });
    }

    const products = [...new Set((order.items || []).map((item) => item.product))];
    if (products.length === 0) {
      return res.status(400).json({ success: false, message: 'Order has no products' });
    }

    const productRecords = await Promise.all(products.map((id) => getRecord('items', id)));
    const sellers = [...new Set(productRecords.map((product) => product?.seller).filter(Boolean))];
    if (sellers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Unable to resolve seller for reported products'
      });
    }

    const parsedPurchaseDate = new Date(purchaseDate);
    if (Number.isNaN(parsedPurchaseDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid purchase date' });
    }

    const report = await createRecord('paymentReports', {
      user: req.user._id,
      sellers,
      order: order._id,
      products,
      name: String(name).trim(),
      studentNumber: String(studentNumber).trim(),
      description: String(description).trim(),
      purchaseDate: parsedPurchaseDate.toISOString(),
      slipUrl: req.file?.secure_url || req.file?.url || req.file?.path || null,
      slipPublicId: req.file?.public_id || req.file?.file_id || req.file?.filename || null,
      status: 'submitted'
    });

    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

exports.getAllPaymentReports = async (req, res, next) => {
  try {
    const reports = (await listRecords('paymentReports'))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.status(200).json({
      success: true,
      data: await Promise.all(reports.map(populateReport))
    });
  } catch (err) {
    next(err);
  }
};

exports.getSellerPaymentReports = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const reports = (await listRecords('paymentReports'))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const hydratedReports = await Promise.all(reports.map(populateReport));
    const data = hydratedReports.map((report) => {
      const sellerProducts = report.products.filter((product) => product.seller?._id === sellerId);
      const hasSeller = (report.sellers || []).some((seller) => seller?._id === sellerId);
      return hasSeller || sellerProducts.length > 0
        ? { ...report, products: sellerProducts }
        : null;
    }).filter(Boolean);

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentReportSlip = async (req, res, next) => {
  try {
    const report = await getRecord('paymentReports', req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Payment report not found' });

    const role = String(req.user?.role || '').toLowerCase();
    const isAdmin = role === 'admin' || role === 'sportadmin';
    const isBuyerOwner = report.user === req.user._id;
    const isSellerInReport = Array.isArray(report.sellers) && report.sellers.includes(req.user._id);
    const legacySellerMatch = role === 'seller' && !isSellerInReport
      ? (await Promise.all((report.products || []).map((id) => getRecord('items', id))))
        .some((product) => product?.seller === req.user._id)
      : false;

    if (!isAdmin && !isBuyerOwner && !isSellerInReport && !legacySellerMatch) {
      return res.status(403).json({ success: false, message: 'Not allowed to view this slip' });
    }
    if (!report.slipUrl) {
      return res.status(404).json({ success: false, message: 'No slip uploaded for this report' });
    }

    const proxyFile = (url, redirectsLeft = 3) => {
      https.get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirectsLeft > 0) {
          response.resume();
          return proxyFile(response.headers.location, redirectsLeft - 1);
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          response.resume();
          return res.status(502).json({ success: false, message: 'Failed to fetch slip from storage' });
        }

        res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
        let extension = '';
        try {
          extension = path.extname(new URL(url).pathname || '');
        } catch {
          extension = '';
        }
        const safeExtension = extension && extension.length <= 10 ? extension : '';
        res.setHeader('Content-Disposition', `inline; filename="payment-slip-${report._id}${safeExtension}"`);
        response.pipe(res);
      }).on('error', (err) => {
        console.error('Slip proxy error:', err.message);
        if (!res.headersSent) res.status(502).json({ success: false, message: 'Slip proxy error' });
      });
    };

    proxyFile(report.slipUrl);
  } catch (err) {
    next(err);
  }
};
