# Zarafet Backend API

A robust e-commerce backend API built with Node.js, Express, and MySQL for the Zarafet fashion platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Manager, Staff)
- **User Management**: Complete user CRUD operations with role management
- **Product Management**: Full product catalog with variants, images, and inventory tracking
- **Order Management**: Order placement, status tracking, and history
- **Customer Management**: Customer profiles, addresses, and order history
- **Wishlist & Recently Viewed**: Personal shopping features
- **Dashboard Analytics**: Sales metrics, performance tracking, and category analysis
- **Lookup System**: Flexible lookup tables for categories, brands, cities, etc.
- **Data Validation**: Comprehensive input validation using Joi
- **Security**: Helmet, CORS, rate limiting, and password hashing
- **Database**: MySQL with connection pooling and transactions

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zarafet-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=zarafet_db
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   ```

4. **Set up the database**
   ```bash
   # Create the database
   mysql -u root -p -e "CREATE DATABASE zarafet_db;"
   
   # Run the database schema
   mysql -u root -p zarafet_db < db.sql
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📚 API Documentation

### Authentication Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile
- `PUT /auth/me` - Update current user profile

### User Management (Admin/Manager)

- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

### Product Management

- `GET /products` - List products (with filters, pagination, search)
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (Manager/Admin)
- `PUT /products/:id` - Update product (Manager/Admin)
- `DELETE /products/:id` - Delete product (Admin only)

### Order Management

- `GET /orders` - List orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Place new order
- `PUT /orders/:id/status` - Update order status (Manager/Admin)
- `GET /orders/:id/history` - Get order status history

### Customer Management (Manager/Admin)

- `GET /customers` - List customers
- `GET /customers/:user_id` - Get customer by ID
- `PUT /customers/:user_id` - Update customer
- `GET /customers/:user_id/addresses` - Get customer addresses
- `POST /customers/:user_id/addresses` - Add customer address
- `PUT /customers/:user_id/addresses/:id` - Update address
- `DELETE /customers/:user_id/addresses/:id` - Delete address

### Wishlist & Recently Viewed

- `GET /me/wishlist` - Get user's wishlist
- `POST /me/wishlist` - Add product to wishlist
- `DELETE /me/wishlist/:product_id` - Remove from wishlist
- `GET /me/recently-viewed` - Get recently viewed products
- `POST /me/recently-viewed` - Add to recently viewed

### Dashboard (Manager/Admin)

- `GET /dashboard/metrics` - Get dashboard metrics
- `GET /dashboard/sales-performance` - Get sales performance data
- `GET /dashboard/sales-by-category` - Get sales by category

### Lookup Management (Manager/Admin)

- `GET /lookups/headers` - List lookup headers
- `POST /lookups/headers` - Create lookup header
- `PUT /lookups/headers/:id` - Update lookup header
- `DELETE /lookups/headers/:id` - Delete lookup header
- `GET /lookups/values` - List lookup values
- `GET /lookups/values/:id` - Get lookup value
- `POST /lookups/values` - Create lookup value
- `PUT /lookups/values/:id` - Update lookup value
- `DELETE /lookups/values/:id` - Delete lookup value

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Default Admin Credentials

After running the seed script, you can login with:
- **Email**: admin@zarafet.com
- **Password**: admin123

## 📊 Response Format

### Success Response
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": [...]
  }
}
```

## 🗄️ Database Schema

The database includes the following main tables:

- **users** - User accounts with roles
- **roles** - User roles (Admin, Manager, Staff)
- **products** - Product catalog
- **product_variants** - Product size/color variants
- **product_images** - Product images
- **orders** - Customer orders
- **order_items** - Order line items
- **customers** - Customer profiles
- **addresses** - Customer addresses
- **wishlists** - User wishlists
- **recently_viewed** - Recently viewed products
- **lookup_headers** - Lookup table headers
- **lookup_values** - Lookup table values

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions
- **Rate Limiting**: Prevents abuse
- **CORS Protection**: Configurable cross-origin policies
- **Helmet**: Security headers
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries

## 🔧 Configuration

The application uses environment variables for configuration. See `env.example` for all available options.

## 📝 Development

### Project Structure
```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── seeds/           # Database seeds
├── utils/           # Utility functions
├── validators/      # Joi validation schemas
├── app.js           # Express app setup
└── server.js        # Server startup
```

### Adding New Features

1. Create model in `src/models/`
2. Add validation schemas in `src/validators/`
3. Implement controller in `src/controllers/`
4. Define routes in `src/routes/`
5. Update main app.js to include new routes

## 🚀 Deployment

1. Set production environment variables
2. Build the application: `npm install --production`
3. Start the server: `npm start`
4. Use a process manager like PM2 for production

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.
