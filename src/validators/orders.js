const Joi = require('joi');
const { paginationQuery, positiveInt, money } = require('./common');

exports.listQuery = paginationQuery.keys({
  status_value_id: positiveInt,
  status: Joi.string().valid('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled').allow(''),
  payment_method_value_id: positiveInt,
  paymentMethod: Joi.string().allow(''),
  category: Joi.string().allow(''),
  searchTerm: Joi.string().allow(''),
  dateFrom: Joi.string().allow(''),
  dateTo: Joi.string().allow(''),
  amountMin: Joi.string().allow(''),
  amountMax: Joi.string().allow('')
});

exports.place = Joi.object({
  cart: Joi.object({
    items: Joi.array().items(Joi.object({
      id: Joi.string().required(),
      productId: positiveInt.required(),
      name: Joi.string().required(),
      price: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      image: Joi.string().uri().required(),
      variant: Joi.object({
        id: positiveInt.required(),
        product_id: positiveInt.required(),
        sku: Joi.string().required(),
        extra_price: Joi.string().required(),
        stock: Joi.number().integer().min(0).required(),
        size: Joi.string().allow(''),
        color_name: Joi.string().allow(''),
        color_code: Joi.string().allow(''),
        color_image: Joi.string().allow('')
      }).required(),
      selectedColor: Joi.string().allow(''),
      selectedSize: Joi.string().allow(''),
      stock: Joi.number().integer().min(0).required()
    })).min(1).required(),
    subtotal: Joi.number().min(0).required(),
    totalItems: Joi.number().integer().min(1).required()
  }).required(),
  address: Joi.object({
    id: positiveInt.required(),
    label: Joi.string().required(),
    line1: Joi.string().required(),
    line2: Joi.string().allow(''),
    city: Joi.string().allow(''),
    postalCode: Joi.string().allow(''),
    phone: Joi.string().required()
  }).required(),
  shipping: Joi.object({
    method: Joi.object({
      id: positiveInt.required(),
      price: Joi.string().required(),
      title: Joi.string().required(),
      deliveryDate: Joi.string().allow('').optional()
    }).required(),
    cost: Joi.number().min(0).required()
  }).required(),
  payment: Joi.object({
    method: Joi.string().valid('creditCard', 'applePay', 'googlePay', 'alipay', 'wechatPay').required(),
    cardDetails: Joi.object({
      cardholderName: Joi.string().allow(''),
      cardNumber: Joi.string().allow(''),
      expDate: Joi.string().allow(''),
      cvv: Joi.string().allow('')
    }).allow(null),
    paymentIntentId: Joi.string().allow(''),
    sameAsBilling: Joi.boolean().default(true)
  }).required(),
  totals: Joi.object({
    subtotal: Joi.number().min(0).required(),
    shipping: Joi.number().min(0).required(),
    tax: Joi.number().min(0).required(),
    total: Joi.number().min(0).required()
  }).optional() // Made optional since backend calculates everything
});

exports.statusUpdate = Joi.object({
  to_status_value_id: positiveInt.required(),
  reason: Joi.string().max(500).allow('').optional()
});
