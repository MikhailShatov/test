const express = require('express');
const metricsMiddleware = require('./middleware/metricsMiddleware');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const healthRoutes = require('./routes/healthRoutes');
const metricsRoutes = require('./routes/metricsRoutes');
const mockRoutes = require('./routes/mockRoutes');

const app = express();

app.use(express.json());
app.use(metricsMiddleware);

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/health', healthRoutes);
app.use('/metrics', metricsRoutes);
app.use('/mock', mockRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    message: 'Internal server error',
    details: error.message
  });
});

module.exports = app;