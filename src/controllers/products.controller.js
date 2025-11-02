const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const responses = require('../utils/responses');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    // Clean up empty string filters
    Object.keys(filters).forEach(key => {
      if (filters[key] === '' || filters[key] === null || filters[key] === undefined) {
        delete filters[key];
      }
    });
    
    const products = await Product.findAll(filters, { page, limit, ...req.query });
    const total = await Product.count(filters);
    
    res.json(responses.ok(products, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch products'));
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json(responses.notFound('Product'));
    }
    
    res.json(responses.ok(product));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json(responses.internalError('Failed to fetch product'));
  }
};

const create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(responses.created(product));
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      // If SKU conflict occurs, try again with a new random SKU
      try {
        const product = await Product.create(req.body);
        res.status(201).json(responses.created(product));
      } catch (retryError) {
        console.error('Retry create product error:', retryError);
        res.status(500).json(responses.internalError('Failed to create product after retry'));
      }
    } else {
      res.status(500).json(responses.internalError('Failed to create product'));
    }
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json(responses.notFound('Product'));
    }
    
    const product = await Product.update(id, req.body);
    res.json(responses.ok(product));
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json(responses.conflict('Product with this SKU already exists'));
    } else {
      res.status(500).json(responses.internalError('Failed to update product'));
    }
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json(responses.notFound('Product'));
    }
    
    await Product.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json(responses.internalError('Failed to delete product'));
  }
};

// Get available categories for products
const getAvailableCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ status: 'Active' });
    res.json(responses.ok(categories));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json(responses.internalError('Failed to fetch categories'));
  }
};

// Fix stock_status for all products based on their current stock
const fixStockStatus = async (req, res) => {
  try {
    const db = require('../config/db');
    
    // Update all products' stock_status based on their current stock
    const [result] = await db.execute(
      `UPDATE products 
       SET stock_status = CASE 
         WHEN stock <= 0 THEN 'Out of Stock'
         WHEN stock < 10 THEN 'Low Stock'
         ELSE 'Active'
       END`
    );
    
    res.json(responses.ok({
      message: 'Stock status updated successfully',
      affectedRows: result.affectedRows
    }));
  } catch (error) {
    console.error('Fix stock status error:', error);
    res.status(500).json(responses.internalError('Failed to fix stock status'));
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  getAvailableCategories,
  fixStockStatus
};
