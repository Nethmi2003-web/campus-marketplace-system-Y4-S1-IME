const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./user-service/routes/userRoutes'));
app.use('/api/items', require('./item-management/routes/itemRoutes'));
app.use('/api/cart', require('./transaction-service/routes/cartRoutes'));
app.use('/api/orders', require('./transaction-service/routes/orderRoutes'));
app.use('/api/wishlist', require('./transaction-service/routes/wishlistRoutes'));
app.use('/api/payment-reports', require('./transaction-service/routes/paymentReportRoutes'));
app.use('/api/events', require('./makrketPlace_features/routes/eventRoutes'));
app.use('/api/settings', require('./item-management/routes/settingsRoutes'));
app.use('/api/admin', require('./user-service/routes/adminRoutes'));

app.get('/', (req, res) => {
  res.json({ message: '🎓 UNI SWAP Campus MarketPlace API is running!' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
