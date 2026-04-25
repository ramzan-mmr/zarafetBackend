const DiscountPopup = require('../models/DiscountPopup.model');
const responses = require('../utils/responses');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const config = require('../config/env');

/**
 * List all discount popups
 */
const list = async (req, res) => {
  try {
    const popups = await DiscountPopup.findAll();

    // Append full image URL
    const popupsWithUrls = popups.map(popup => ({
      ...popup,
      image_url: popup.image_url
        ? `${config.storage.baseUrl}/${popup.image_url}`
        : null
    }));

    res.json(responses.ok(popupsWithUrls));
  } catch (error) {
    console.error('Discount popups list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch discount popups'));
  }
};

/**
 * Get discount popup by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const popup = await DiscountPopup.findById(id);

    if (!popup) {
      return res.status(404).json(responses.notFound('Discount popup'));
    }

    const popupWithUrl = {
      ...popup,
      image_url: popup.image_url
        ? `${config.storage.baseUrl}/${popup.image_url}`
        : null
    };

    res.json(responses.ok(popupWithUrl));
  } catch (error) {
    console.error('Get discount popup error:', error);
    res.status(500).json(responses.internalError('Failed to fetch discount popup'));
  }
};

/**
 * Create a new discount popup with image upload
 */
const create = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(responses.badRequest('Discount popup image is required'));
    }

    // Optimize image with sharp
    const optimizedFilename = `discount-popup-${Date.now()}-optimized.jpeg`;
    const optimizedPath = path.join('uploads', 'discount-popups', optimizedFilename);

    await sharp(req.file.path)
      .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Remove the original unoptimized file
    fs.unlinkSync(req.file.path);

    const { title, status } = req.body;

    const popup = await DiscountPopup.create({
      title,
      image_url: optimizedPath.replace(/\\/g, '/'),
      status: status || 'Active',
      created_by: req.user?.id || null
    });

    const popupWithUrl = {
      ...popup,
      image_url: popup.image_url
        ? `${config.storage.baseUrl}/${popup.image_url}`
        : null
    };

    res.status(201).json(responses.created(popupWithUrl));
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create discount popup error:', error);
    res.status(500).json(responses.internalError('Failed to create discount popup'));
  }
};

/**
 * Update a discount popup (with optional image replacement)
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPopup = await DiscountPopup.findById(id);
    if (!existingPopup) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json(responses.notFound('Discount popup'));
    }

    const updateData = {};
    const { title, status } = req.body;

    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;

    // Handle image update
    if (req.file) {
      // Optimize new image with sharp
      const optimizedFilename = `discount-popup-${Date.now()}-optimized.jpeg`;
      const optimizedPath = path.join('uploads', 'discount-popups', optimizedFilename);

      await sharp(req.file.path)
        .resize(1200, null, { withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);

      // Remove the original unoptimized upload
      fs.unlinkSync(req.file.path);

      // Delete old image file
      if (existingPopup.image_url) {
        const oldImagePath = path.join(__dirname, '../../', existingPopup.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.image_url = optimizedPath.replace(/\\/g, '/');
    }

    const popup = await DiscountPopup.update(id, updateData);

    const popupWithUrl = {
      ...popup,
      image_url: popup.image_url
        ? `${config.storage.baseUrl}/${popup.image_url}`
        : null
    };

    res.json(responses.ok(popupWithUrl));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update discount popup error:', error);
    res.status(500).json(responses.internalError('Failed to update discount popup'));
  }
};

/**
 * Delete a discount popup and its image file
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPopup = await DiscountPopup.findById(id);
    if (!existingPopup) {
      return res.status(404).json(responses.notFound('Discount popup'));
    }

    // Delete image file
    if (existingPopup.image_url) {
      const imagePath = path.join(__dirname, '../../', existingPopup.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await DiscountPopup.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete discount popup error:', error);
    res.status(500).json(responses.internalError('Failed to delete discount popup'));
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
