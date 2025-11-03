const LookupValue = require('../models/LookupValue.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Customer = require('../models/Customer.model');
const Address = require('../models/Address.model');
const Category = require('../models/Category.model');
const PublicModule = require('../models/public.module');
const OTP = require('../models/OTP.model');
const jwt = require('../config/jwt');
const db = require('../config/db');
const { generateCode } = require('../utils/sql');
const { sendEmail, sendOTPVerificationEmail, sendPasswordResetEmail, sendContactEmail, sendSubscriptionConfirmation } = require('../services/email.service');

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
      limit: parseInt(limit),
      page: parseInt(page)
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
    console.log(name, email, password, confirmPassword);
    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(200).json({
        success: false,
        message: 'Password and confirm password do not match'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(200).json({
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
      phone: null, // Set phone as null for customers who don't provide it during signup
      user_type: 'customer'
    };
    const user = await User.create(userData);
    // Create customer profile
    await Customer.createProfile(user.id);
    
    // Create and send OTP for email verification
    const otpData = await OTP.create(user.id, email);
    await sendOTPVerificationEmail(user, otpData.otpCode);
    
    // Generate token
    const token = jwt.generateToken({
      id: user.id,
      email: user.email,
      role: user.role_name
    });
    
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role_name,
          email_verified: false
        },
        otpExpiresAt: otpData.expiresAt
      },
      message: 'Customer registered successfully. Please check your email for verification code.'
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
    console.log(email, password);

    // Find CUSTOMER user specifically using user_type
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.status = 'Active' AND u.user_type = 'customer'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(200).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Use the customer user
    const user = users[0];
    
    // Check password
    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(200).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(200).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    
    // Check if email is verified
    if (!user.email_verified) {
      console.log('🔍 Backend: User email not verified, sending OTP');
      // Send OTP email for unverified user trying to login
      const otpData = await OTP.create(user.id, email);
      await sendOTPVerificationEmail(user, otpData.otpCode);
      
      const response = {
        success: false,
        message: 'Please check your email for the verification code to continue',
        needsVerification: true,
        email: user.email,
        otpExpiresAt: otpData.expiresAt
      };
      
      console.log('🔍 Backend: Sending needsVerification response:', response);
      return res.status(200).json(response);
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
          role: user.role_name,
          email_verified: user.email_verified
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

// Get recommended products (mix of trending, latest, and featured)
const getRecommendedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await PublicModule.getRecommendedProducts(parseInt(limit));
    
    res.json({
      success: true,
      data: products,
      message: 'Recommended products retrieved successfully'
    });
  } catch (error) {
    console.error('Get recommended products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended products'
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

// Get multiple products by IDs
const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required. Use comma-separated values like: ?ids=1,2,3'
      });
    }
    
    // Parse comma-separated IDs
    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid product ID is required'
      });
    }
    
    const products = await PublicModule.getProductsByIds(productIds);
    
    res.json({
      success: true,
      data: products,
      message: `Retrieved ${products.length} products successfully`
    });
  } catch (error) {
    console.error('Get products by IDs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
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

// Get all categories (public)
const getCategories = async (req, res) => {
  try {
    const { status = 'Active' } = req.query;
    const categories = await Category.findAll({ status });
    
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Removed: getRootCategories, getCategoryHierarchy, getCategoryById, getCategoriesByParent - keeping it simple

// Wishlist management for authenticated customers
const getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const Wishlist = require('../models/Wishlist.model');
    
    const wishlist = await Wishlist.findAll(user_id);
    
    res.json({
      success: true,
      data: wishlist,
      message: 'Wishlist retrieved successfully'
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist'
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;
    
    const Wishlist = require('../models/Wishlist.model');
    const added = await Wishlist.add(user_id, product_id);
    
    if (!added) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Product added to wishlist'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist'
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.params;
    
    const Wishlist = require('../models/Wishlist.model');
    const removed = await Wishlist.remove(user_id, product_id);
    
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }
    
    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist'
    });
  }
};

// Recently viewed management for authenticated customers (limit to 3 products)
const getRecentlyViewed = async (req, res) => {
  try {
    const user_id = req.user.id;
    const RecentlyViewed = require('../models/RecentlyViewed.model');
    
    const recentlyViewed = await RecentlyViewed.findAll(user_id, 3); // Limit to 3 products
    
    res.json({
      success: true,
      data: recentlyViewed,
      message: 'Recently viewed products retrieved successfully'
    });
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recently viewed products'
    });
  }
};

const addToRecentlyViewed = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;
    
    const RecentlyViewed = require('../models/RecentlyViewed.model');
    await RecentlyViewed.add(user_id, product_id);
    
    res.status(201).json({
      success: true,
      message: 'Product added to recently viewed'
    });
  } catch (error) {
    console.error('Add to recently viewed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to recently viewed'
    });
  }
};

// OTP verification for customers
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user exists and is a customer
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.user_type = 'customer' AND u.status = 'Active'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found'
      });
    }
    
    const user = users[0];
    
    // Create and send OTP
    const otpData = await OTP.create(user.id, email);
    await sendOTPVerificationEmail(user, otpData.otpCode);
    
    res.json({
      success: true,
      message: 'OTP sent to your email',
      otpExpiresAt: otpData.expiresAt
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP'
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }
    
    // Verify OTP
    const otpResult = await OTP.verify(email, otp);
    if (!otpResult || otpResult.valid !== true) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Get user data first - ensure it's a customer
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.user_type = 'customer' AND u.status = 'Active'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found'
      });
    }
    
    const user = users[0];
    
    // Update user email verification status
    await User.update(user.id, { 
      email_verified: true, 
      email_verified_at: new Date() 
    });
    
    // Get updated user data
    const updatedUser = await User.findByEmail(email);
    
    // Generate token
    const token = jwt.generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role_name
    });
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role_name,
          email_verified: true
        }
      },
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP'
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Check if user exists and is a customer
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.user_type = 'customer' AND u.status = 'Active'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found'
      });
    }
    
    const user = users[0];
    
    // Create and send new OTP
    const otpData = await OTP.create(user.id, email);
    await sendOTPVerificationEmail(user, otpData.otpCode);
    
    res.json({
      success: true,
      message: 'New OTP sent to your email',
      otpExpiresAt: otpData.expiresAt
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP'
    });
  }
};

// Forgot password for customers ONLY (public endpoint)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Find CUSTOMER user specifically using user_type
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.status = 'Active' AND u.user_type = 'customer'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found'
      });
    }
    
    // Use the customer user
    const user = users[0];
    
    // Create and send password reset OTP
    const otpData = await OTP.create(user.id, email);
    console.log('🔍 Creating OTP for user:', user.id, 'email:', email);
    console.log('🔍 OTP Data:', otpData);
    
    const emailResult = await sendPasswordResetEmail(user, otpData.otpCode);
    console.log('🔍 Email send result:', emailResult);
    
    res.json({
      success: true,
      message: 'Password reset code sent to your email',
      otpExpiresAt: otpData.expiresAt
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send password reset code'
    });
  }
};

// Reset password for customers ONLY (public endpoint)
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Verify OTP
    const otpResult = await OTP.verify(email, otp);
    if (!otpResult || otpResult.valid !== true) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }
    
    // Find CUSTOMER user specifically using user_type
    const [users] = await db.execute(`
      SELECT u.*, r.name as role_name, r.level as role_level 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ? AND u.status = 'Active' AND u.user_type = 'customer'
    `, [email]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found'
      });
    }
    
    // Use the customer user
    const user = users[0];
    
    // Update password
    await User.updatePassword(user.id, newPassword);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
};

// Submit contact form
const submitContactForm = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, orderNumber, subject, message } = req.body;

    // Send contact email
    const result = await sendContactEmail({
      firstName,
      lastName,
      email,
      phone,
      orderNumber,
      subject,
      message
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you soon.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Get order detail by ID (for authenticated users)
const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    // Get order with items and address details
    const [orderRows] = await db.execute(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        lv1.value as status_name,
        lv2.value as payment_method_name,
        p.stripe_payment_intent_id,
        p.status as payment_status,
        p.payment_method as payment_method_type,
        oa.line1 as shipping_address_line1,
        oa.line2 as shipping_address_line2,
        oa.city as shipping_address_city,
        oa.postal_code as shipping_address_postal_code,
        oa.phone as shipping_address_phone
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN lookup_values lv1 ON o.status_value_id = lv1.id
      LEFT JOIN lookup_values lv2 ON o.payment_method_value_id = lv2.id
      LEFT JOIN payments p ON o.payment_id = p.id
      LEFT JOIN order_addresses oa ON o.id = oa.order_id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, user_id]);
    
    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orderRows[0];
    
    // Get order items with product details
    const [itemRows] = await db.execute(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.sku as product_sku,
        CONCAT(COALESCE(pv.size, ''), ' ', COALESCE(pv.color_name, '')) as variant_name,
        pi.image_url as product_image
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_variants pv ON oi.variant_id = pv.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE oi.order_id = ?
      GROUP BY oi.id
    `, [id]);
    
    // Format the response
    const orderDetail = {
      ...order,
      items: itemRows,
      shipping_address: {
        line1: order.shipping_address_line1,
        line2: order.shipping_address_line2,
        city: order.shipping_address_city,
        postal_code: order.shipping_address_postal_code,
        phone: order.shipping_address_phone
      }
    };
    
    res.json({
      success: true,
      data: orderDetail
    });
  } catch (error) {
    console.error('Get order detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
};

// Create a product review
const createReview = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Check if order exists and belongs to user
    const [orderRows] = await db.execute(
      `SELECT o.*, lv.value as status_name 
       FROM orders o 
       JOIN lookup_values lv ON o.status_value_id = lv.id 
       WHERE o.id = ? AND o.user_id = ?`,
      [order_id, user_id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to you'
      });
    }

    const order = orderRows[0];

    // Check if order is delivered
    if (order.status_name.toLowerCase() !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'You can only review products from delivered orders'
      });
    }

    // Check if product exists in the order
    const [orderItemRows] = await db.execute(
      `SELECT * FROM order_items WHERE order_id = ? AND product_id = ?`,
      [order_id, product_id]
    );

    if (orderItemRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product not found in this order'
      });
    }

    // Check if review already exists
    const [existingReview] = await db.execute(
      `SELECT * FROM reviews WHERE user_id = ? AND product_id = ? AND order_id = ?`,
      [user_id, product_id, order_id]
    );

    if (existingReview.length > 0) {
      // Get order code for better error message
      const orderCode = order.code || generateCode('ORD', order_id);
      const existingReviewData = existingReview[0];
      const reviewDate = new Date(existingReviewData.created_at).toLocaleDateString();
      
      // Also get all reviews for this product to help user understand
      const [allProductReviews] = await db.execute(
        `SELECT r.*, o.code as order_code FROM reviews r LEFT JOIN orders o ON r.order_id = o.id WHERE r.user_id = ? AND r.product_id = ? ORDER BY r.created_at DESC`,
        [user_id, product_id]
      );
      
      console.log(`🔍 Review Conflict - User ID: ${user_id}, Product ID: ${product_id}, Order ID: ${order_id}`);
      console.log(`🔍 Existing Review Found:`, existingReviewData);
      console.log(`🔍 All Reviews for Product:`, allProductReviews);
      
      return res.status(400).json({
        success: false,
        message: `You have already reviewed this product from order #${orderCode} on ${reviewDate}. Each order can only have one review per product.`,
        existing_review: {
          id: existingReviewData.id,
          order_id: existingReviewData.order_id,
          order_code: orderCode,
          rating: existingReviewData.rating,
          comment: existingReviewData.comment,
          created_at: existingReviewData.created_at
        },
        all_reviews_for_product: allProductReviews.map(r => ({
          id: r.id,
          order_id: r.order_id,
          order_code: r.order_code || generateCode('ORD', r.order_id),
          rating: r.rating,
          created_at: r.created_at
        }))
      });
    }

    // Create the review
    const [result] = await db.execute(
      `INSERT INTO reviews (user_id, product_id, order_id, rating, comment, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, 'Active', NOW(), NOW())`,
      [user_id, product_id, order_id, rating, comment || null]
    );

    return res.status(200).json({
      success: true,
      message: 'Review created successfully',
      data: {
        id: result.insertId,
        user_id,
        product_id,
        order_id,
        rating,
        comment,
        status: 'Active'
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a product review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    // Check if review exists and belongs to user
    const [reviewRows] = await db.execute(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (reviewRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or does not belong to you'
      });
    }

    // Update the review
    await db.execute(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
      [rating, comment || null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: {
        id: parseInt(id),
        rating,
        comment,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a product review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if review exists and belongs to user
    const [reviewRows] = await db.execute(
      `SELECT * FROM reviews WHERE id = ? AND user_id = ?`,
      [id, user_id]
    );

    if (reviewRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or does not belong to you'
      });
    }

    // Delete the review
    await db.execute(
      `DELETE FROM reviews WHERE id = ?`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get product reviews
const getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Get reviews with user information
    const [reviews] = await db.execute(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? AND r.status = 'Active'
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [product_id, parseInt(limit), offset]
    );

    // Get total count and average rating
    const [statsRows] = await db.execute(
      `SELECT COUNT(*) as total, AVG(rating) as average_rating 
       FROM reviews 
       WHERE product_id = ? AND status = 'Active'`,
      [product_id]
    );

    const total = statsRows[0].total;
    const average_rating = parseFloat(statsRows[0].average_rating) || 0;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        average_rating: Math.round(average_rating * 10) / 10, // Round to 1 decimal place
        total_reviews: total,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total,
          total_pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Email subscription function
const subscribeEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    const cleanEmail = email.trim().toLowerCase();
    
    // Send email to info@zarafet.uk
    const emailSubject = 'New Email Subscription';
    const emailText = `
New email subscription from Zarafet website:

Email: ${cleanEmail}
Date: ${new Date().toLocaleString()}

This email was automatically generated from the website subscription form.
    `;
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Email Subscription</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.8; color: #333; margin: 0; padding: 0; background-color: #ffffff; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .content { padding: 0; }
        p { font-size: 16px; margin-bottom: 20px; line-height: 1.8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <p>New email subscription from Zarafet website:</p>
            
            <p>Email: ${cleanEmail}<br>
            Date: ${new Date().toLocaleString()}</p>
            
            <p style="color: #666; font-size: 14px;">This email was automatically generated from the website subscription form.</p>
        </div>
    </div>
</body>
</html>
    `;
    
    // Send email to admin using the existing email service
    await sendEmail({
      to: 'info@zarafet.uk',
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    });
    
    // Send confirmation email to user
    try {
      await sendSubscriptionConfirmation({ email: cleanEmail });
    } catch (emailError) {
      console.error('❌ Failed to send subscription confirmation email:', emailError);
      // Don't fail the subscription if confirmation email fails
    }
    
    res.json({
      success: true,
      message: 'Thank you for subscribing! You will receive updates and exclusive deals.'
    });
    
  } catch (error) {
    console.error('Email subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.'
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
  getRecommendedProducts,
  getProductById,
  getProductsByIds,
  // Address management
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getAddressById,
  // Category management
  getCategories,
  // Wishlist management
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  // Recently viewed management
  getRecentlyViewed,
  addToRecentlyViewed,
  // OTP verification for customers
  sendOTP,
  verifyOTP,
  resendOTP,
  // Password reset for customers
  forgotPassword,
  resetPassword,
  // Contact form
  submitContactForm,
  // Email subscription
  subscribeEmail,
  // Order details
  getOrderDetail,
  // Review functions
  createReview,
  updateReview,
  deleteReview,
  getProductReviews
};
