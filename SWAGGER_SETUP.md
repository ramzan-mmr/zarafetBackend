# Swagger API Documentation Setup

This document explains how to set up and use Swagger API documentation for the Zarafet Backend API.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Zarafet Backend API running

## 🚀 Installation

### 1. Install Dependencies

The required Swagger dependencies have been added to `package.json`:

```json
{
  "dependencies": {
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0"
  }
}
```

Install the dependencies:

```bash
npm install
```

### 2. Start the Server

```bash
npm run dev
```

## 📖 Accessing the Documentation

Once the server is running, you can access the Swagger documentation at:

**URL**: `http://localhost:3000/api-docs`

## 🔧 Configuration

### Swagger Configuration

The Swagger configuration is located in `src/config/swagger.js` and includes:

- **API Information**: Title, version, description
- **Server URLs**: Development and production endpoints
- **Security Schemes**: JWT Bearer token authentication
- **Data Models**: Reusable schemas for User, Product, Order, etc.
- **Error Responses**: Standardized error response formats

### Route Documentation

API routes are documented using JSDoc comments in the route files:

- `src/routes/auth.routes.js` - Authentication endpoints
- `src/routes/dashboard.routes.js` - Dashboard analytics endpoints
- `src/routes/products.routes.js` - Product management endpoints
- `src/docs/swagger-routes.js` - Additional route documentation

## 🎯 Features

### 1. Interactive API Testing

- **Try it out**: Test API endpoints directly from the documentation
- **Authentication**: Built-in JWT token authentication
- **Request/Response Examples**: Real examples for all endpoints

### 2. Comprehensive Documentation

- **All Endpoints**: Complete documentation for all API routes
- **Request/Response Schemas**: Detailed schema definitions
- **Error Handling**: Standardized error response documentation
- **Authentication**: Security requirements for each endpoint

### 3. Organized by Tags

- **Authentication**: Login, register, profile management
- **Dashboard**: Analytics and metrics endpoints
- **Products**: Product CRUD operations
- **Orders**: Order management
- **Customers**: Customer management
- **Users**: User management
- **Wishlist**: Wishlist and recently viewed

## 🔐 Authentication

### Using the Documentation

1. **Get Authentication Token**:
   - Use the `/auth/login` endpoint
   - Copy the token from the response

2. **Authorize Requests**:
   - Click the "Authorize" button in Swagger UI
   - Enter your token in the format: `Bearer your-token-here`
   - Click "Authorize"

3. **Test Protected Endpoints**:
   - All protected endpoints will now use your token
   - You can test any endpoint that requires authentication

### Example Login

```json
POST /auth/login
{
  "email": "miamohammedramzan99@gmail.com",
  "password": "reporting8664"
}
```

## 📊 Available Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `PUT /auth/me` - Update current user
- `GET /auth/verify` - Verify JWT token

### Dashboard (Admin/Manager only)
- `GET /dashboard/metrics` - Get dashboard metrics
- `GET /dashboard/sales-performance` - Get sales performance data
- `GET /dashboard/sales-by-category` - Get sales by category

### Products
- `GET /products` - List products
- `GET /products/{id}` - Get product by ID
- `POST /products` - Create product (Admin/Manager)
- `PUT /products/{id}` - Update product (Admin/Manager)
- `DELETE /products/{id}` - Delete product (Admin only)

### Orders
- `GET /orders` - List orders
- `GET /orders/{id}` - Get order by ID
- `POST /orders` - Create order
- `PUT /orders/{id}` - Update order status (Admin/Manager)
- `GET /orders/{id}/history` - Get order history (Admin/Manager)

### Users (Admin/Manager only)
- `GET /users` - List users
- `GET /users/{id}` - Get user by ID
- `POST /users` - Create user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user (Admin only)

### Customers (Admin/Manager only)
- `GET /customers` - List customers
- `GET /customers/{user_id}` - Get customer by ID
- `PUT /customers/{user_id}` - Update customer
- `GET /customers/{user_id}/addresses` - Get customer addresses
- `POST /customers/{user_id}/addresses` - Create address
- `PUT /customers/{user_id}/addresses/{id}` - Update address
- `DELETE /customers/{user_id}/addresses/{id}` - Delete address

### Wishlist & Recently Viewed
- `GET /me/wishlist` - Get user wishlist
- `POST /me/wishlist` - Add to wishlist
- `DELETE /me/wishlist/{product_id}` - Remove from wishlist
- `GET /me/recently-viewed` - Get recently viewed
- `POST /me/recently-viewed` - Add to recently viewed

## 🛠️ Customization

### Adding New Endpoints

1. **Add JSDoc Comments** to your route file:
```javascript
/**
 * @swagger
 * /your-endpoint:
 *   get:
 *     summary: Your endpoint description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success response
 */
```

2. **Update Swagger Configuration** if needed:
   - Add new schemas to `src/config/swagger.js`
   - Add new response types
   - Update server URLs

### Styling

The Swagger UI is customized with:
- Custom CSS to hide the top bar
- Custom site title: "Zarafet API Documentation"

## 🐛 Troubleshooting

### Common Issues

1. **Documentation not loading**:
   - Check if the server is running
   - Verify the URL: `http://localhost:3000/api-docs`
   - Check console for errors

2. **Authentication not working**:
   - Ensure you're using the correct token format: `Bearer your-token`
   - Check if the token is expired
   - Verify the user has the required permissions

3. **Endpoints not showing**:
   - Check if JSDoc comments are properly formatted
   - Verify the file paths in `swagger.js` configuration
   - Restart the server after making changes

### Debug Mode

To enable debug mode for Swagger:

```javascript
// In src/config/swagger.js
const options = {
  definition: {
    // ... your config
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/docs/*.js'
  ]
};
```

## 📝 Best Practices

1. **Keep Documentation Updated**: Update JSDoc comments when changing endpoints
2. **Use Consistent Naming**: Follow the same naming conventions for tags and schemas
3. **Provide Examples**: Always include example values in your documentation
4. **Document Errors**: Include all possible error responses
5. **Test Documentation**: Regularly test the documented endpoints

## 🔄 Updates

To update the documentation:

1. Make changes to route files or documentation files
2. Restart the server
3. Refresh the Swagger UI page
4. Test the updated endpoints

## 📞 Support

For issues with the Swagger documentation:

1. Check the server logs for errors
2. Verify all dependencies are installed
3. Ensure all route files have proper JSDoc comments
4. Check the Swagger configuration in `src/config/swagger.js`

---

**Note**: This documentation is automatically generated from the API code. Any changes to the API should be reflected in the corresponding JSDoc comments to keep the documentation up-to-date.
