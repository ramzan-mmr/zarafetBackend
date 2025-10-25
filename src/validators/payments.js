const Joi = require('joi');
const { positiveInt, money } = require('./common');

exports.createPaymentIntent = Joi.object({
  amount: Joi.number().min(0.01).required(),
  currency: Joi.string().length(3).default('usd'),
  metadata: Joi.object().default({})
});

exports.processPayment = Joi.object({
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
  }).optional(), // Made optional since backend calculates everything
  promoCode: Joi.object({
    code: Joi.string().required(),
    discountAmount: Joi.number().min(0).required(),
    discountType: Joi.string().valid('percentage', 'fixed').required(),
    discountValue: Joi.string().required()
  }).allow(null).optional() // Promo code is optional and can be null
});

exports.getPayment = Joi.object({
  id: positiveInt.required()
});
