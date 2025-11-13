require('dotenv').config();

module.exports = {
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || 'zarafet_db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    connectionLimit: 10
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'  //development or production
  },

  // CORS - Express 5 compatible
  cors: {
    origin: '*', // Allow all origins
    // credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
    // exposedHeaders: ['Content-Length', 'X-JSON']
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Local Storage Configuration
  storage: {
    uploadsDir: process.env.UPLOADS_DIR || 'uploads',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  },

  // Shipping Configuration
  pricing: {
    ukShippingCost: parseFloat(process.env.UK_SHIPPING_COST) || 6.99,
    internationalShippingCost: parseFloat(process.env.INTERNATIONAL_SHIPPING_COST) || 14.99,
    defaultShippingCost: parseFloat(process.env.DEFAULT_SHIPPING_COST) || 6.99, // Default to UK
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 10000000000000
  },

  // SMTP Configuration
  smtp: {
    email: process.env.SMTP_EMAIL,
    password: process.env.SMTP_PASSWORD
  },

  // Currency Configuration
  currency: {
    default: process.env.DEFAULT_CURRENCY || 'gbp',
    symbol: process.env.CURRENCY_SYMBOL || '£'
  }
};
