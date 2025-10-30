const PromoCode = require('../models/PromoCode.model');
const responses = require('../utils/responses');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const promoCodes = await PromoCode.findAll(filters);
    const total = await PromoCode.count(filters);
    
    res.json(responses.ok(promoCodes, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Promo codes list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch promo codes'));
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promoCode = await PromoCode.findById(id);
    if (!promoCode) {
      return res.status(404).json(responses.notFound('Promo code'));
    }
    
    res.json(responses.ok(promoCode));
  } catch (error) {
    console.error('Get promo code error:', error);
    res.status(500).json(responses.internalError('Failed to fetch promo code'));
  }
};

const create = async (req, res) => {
  console.log("Create promo code request:", req.body) 
  try {
    const { code, discount_type, discount_value, status, expiry_date, description } = req.body;
    
    // Validate required fields
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json(responses.badRequest('Code, discount type, and discount value are required'));
    }
    
    // Validate discount type
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json(responses.badRequest('Discount type must be either "percentage" or "fixed"'));
    }
    
    // Validate discount value
    if (discount_value <= 0) {
      return res.status(400).json(responses.badRequest('Discount value must be greater than 0'));
    }
    
    if (discount_type === 'percentage' && discount_value > 100) {
      return res.status(400).json(responses.badRequest('Percentage discount cannot exceed 100%'));
    }
    
    // Check if code already exists
    const existingCode = await PromoCode.findByCode(code);
    console.log("Existing code:", existingCode)
    if (existingCode) {
      return res.status(400).json(responses.badRequest('Promo code already exists'));
    }
    
    // Normalize expiry_date: allow Date object, string, or null/empty
    let normalizedExpiryDate = null;
    if (expiry_date !== undefined && expiry_date !== null && expiry_date !== '') {
      normalizedExpiryDate = expiry_date; // Can be a Date or a non-empty string; both accepted by mysql driver
    }

    const promoCodeId = await PromoCode.create({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value,
      status: status || 'active',
      expiry_date: normalizedExpiryDate,
      description: description === '' ? null : description
    });
    
    const newPromoCode = await PromoCode.findById(promoCodeId);
    
    res.status(201).json(responses.created(newPromoCode, 'Promo code created successfully'));
  } catch (error) {
    console.error('Create promo code error:', error);
    res.status(500).json(responses.internalError('Failed to create promo code'));
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate discount type if provided
    if (updateData.discount_type && !['percentage', 'fixed'].includes(updateData.discount_type)) {
      return res.status(400).json(responses.badRequest('Discount type must be either "percentage" or "fixed"'));
    }
    
    // Validate discount value if provided
    if (updateData.discount_value !== undefined) {
      if (updateData.discount_value <= 0) {
        return res.status(400).json(responses.badRequest('Discount value must be greater than 0'));
      }
      
      if (updateData.discount_type === 'percentage' && updateData.discount_value > 100) {
        return res.status(400).json(responses.badRequest('Percentage discount cannot exceed 100%'));
      }
    }
    
    // Handle empty expiry_date (support Date objects and strings)
    if (updateData.expiry_date !== undefined) {
      if (updateData.expiry_date === null || updateData.expiry_date === '') {
        updateData.expiry_date = null;
      }
      // else leave as-is (Date or non-empty string)
    }

    if (updateData.description !== undefined && updateData.description === '') {
      updateData.description = null;
    }
    
    const success = await PromoCode.update(id, updateData);
    if (!success) {
      return res.status(404).json(responses.notFound('Promo code'));
    }
    
    const updatedPromoCode = await PromoCode.findById(id);
    res.json(responses.ok(updatedPromoCode, 'Promo code updated successfully'));
  } catch (error) {
    console.error('Update promo code error:', error);
    res.status(500).json(responses.internalError('Failed to update promo code'));
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await PromoCode.delete(id);
    if (!success) {
      return res.status(404).json(responses.notFound('Promo code'));
    }
    
    res.json(responses.ok(null, 'Promo code deleted successfully'));
  } catch (error) {
    console.error('Delete promo code error:', error);
    res.status(500).json(responses.internalError('Failed to delete promo code'));
  }
};

// Public endpoint to validate promo code
const validatePromoCode = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code || !cartTotal) {
      return res.status(400).json(responses.badRequest('Code and cart total are required'));
    }
    
    const validation = await PromoCode.validateForCheckout(code, parseFloat(cartTotal));
    
    if (validation.valid) {
      res.json(responses.ok(validation, 'Promo code is valid'));
    } else {
      res.status(400).json(responses.badRequest(validation.message));
    }
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json(responses.internalError('Failed to validate promo code'));
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  validatePromoCode
};
