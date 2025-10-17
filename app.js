const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./src/config/env');
const { swaggerUi, specs } = require('./src/config/swagger');

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

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.server.env}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server };
