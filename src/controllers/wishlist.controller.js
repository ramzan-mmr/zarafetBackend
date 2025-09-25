const Wishlist = require('../models/Wishlist.model');
const RecentlyViewed = require('../models/RecentlyViewed.model');
const responses = require('../utils/responses');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findAll(req.user.id);
    res.json(responses.ok(wishlist));
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json(responses.internalError('Failed to fetch wishlist'));
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    
    const added = await Wishlist.add(req.user.id, product_id);
    if (!added) {
      return res.status(409).json(responses.conflict('Product already in wishlist'));
    }
    
    res.status(201).json(responses.created({ message: 'Product added to wishlist' }));
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json(responses.internalError('Failed to add product to wishlist'));
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    const removed = await Wishlist.remove(req.user.id, product_id);
    if (!removed) {
      return res.status(404).json(responses.notFound('Product not in wishlist'));
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json(responses.internalError('Failed to remove product from wishlist'));
  }
};

const getRecentlyViewed = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const recentlyViewed = await RecentlyViewed.findAll(req.user.id, limit);
    res.json(responses.ok(recentlyViewed));
  } catch (error) {
    console.error('Get recently viewed error:', error);
    res.status(500).json(responses.internalError('Failed to fetch recently viewed products'));
  }
};

const addToRecentlyViewed = async (req, res) => {
  try {
    const { product_id } = req.body;
    
    await RecentlyViewed.add(req.user.id, product_id);
    res.status(201).json(responses.created({ message: 'Product added to recently viewed' }));
  } catch (error) {
    console.error('Add to recently viewed error:', error);
    res.status(500).json(responses.internalError('Failed to add product to recently viewed'));
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getRecentlyViewed,
  addToRecentlyViewed
};
