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
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
    exposedHeaders: ['Content-Length', 'X-JSON']
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

  // Tax and Shipping Configuration
  pricing: {
    taxRate: parseFloat(process.env.TAX_RATE) || 0.10, // 10% default
    defaultShippingCost: parseFloat(process.env.DEFAULT_SHIPPING_COST) || 5.00,
    freeShippingThreshold: parseFloat(process.env.FREE_SHIPPING_THRESHOLD) || 100.00
  }
};
