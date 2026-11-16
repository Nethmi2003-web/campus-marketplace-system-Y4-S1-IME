const {
  createRecord,
  database,
  deleteRecord,
  getRecord,
  listRecords,
  updateRecord
} = require('../../config/database');

const publicUser = (user, fields = ['firstName', 'lastName', 'universityEmail']) => {
  if (!user) return null;
  return Object.fromEntries([
    ['_id', user._id],
    ...fields.filter((field) => user[field] !== undefined).map((field) => [field, user[field]])
  ]);
};

const populateOrderItems = async (order, fields) => ({
  ...order,
  items: await Promise.all((order.items || []).map(async (item) => ({
    ...item,
    product: await getRecord('items', item.product).then((product) => {
      if (!product || !fields) return product;
      return Object.fromEntries([
        ['_id', product._id],
        ...fields.filter((field) => product[field] !== undefined).map((field) => [field, product[field]])
      ]);
    })
  })))
});

const populateOrder = async (order, { userFields, productFields } = {}) => {
  const [user, orderWithItems] = await Promise.all([
    userFields ? getRecord('users', order.user) : Promise.resolve(order.user),
    populateOrderItems(order, productFields)
  ]);
  return {
    ...orderWithItems,
    user: userFields ? publicUser(user, userFields) : order.user
  };
};

const changeStock = async (productId, quantity) => {
  const ref = database.ref(`items/${productId}`);
  const result = await ref.transaction((item) => {
    if (!item || Number(item.stockQuantity || 0) < quantity) return;
    const stockQuantity = Number(item.stockQuantity || 0) - quantity;
    return {
      ...item,
      stockQuantity,
      status: stockQuantity === 0 ? 'sold' : item.status,
      updatedAt: new Date().toISOString()
    };
  });
  return result.committed;
};

const restoreStock = async (productId, quantity) => {
  const ref = database.ref(`items/${productId}`);
  await ref.transaction((item) => {
    if (!item) return item;
    const stockQuantity = Number(item.stockQuantity || 0) + quantity;
    return {
      ...item,
      stockQuantity,
      status: item.status === 'sold' ? 'available' : item.status,
      updatedAt: new Date().toISOString()
    };
  });
};

exports.createOrder = async (req, res, next) => {
  const reservedItems = [];
  let createdOrder = null;
  try {
    const { paymentMethod, shippingAddress } = req.body;
    if (!['online', 'cash'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    const cartSnapshot = await database.ref(`carts/${req.user._id}`).get();
    const cart = cartSnapshot.val();
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const settingsSnapshot = await database.ref('settings/platform').get();
    const platformFeeRate = Number(settingsSnapshot.val()?.platformFee ?? 5);
    const products = await Promise.all(cart.items.map((entry) => getRecord('items', entry.product)));
    if (products.some((product) => !product)) {
      return res.status(400).json({ success: false, message: 'One or more cart products are no longer available' });
    }

    const orderItems = cart.items.map((entry, index) => ({
      product: products[index]._id,
      quantity: Number(entry.quantity),
      price: Number(products[index].price)
    }));
    if (orderItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return res.status(400).json({ success: false, message: 'Cart contains an invalid quantity' });
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const platformFee = Math.round(subtotal * platformFeeRate / 100);
    const totalAmount = subtotal + platformFee;

    for (const item of orderItems) {
      if (!(await changeStock(item.product, item.quantity))) {
        throw Object.assign(new Error('Insufficient stock for one or more items'), { statusCode: 400 });
      }
      reservedItems.push(item);
    }

    createdOrder = await createRecord('orders', {
      user: req.user._id,
      items: orderItems,
      subtotal,
      platformFee,
      totalAmount,
      paymentMethod,
      shippingAddress: shippingAddress || '',
      paymentStatus: paymentMethod === 'online' ? 'completed' : 'pending',
      orderStatus: 'pending'
    });

    await database.ref(`carts/${req.user._id}`).update({
      items: [],
      updatedAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, data: createdOrder });
  } catch (err) {
    if (createdOrder) await deleteRecord('orders', createdOrder._id);
    await Promise.all(reservedItems.map((item) => restoreStock(item.product, item.quantity)));
    if (err.statusCode) return res.status(err.statusCode).json({ success: false, message: err.message });
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = (await listRecords('orders'))
      .filter((order) => order.user === req.user._id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const data = await Promise.all(orders.map((order) =>
      populateOrder(order, { productFields: ['title', 'imageUrl', 'price'] })
    ));
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = (await listRecords('orders'))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const data = await Promise.all(orders.map((order) =>
      populateOrder(order, {
        userFields: ['firstName', 'lastName', 'universityEmail'],
        productFields: ['title', 'price']
      })
    ));
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const allowedOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const allowedPaymentStatuses = ['pending', 'completed', 'failed'];
    if (orderStatus && !allowedOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }
    if (paymentStatus && !allowedPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const order = await getRecord('orders', req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    const updated = await updateRecord('orders', order._id, updates);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.getUserAnalytics = async (req, res, next) => {
  try {
    const orders = (await listRecords('orders')).filter((order) => order.user === req.user._id);
    const completed = orders.filter((order) => order.paymentStatus === 'completed');
    const totalSpent = completed.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const platformFees = completed.reduce((sum, order) => sum + Number(order.platformFee || 0), 0);
    const itemsPurchased = completed.reduce(
      (sum, order) => sum + (order.items || []).reduce((count, item) => count + Number(item.quantity || 0), 0),
      0
    );

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = new Map();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthlyData.set(months[date.getMonth()], 0);
    }
    for (const order of completed) {
      const month = months[new Date(order.createdAt).getMonth()];
      if (monthlyData.has(month)) monthlyData.set(month, monthlyData.get(month) + Number(order.totalAmount || 0));
    }

    const completedOrders = await Promise.all(completed
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((order) => populateOrder(order, {
        productFields: ['title', 'imageUrl', 'price', 'category']
      })));

    res.status(200).json({
      success: true,
      data: {
        totalSpent,
        itemsPurchased,
        platformFees,
        monthlySpending: [...monthlyData].map(([month, amount]) => ({ month, amount })),
        pendingOrders: orders.filter((order) => order.orderStatus === 'pending').length,
        completedOrders
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSellerAnalytics = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const orders = (await listRecords('orders'))
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const sellerOrders = [];

    for (const order of orders) {
      const user = await getRecord('users', order.user);
      const products = await Promise.all((order.items || []).map(async (entry) => ({
        ...entry,
        product: await getRecord('items', entry.product)
      })));
      const sellerItems = products.filter((entry) => entry.product?.seller === sellerId);
      if (sellerItems.length === 0) continue;

      const sellerSubtotal = sellerItems.reduce(
        (sum, entry) => sum + Number(entry.price || 0) * Number(entry.quantity || 0),
        0
      );
      const subtotal = Number(order.subtotal || 0);
      const feeShare = subtotal > 0
        ? Math.round(Number(order.platformFee || 0) * (sellerSubtotal / subtotal))
        : 0;

      sellerOrders.push({
        _id: order._id,
        user: publicUser(user),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        orderSubtotal: order.subtotal,
        orderPlatformFee: order.platformFee,
        orderTotalAmount: order.totalAmount,
        sellerSubtotal,
        platformFeeShare: feeShare,
        items: sellerItems
      });
    }

    const completed = sellerOrders.filter((order) => order.paymentStatus === 'completed');
    const pending = sellerOrders.filter((order) => order.paymentStatus === 'pending');
    const totalRevenue = completed.reduce((sum, order) => sum + Number(order.sellerSubtotal || 0), 0);
    const itemsSold = completed.reduce(
      (sum, order) => sum + (order.items || []).reduce((count, item) => count + Number(item.quantity || 0), 0),
      0
    );

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        itemsSold,
        completedOrders: completed.length,
        pendingOrders: pending.length,
        orders: sellerOrders
      }
    });
  } catch (err) {
    next(err);
  }
};
