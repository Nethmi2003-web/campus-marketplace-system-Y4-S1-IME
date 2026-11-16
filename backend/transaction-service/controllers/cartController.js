const { database, getRecord } = require('../../config/database');

const cartRef = (userId) => database.ref(`carts/${userId}`);

const readOrCreateCart = async (userId) => {
  const ref = cartRef(userId);
  const now = new Date().toISOString();
  const result = await ref.transaction((current) => current || {
    user: userId,
    items: [],
    createdAt: now,
    updatedAt: now
  });
  return { ...result.snapshot.val(), _id: userId };
};

const populateCart = async (cart) => ({
  ...cart,
  items: await Promise.all((cart.items || []).map(async (item) => ({
    ...item,
    product: await getRecord('items', item.product)
  })))
});

exports.getCart = async (req, res, next) => {
  try {
    const cart = await readOrCreateCart(req.user._id);
    res.status(200).json({ success: true, data: await populateCart(cart) });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const productId = String(req.body.productId || '');
    const quantity = Number(req.body.quantity || 1);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ success: false, message: 'A valid product and quantity are required' });
    }

    const product = await getRecord('items', productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (quantity > Number(product.stockQuantity || 0)) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity || 0} items available in stock`
      });
    }

    const ref = cartRef(req.user._id);
    const now = new Date().toISOString();
    const result = await ref.transaction((current) => {
      const cart = current || { user: req.user._id, items: [], createdAt: now };
      const items = Array.isArray(cart.items) ? cart.items.slice() : [];
      const itemIndex = items.findIndex((entry) => entry.product === productId);
      const itemData = {
        product: productId,
        name: product.title,
        price: product.price,
        quantity,
        imageUrl: product.imageUrl,
        category: product.category,
        condition: product.condition
      };

      if (itemIndex >= 0) items[itemIndex] = itemData;
      else items.push(itemData);

      return { ...cart, items, updatedAt: now };
    });

    const cart = { ...result.snapshot.val(), _id: req.user._id };
    res.status(200).json({ success: true, data: await populateCart(cart) });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const ref = cartRef(req.user._id);
    const snapshot = await ref.get();
    if (!snapshot.exists()) return res.status(404).json({ success: false, message: 'Cart not found' });

    const now = new Date().toISOString();
    const result = await ref.transaction((current) => current
      ? {
          ...current,
          items: (current.items || []).filter((item) => item.product !== req.params.productId),
          updatedAt: now
        }
      : current);

    const cart = { ...result.snapshot.val(), _id: req.user._id };
    res.status(200).json({ success: true, data: await populateCart(cart) });
  } catch (err) {
    next(err);
  }
};
