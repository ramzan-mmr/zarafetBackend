const Customer = require('../models/Customer.model');
const Address = require('../models/Address.model');
const responses = require('../utils/responses');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const customers = await Customer.findAll(filters, { page, limit, ...req.query });
    const total = await Customer.count(filters);
    
    res.json(responses.ok(customers, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Customers list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch customers'));
  }
};

const getById = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const customer = await Customer.findById(user_id);
    if (!customer) {
      return res.status(404).json(responses.notFound('Customer'));
    }
    
    res.json(responses.ok(customer));
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json(responses.internalError('Failed to fetch customer'));
  }
};

const update = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const existingCustomer = await Customer.findById(user_id);
    if (!existingCustomer) {
      return res.status(404).json(responses.notFound('Customer'));
    }
    
    const customer = await Customer.update(user_id, req.body);
    res.json(responses.ok(customer));
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json(responses.internalError('Failed to update customer'));
  }
};

// Address management
const getAddresses = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const addresses = await Address.findAll(user_id);
    res.json(responses.ok(addresses));
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json(responses.internalError('Failed to fetch addresses'));
  }
};

const createAddress = async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const addressData = {
      ...req.body,
      user_id
    };
    
    const address = await Address.create(addressData);
    res.status(201).json(responses.created(address));
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json(responses.internalError('Failed to create address'));
  }
};

const updateAddress = async (req, res) => {
  try {
    const { user_id, id } = req.params;
    
    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
      return res.status(404).json(responses.notFound('Address'));
    }
    
    // Verify address belongs to user
    if (existingAddress.user_id != user_id) {
      return res.status(403).json(responses.forbidden('Address does not belong to this customer'));
    }
    
    const addressData = {
      ...req.body,
      user_id
    };
    
    const address = await Address.update(id, addressData);
    res.json(responses.ok(address));
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json(responses.internalError('Failed to update address'));
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { user_id, id } = req.params;
    
    const existingAddress = await Address.findById(id);
    if (!existingAddress) {
      return res.status(404).json(responses.notFound('Address'));
    }
    
    // Verify address belongs to user
    if (existingAddress.user_id != user_id) {
      return res.status(403).json(responses.forbidden('Address does not belong to this customer'));
    }
    
    await Address.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json(responses.internalError('Failed to delete address'));
  }
};

module.exports = {
  list,
  getById,
  update,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
