# Zarafet Backend API - Quick Reference (Admin Dashboard)

> **⚠️ IMPORTANT**: This is for **ADMIN DASHBOARD** integration only, NOT for customer-facing websites.

## 🔗 Base URL
```
http://localhost:3000
```

## 🔐 Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 Available Endpoints

### Authentication
```
POST   /auth/login          - User login
POST   /auth/register       - User registration  
GET    /auth/me            - Get current user
PUT    /auth/me            - Update current user
```

### Users (Admin/Manager only)
```
GET    /users              - List users
GET    /users/:id          - Get user by ID
POST   /users              - Create user
PUT    /users/:id          - Update user
DELETE /users/:id          - Delete user (Admin only)
```

### Products
```
GET    /products           - List products (All users)
GET    /products/:id       - Get product by ID (All users)
POST   /products           - Create product (Admin/Manager)
PUT    /products/:id       - Update product (Admin/Manager)
DELETE /products/:id       - Delete product (Admin only)
```

### Orders
```
GET    /orders             - List orders (All users)
GET    /orders/:id         - Get order by ID (All users)
POST   /orders             - Place order (All users)
PUT    /orders/:id/status  - Update order status (Admin/Manager)
GET    /orders/:id/history - Get order history (Admin/Manager)
```

### Dashboard Analytics (Admin/Manager only)
```
GET    /dashboard/metrics           - Get dashboard metrics
GET    /dashboard/sales-performance - Get sales performance
GET    /dashboard/sales-by-category - Get sales by category
```

### Customers (Admin/Manager only)
```
GET    /customers                  - List customers
GET    /customers/:user_id         - Get customer by ID
PUT    /customers/:user_id         - Update customer
GET    /customers/:user_id/addresses - Get customer addresses
POST   /customers/:user_id/addresses - Create address
PUT    /customers/:user_id/addresses/:id - Update address
DELETE /customers/:user_id/addresses/:id - Delete address
```

### Lookups (Admin/Manager only)
```
GET    /lookups/headers     - List lookup headers
POST   /lookups/headers     - Create lookup header
PUT    /lookups/headers/:id - Update lookup header
DELETE /lookups/headers/:id - Delete lookup header
GET    /lookups/values      - List lookup values
GET    /lookups/values/:id  - Get lookup value
POST   /lookups/values      - Create lookup value
PUT    /lookups/values/:id  - Update lookup value
DELETE /lookups/values/:id  - Delete lookup value
```

### Wishlist & Recently Viewed
```
GET    /me/wishlist              - Get user wishlist
POST   /me/wishlist              - Add to wishlist
DELETE /me/wishlist/:product_id  - Remove from wishlist
GET    /me/recently-viewed       - Get recently viewed
POST   /me/recently-viewed       - Add to recently viewed
```

## 👥 User Roles

| Role | Level | Permissions |
|------|-------|-------------|
| Super_Admin | 1 | Full platform access |
| Admin | 2 | Manage catalog, orders, customers, lookups, users |
| Manager | 3 | Manage products, orders, customers |

## 📊 Response Format

### Success Response
```json
{
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## 🔍 Query Parameters

### Pagination
```
?page=1&limit=10
```

### Filtering
```
?status=Active&role_id=1&from=2024-01-01&to=2024-12-31
```

### Sorting
```
?sortBy=created_at&sortDir=desc
```

## 🧪 Test Credentials

### Super Admin
```
Email: miamohammedramzan99@gmail.com
Password: reporting8664
```

## 📝 Example Requests

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"miamohammedramzan99@gmail.com","password":"reporting8664"}'
```

### Get Products
```bash
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer <your-token>"
```

### Create Product
```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","price":99.99,"stock":100}'
```

### Get Dashboard Metrics
```bash
curl -X GET http://localhost:3000/dashboard/metrics \
  -H "Authorization: Bearer <your-token>"
```

## ⚠️ Common Error Codes

- `401` - Unauthorized (Invalid/missing token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Resource already exists)
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## 🔄 Rate Limiting

- **Auth endpoints**: 100 requests per 15 minutes
- **Order endpoints**: 100 requests per 15 minutes
- **Other endpoints**: No rate limiting

## 🏥 Health Check

```
GET /health
```

Returns server status and environment information.
