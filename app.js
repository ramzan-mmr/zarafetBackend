const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const config = require('./src/config/env');

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

// Trust only the first proxy (recommended for rate limiting behind one proxy like Nginx)
// app.set('trust proxy', 1);

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

// Test email endpoint with logging and debugging
app.post('/test-email', async (req, res) => {
  const logDir = path.join(__dirname, 'logs');
  const logFile = path.join(logDir, 'email-test.log');
  
  // Ensure logs directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Helper function to write to log file
  const writeLog = (message, isError = false) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${isError ? 'ERROR:' : 'INFO:'} ${message}\n`;
    
    console.log(logMessage.trim());
    
    try {
      fs.appendFileSync(logFile, logMessage, 'utf8');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  };
  
  const { to: recipientEmail, subject = 'Zarafet Test Email', text = 'This is a test email from Zarafet' } = req.body;
  
  writeLog('=== EMAIL TEST STARTED ===');
  writeLog(`Request received - To: ${recipientEmail || 'Not provided'}, Subject: ${subject}`);
  
  if (!recipientEmail) {
    writeLog('ERROR: Email recipient (to) is required', true);
    return res.status(400).json({
      error: {
        code: 'MISSING_EMAIL',
        message: 'Email recipient (to) is required'
      }
    });
  }
  
  try {
    writeLog('Creating nodemailer transporter...');
    writeLog(`SMTP Config - Host: smtpout.secureserver.net, Port: 465, Secure: true`);
    writeLog(`SMTP Email: ${config.smtp.email ? 'Set' : 'NOT SET'}`);
    writeLog(`SMTP Password: ${config.smtp.password ? 'Set' : 'NOT SET'}`);
    
    // Create transporter with debug enabled
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 465,
      secure: true,
      auth: {
        user: config.smtp.email,
        pass: config.smtp.password
      },
      tls: {
        rejectUnauthorized: false
      },
      debug: true, // Enable debugging
      logger: true  // Enable logging
    });
    
    writeLog('Transporter created successfully');
    
    // Verify transporter connection
    writeLog('Verifying SMTP connection...');
    await transporter.verify();
    writeLog('✅ SMTP connection verified successfully');
    
    // Prepare email message
    const message = {
      from: `Zarafet <${config.smtp.email}>`,
      to: recipientEmail,
      subject: subject,
      text: text,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Zarafet Test Email</h2>
        <p>${text}</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This is a test email sent at ${new Date().toLocaleString()}</p>
      </div>`
    };
    
    writeLog(`Preparing to send email to: ${recipientEmail}`);
    writeLog(`Subject: ${subject}`);
    writeLog(`Text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    
    // Send email
    const startTime = Date.now();
    writeLog('Sending email...');
    
    const result = await transporter.sendMail(message);
    
    const duration = Date.now() - startTime;
    writeLog(`✅ Email sent successfully in ${duration}ms`);
    writeLog(`Message ID: ${result.messageId}`);
    writeLog(`Response: ${JSON.stringify(result.response)}`);
    writeLog('=== EMAIL TEST COMPLETED SUCCESSFULLY ===');
    
    res.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
      response: result.response,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorMessage = error.message || 'Unknown error';
    const errorStack = error.stack || 'No stack trace';
    
    writeLog('❌ EMAIL TEST FAILED', true);
    writeLog(`Error: ${errorMessage}`, true);
    writeLog(`Stack: ${errorStack}`, true);
    writeLog(`Full Error: ${JSON.stringify(error, null, 2)}`, true);
    writeLog('=== EMAIL TEST FAILED ===');
    
    res.status(500).json({
      error: {
        code: 'EMAIL_SEND_FAILED',
        message: errorMessage,
        details: errorStack
      }
    });
  }
});

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
