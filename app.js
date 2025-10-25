const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/env');

// Import email service
const { sendEmail, sendOrderConfirmation, sendOrderStatusUpdate } = require('./src/services/email.service');

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
const promoCodeRoutes = require('./src/routes/promoCode.routes');

const app = express();

// Trust proxy for rate limiting and IP detection
app.set('trust proxy', true);

// Security middleware with image-friendly configuration
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "http:", "https:", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// CORS configuration
app.use(cors(config.cors));

// Additional CORS middleware for images
app.use((req, res, next) => {
  // Allow all origins for image requests
  if (req.path.startsWith('/uploads/')) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Override security headers for images
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.removeHeader('Content-Security-Policy');
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.'
    }
  }
});

// Apply rate limiting to auth and orders
app.use('/auth', limiter);
app.use('/orders', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set CORS headers for static files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  
  // Override security headers for images
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.removeHeader('Content-Security-Policy');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
}, express.static('uploads', {
  setHeaders: (res, path) => {
    // Set additional headers for images
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.removeHeader('Content-Security-Policy');
    }
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.server.env
  });
});

// Test email functions (called directly, not as API endpoints)
// const testEmailFunction = async () => {
//   try {
//     console.log('🧪 Testing basic email functionality...');
    
//     const result = await sendEmail({
//       to: 'mianmuhammadramzan99@gmail.com',
//       subject: 'Zarafet Email Service Test',
//       text: 'This is a test email from Zarafet email service to verify that the email functionality is working correctly.',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
//           <h2 style="color: #28a745; text-align: center;">✅ Email Service Test</h2>
//           <p style="font-size: 16px; line-height: 1.6;">This is a test email from <strong>Zarafet email service</strong> to verify that the email functionality is working correctly.</p>
//           <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//             <p style="margin: 0; color: #495057;"><strong>Test Details:</strong></p>
//             <ul style="margin: 10px 0; color: #495057;">
//               <li>Service: Zarafet Email Service</li>
//               <li>Test Type: Basic Email Functionality</li>
//               <li>Status: ✅ Working</li>
//               <li>SMTP Host: business113.web-hosting.com</li>
//             </ul>
//           </div>
//           <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
//             Test completed at: ${new Date().toLocaleString()}
//           </p>
//         </div>
//       `
//     });

//     if (result.success) {
//       console.log('✅ Test email sent successfully!');
//       console.log(`📧 Message ID: ${result.messageId}`);
//     } else {
//       console.log('❌ Test email failed:', result.error);
//     }
//   } catch (error) {
//     console.error('❌ Test email error:', error);
//   }
// };

// const testOrderEmailFunction = async () => {
//   try {
//     console.log('🧪 Testing order confirmation email...');
    
//     const mockOrderData = {
//       order: {
//         id: 999,
//         code: 'ORD-TEST-001',
//         created_at: new Date().toISOString(),
//         status_name: 'Processing'
//       },
//       items: [
//         {
//           product_name: 'Test Product 1',
//           variant_name: 'Red - Large',
//           quantity: 2,
//           unit_price: 25.99
//         },
//         {
//           product_name: 'Test Product 2',
//           variant_name: 'Blue - Medium',
//           quantity: 1,
//           unit_price: 15.50
//         }
//       ],
//       totals: {
//         subtotal: 67.48,
//         tax: 6.75,
//         shipping: 5.00,
//         total: 79.23
//       },
//       address: {
//         line1: '123 Test Street',
//         line2: 'Apt 4B',
//         city: 'Test City',
//         postal_code: '12345',
//         phone: '+1-555-0123'
//       }
//     };

//     const result = await sendOrderConfirmation({
//       userEmail: 'mianmuhammadramzan99@gmail.com',
//       userName: 'Test User',
//       orderData: mockOrderData
//     });

//     if (result.success) {
//       console.log('✅ Order confirmation email sent successfully!');
//       console.log(`📧 Message ID: ${result.messageId}`);
//     } else {
//       console.log('❌ Order confirmation email failed:', result.error);
//     }
//   } catch (error) {
//     console.error('❌ Order email test error:', error);
//   }
// };

// const testStatusEmailFunction = async () => {
//   try {
//     console.log('🧪 Testing order status update email...');
    
//     const result = await sendOrderStatusUpdate({
//       userEmail: 'mianmuhammadramzan99@gmail.com',
//       userName: 'Test User',
//       orderData: {
//         order: {
//           code: 'ORD-TEST-001'
//         }
//       },
//       newStatus: 'Shipped'
//     });

//     if (result.success) {
//       console.log('✅ Order status update email sent successfully!');
//       console.log(`📧 Message ID: ${result.messageId}`);
//     } else {
//       console.log('❌ Order status update email failed:', result.error);
//     }
//   } catch (error) {
//     console.error('❌ Status email test error:', error);
//   }
// };

// Specific route for serving images with proper CORS headers
app.get('/uploads/products/:productId/:filename', (req, res) => {
  const { productId, filename } = req.params;
  
  // Set comprehensive CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Cache-Control', 'public, max-age=31536000');
  
  // Override security headers for images
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.removeHeader('Content-Security-Policy');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Set content type for images
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };
  
  if (mimeTypes[ext]) {
    res.type(mimeTypes[ext]);
  }
  
  // Serve the file
  res.sendFile(`${__dirname}/uploads/products/${productId}/${filename}`, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({
        error: {
          code: 'IMAGE_NOT_FOUND',
          message: 'Image not found'
        }
      });
    }
  });
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
app.use('/promo-codes', promoCodeRoutes);

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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = { app, server };
