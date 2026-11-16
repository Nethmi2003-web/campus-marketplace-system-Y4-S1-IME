const { database, getRecord } = require('../../config/database');

const wishlistRef = (userId) => database.ref(`wishlists/${userId}`);

const readOrCreateWishlist = async (userId) => {
  const now = new Date().toISOString();
  const result = await wishlistRef(userId).transaction((current) => current || {
    user: userId,
    products: [],
    createdAt: now,
    updatedAt: now
  });
  return { ...result.snapshot.val(), _id: userId };
};

const populateWishlist = async (wishlist) => ({
  ...wishlist,
  products: await Promise.all((wishlist.products || []).map((id) => getRecord('items', id)))
});

exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await readOrCreateWishlist(req.user._id);
    res.status(200).json({ success: true, data: await populateWishlist(wishlist) });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const productId = String(req.body.productId || '');
    const product = productId ? await getRecord('items', productId) : null;
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const ref = wishlistRef(req.user._id);
    const now = new Date().toISOString();
    const result = await ref.transaction((current) => {
      const wishlist = current || { user: req.user._id, products: [], createdAt: now };
      const products = Array.isArray(wishlist.products) ? wishlist.products.slice() : [];
      if (products.includes(productId)) return;
      products.push(productId);
      return { ...wishlist, products, updatedAt: now };
    });

    if (!result.committed) {
      return res.status(400).json({ success: false, message: 'Item already in wishlist' });
    }

    const wishlist = { ...result.snapshot.val(), _id: req.user._id };
    res.status(200).json({ success: true, data: await populateWishlist(wishlist) });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const ref = wishlistRef(req.user._id);
    const snapshot = await ref.get();
    if (!snapshot.exists()) return res.status(404).json({ success: false, message: 'Wishlist not found' });

    const now = new Date().toISOString();
    const result = await ref.transaction((current) => current
      ? {
          ...current,
          products: (current.products || []).filter((id) => id !== req.params.productId),
          updatedAt: now
        }
      : current);

    const wishlist = { ...result.snapshot.val(), _id: req.user._id };
    res.status(200).json({ success: true, data: await populateWishlist(wishlist) });
  } catch (err) {
    next(err);
  }
};
