const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/env');
const { swaggerUi, specs } = require('./src/config/swagger');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const usersRoutes = require('./src/routes/users.routes');
const rolesRoutes = require('./src/routes/roles.routes');
const lookupsRoutes = require('./src/routes/lookups.routes');
const publicRoutes = require('./src/routes/public.routes');
const productsRoutes = require('./src/routes/products.routes');
const customersRoutes = require('./src/routes/customers.routes');
const ordersRoutes = require('./src/routes/orders.routes');
const paymentsRoutes = require('./src/routes/payments.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const wishlistRoutes = require('./src/routes/wishlist.routes');
const categoriesRoutes = require('./src/routes/categories.routes');

const app = express();

// CORS configuration - Express 4 compatible
app.use(cors({ origin: '*' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files with no restrictions
app.use('/uploads', express.static('uploads'));

// Request logging middleware
// app.use((req, res, next) => {
//   console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
//   next();
// });

// Swagger documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'Zarafet API Documentation'
// }));

// Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     timestamp: new Date().toISOString(),
//     environment: config.server.env
//   });
// });

// Simplified image serving - no restrictions
app.get('/uploads/products/:productId/:filename', (req, res) => {
  const { productId, filename } = req.params;
  res.sendFile(`${__dirname}/uploads/products/${productId}/${filename}`);
});

// Public API routes (no authentication required)
app.use('/public', publicRoutes);

// Protected API routes (authentication required)
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/roles', rolesRoutes);
app.use('/lookups', lookupsRoutes);
app.use('/products', productsRoutes);
app.use('/customers', customersRoutes);
app.use('/orders', ordersRoutes);
app.use('/payments', paymentsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/me', wishlistRoutes);
app.use('/categories', categoriesRoutes);

// 404 handler - Express 5 compatible
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.details
      }
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized access'
      }
    });
  }
  
  // Default error response
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.server.env}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server };
