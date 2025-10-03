const LookupValue = require('../models/LookupValue.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const Address = require('../models/Address.model');
const PublicModule = require('../models/public.module');
const jwt = require('../config/jwt');
const db = require('../config/db');

/**
 * Public controller for website APIs (no authentication required)
 */

// Get lookup values by header IDs for website
const getLookupValues = async (req, res) => {
  try {
    const { header_ids } = req.body;
    
    if (!header_ids || !Array.isArray(header_ids) || header_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'header_ids array is required'
      });
    }
    
    // Get all lookup values for the specified header IDs (only Active status)
    const values = await PublicModule.getLookupValues(header_ids);
    
    // Group values by header_id in the format {1: [], 2: []}
    const groupedValues = {};
    header_ids.forEach(headerId => {
      groupedValues[headerId] = values.filter(value => value.header_id === headerId);
    });
    
    // Return in the exact format requested
    res.json({
      success: true,
      data: groupedValues,
      message: 'Lookup values retrieved successfully'
    });
  } catch (error) {
    console.error('Get public lookup values error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lookup values'
    });
  }
};

// Get products with filters for website
const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      stock_status, 
      size, 
      color, 
      min_price, 
      max_price, 
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      // Frontend-friendly sorting options
      sort = 'newest', // newest, oldest, price_low_high, price_high_low, name_a_z, most_popular
      // Product type filtering
      type // trending, latest, featured
    } = req.query;

    // Build filters object
    const filters = {};
    
    // Handle multiple categories (comma-separated)
    if (category) {
      if (category.includes(',')) {
        // Multiple categories - we'll handle this in the query
        filters.categories = category.split(',').map(c => c.trim()).filter(c => c);
      } else {
        filters.category_value_id = category;
      }
    }
    
    if (stock_status) filters.stock_status = stock_status;
    if (min_price) filters.minPrice = min_price;
    if (max_price) filters.maxPrice = max_price;
    if (search) filters.search = search;
    if (type) filters.type = type;

    // Convert frontend-friendly sort options to backend format
    let finalSortBy = sort_by;
    let finalSortOrder = sort_order;
    
    if (sort) {
      switch (sort) {
        case 'newest':
          finalSortBy = 'created_at';
          finalSortOrder = 'DESC';
          break;
        case 'oldest':
          finalSortBy = 'created_at';
          finalSortOrder = 'ASC';
          break;
        case 'price_low_high':
          finalSortBy = 'price';
          finalSortOrder = 'ASC';
          break;
        case 'price_high_low':
          finalSortBy = 'price';
          finalSortOrder = 'DESC';
          break;
        case 'name_a_z':
          finalSortBy = 'name';
          finalSortOrder = 'ASC';
          break;
        case 'most_popular':
          // For now, fallback to newest products since total_orders field doesn't exist yet
          finalSortBy = 'created_at';
          finalSortOrder = 'DESC';
          break;
        default:
          // Keep the original sort_by and sort_order if sort is not recognized
          break;
      }
    }

    // Pagination
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy: finalSortBy,
      sortDir: finalSortOrder
    };

    // Get products with filters using public module
    const products = await PublicModule.getProductsByTypeWithFilters(type, {
      ...filters,
      size,
      color,
      limit: parseInt(limit)
    });
    const total = await PublicModule.countProducts(filters);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit)
      },
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Customer signup
const customerSignup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirm password do not match'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Get Customer role ID (assuming it's role_id 4 based on the database structure)
    const [roleRows] = await db.execute(
      "SELECT id FROM roles WHERE name = 'Customer'"
    );
    
    if (roleRows.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'Customer role not found'
      });
    }
    
    const customerRoleId = roleRows[0].id;
    
    // Create user with Customer role
    const userData = {
      name,
      email,
      password,
      role_id: customerRoleId,
      status: 'Active',
      phone: null // Set phone as null for customers who don't provide it during signup
    };
    
    const user = await User.create(userData);
    
    // Create customer profile
    await Customer.createProfile(user.id);
    
    // Generate token
    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role_name
    });
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name
        }
      },
      message: 'Customer registered successfully'
    });
  } catch (error) {
    console.error('Customer signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
};

// Customer login
const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is a customer
    if (user.role_name !== 'Customer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    // Update last login
    await User.updateLastLogin(user.id);
    
    // Generate token
    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role_name
    });
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};

// Get trending products
const getTrendingProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await PublicModule.getTrendingProducts(parseInt(limit));
    
    res.json({
      success: true,
      data: products,
      message: 'Trending products retrieved successfully'
    });
  } catch (error) {
    console.error('Get trending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending products'
    });
  }
};

// Get latest arrival products
const getLatestProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await PublicModule.getLatestProducts(parseInt(limit));
    
    res.json({
      success: true,
      data: products,
      message: 'Latest products retrieved successfully'
    });
  } catch (error) {
    console.error('Get latest products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest products'
    });
  }
};

// Get featured products (products with high discount or special status)
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await PublicModule.getFeaturedProducts(parseInt(limit));
    
    res.json({
      success: true,
      data: products,
      message: 'Featured products retrieved successfully'
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await PublicModule.getProductById(parseInt(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Address management for authenticated customers
const getAddresses = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const addresses = await Address.findAll(user_id);
    
    res.json({
      success: true,
      data: addresses,
      message: 'Addresses retrieved successfully'
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch addresses'
    });
  }
};

const createAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    const addressData = {
      ...req.body,
      user_id
    };
    
    const address = await Address.create(addressData);
    
    res.status(201).json({
      success: true,
      data: address,
      message: 'Address created successfully'
    });
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address'
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Verify address belongs to user
    if (existingAddress.user_id != user_id) {
      return res.status(403).json({
        success: false,
        message: 'Address does not belong to you'
      });
    }
    
    const addressData = {
      ...req.body,
      user_id
    };
    
    const address = await Address.update(id, addressData);
    
    res.json({
      success: true,
      data: address,
      message: 'Address updated successfully'
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update address'
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Verify address belongs to user
    if (existingAddress.user_id != user_id) {
      return res.status(403).json({
        success: false,
        message: 'Address does not belong to you'
      });
    }
    
    await Address.delete(id);
    
    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address'
    });
  }
};

const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const address = await Address.findById(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }
    
    // Verify address belongs to user
    if (address.user_id != user_id) {
      return res.status(403).json({
        success: false,
        message: 'Address does not belong to you'
      });
    }
    
    res.json({
      success: true,
      data: address,
      message: 'Address retrieved successfully'
    });
  } catch (error) {
    console.error('Get address by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch address'
    });
  }
};

module.exports = {
  getLookupValues,
  getProducts,
  customerSignup,
  customerLogin,
  getTrendingProducts,
  getLatestProducts,
  getFeaturedProducts,
  getProductById,
  // Address management
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById
  // Add more exports here as you add more methods
  // getCategories,
  // getSettings
};
