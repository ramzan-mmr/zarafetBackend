const Order = require('../models/Order.model');
const responses = require('../utils/responses');

const list = async (req, res) => {
  try {
    const { page, limit, ...filters } = req.pagination;
    
    const orders = await Order.findAll(filters, { page, limit, ...req.query });
    const total = await Order.count(filters);
    
    res.json(responses.ok(orders, {
      page,
      limit,
      total
    }));
  } catch (error) {
    console.error('Orders list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch orders'));
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    res.json(responses.ok(order));
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json(responses.internalError('Failed to fetch order'));
  }
};

const place = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      user_id: req.user.id
    };
    
    const order = await Order.create(orderData);
    res.status(201).json(responses.created(order));
  } catch (error) {
    console.error('Place order error:', error);
    if (error.message.includes('not found') || error.message.includes('Insufficient stock')) {
      res.status(400).json(responses.error('ORDER_ERROR', error.message));
    } else {
      res.status(500).json(responses.internalError('Failed to place order'));
    }
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { to_status_value_id } = req.body;
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    const order = await Order.updateStatus(id, to_status_value_id, req.user.id);
    res.json(responses.ok(order));
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json(responses.internalError('Failed to update order status'));
  }
};

const getHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json(responses.notFound('Order'));
    }
    
    const history = await Order.getHistory(id);
    res.json(responses.ok(history));
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json(responses.internalError('Failed to fetch order history'));
  }
};

module.exports = {
  list,
  getById,
  place,
  updateStatus,
  getHistory
};
