const {
  createRecord,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord
} = require('../../config/database');

const categories = [
  'Books',
  'Electronics',
  'Lab Equipment',
  'Clothing & Uniforms',
  'Sports & Fitness',
  'Services & Tutoring',
  'Other'
];
const conditions = ['New', 'Like New', 'Used', 'Refurbished'];

const publicSeller = (seller) => {
  if (!seller) return null;
  return {
    _id: seller._id,
    firstName: seller.firstName,
    lastName: seller.lastName,
    universityEmail: seller.universityEmail,
    phone: seller.phone
  };
};

const populateSeller = async (item) => ({
  ...item,
  seller: publicSeller(await getRecord('users', item.seller))
});

const validateItem = (data, partial = false) => {
  if (!partial && (!data.title || !data.description || data.price === undefined || !data.category || !data.condition)) {
    return 'Please provide all required item fields';
  }
  if (data.title !== undefined && String(data.title).trim().length > 100) {
    return 'Title cannot be more than 100 characters';
  }
  if (data.description !== undefined && String(data.description).length > 500) {
    return 'Description cannot be more than 500 characters';
  }
  if (data.price !== undefined && (!Number.isFinite(Number(data.price)) || Number(data.price) < 0)) {
    return 'Price must be a non-negative number';
  }
  if (data.category !== undefined && !categories.includes(data.category)) {
    return 'Invalid item category';
  }
  if (data.condition !== undefined && !conditions.includes(data.condition)) {
    return 'Invalid item condition';
  }
  if (data.status !== undefined && !['available', 'pending', 'sold'].includes(data.status)) {
    return 'Invalid item status';
  }
  if (data.stockQuantity !== undefined && (!Number.isInteger(Number(data.stockQuantity)) || Number(data.stockQuantity) < 0)) {
    return 'Stock quantity must be a non-negative whole number';
  }
  return null;
};

exports.getItems = async (req, res, next) => {
  try {
    const category = req.query.category;
    const items = (await listRecords('items'))
      .filter((item) => item.status === 'available')
      .filter((item) => !category || category === 'All Categories' || item.category === category)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    res.status(200).json({
      success: true,
      count: items.length,
      data: await Promise.all(items.map(populateSeller))
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyItems = async (req, res, next) => {
  try {
    const items = (await listRecords('items'))
      .filter((item) => item.seller === req.user._id)
      .filter((item) => !req.query.status || req.query.status === 'all' || item.status === req.query.status)
      .filter((item) => !req.query.category || req.query.category === 'All Categories' || item.category === req.query.category)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const item = await getRecord('items', req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: await populateSeller(item) });
  } catch (err) {
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    if (req.file) {
      const uploadedUrl = req.file.secure_url || req.file.url || req.file.path;
      if (uploadedUrl) req.body.imageUrl = uploadedUrl;
    }

    const validationError = validateItem(req.body);
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const sellerName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
    const item = await createRecord('items', {
      title: String(req.body.title).trim(),
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      condition: req.body.condition,
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=500&auto=format&fit=crop',
      seller: req.user._id,
      sellerName,
      stockQuantity: Number(req.body.stockQuantity || 1),
      status: req.body.status || 'available'
    });

    res.status(201).json({ success: true, data: await populateSeller(item) });
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await getRecord('items', req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.seller !== req.user._id && !['admin', 'sportAdmin'].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to update this item`
      });
    }

    const allowedFields = ['title', 'description', 'price', 'category', 'condition', 'imageUrl', 'stockQuantity', 'status'];
    const updates = Object.fromEntries(
      allowedFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );
    const validationError = validateItem(updates, true);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stockQuantity !== undefined) updates.stockQuantity = Number(updates.stockQuantity);

    const updated = await updateRecord('items', item._id, updates);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const item = await getRecord('items', req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.seller !== req.user._id && !['admin', 'sportAdmin'].includes(req.user.role)) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user._id} is not authorized to delete this item`
      });
    }

    await deleteRecord('items', item._id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
