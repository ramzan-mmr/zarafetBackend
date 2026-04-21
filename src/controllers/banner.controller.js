const Banner = require('../models/Banner.model');
const responses = require('../utils/responses');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const config = require('../config/env');

const MAX_BANNERS = 3;

/**
 * List all banners
 */
const list = async (req, res) => {
  try {
    const banners = await Banner.findAll();

    // Append full image URL
    const bannersWithUrls = banners.map(banner => ({
      ...banner,
      image_url: banner.image_url
        ? `${config.storage.baseUrl}/${banner.image_url}`
        : null
    }));

    res.json(responses.ok(bannersWithUrls));
  } catch (error) {
    console.error('Banners list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch banners'));
  }
};

/**
 * Get banner by ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json(responses.notFound('Banner'));
    }

    const bannerWithUrl = {
      ...banner,
      image_url: banner.image_url
        ? `${config.storage.baseUrl}/${banner.image_url}`
        : null
    };

    res.json(responses.ok(bannerWithUrl));
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json(responses.internalError('Failed to fetch banner'));
  }
};

/**
 * Create a new banner with image upload
 */
const create = async (req, res) => {
  try {
    // Check max banners limit
    const count = await Banner.count();
    if (count >= MAX_BANNERS) {
      // Clean up uploaded file if limit exceeded
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json(
        responses.badRequest(`Maximum ${MAX_BANNERS} banners allowed. Please delete an existing banner first.`)
      );
    }

    if (!req.file) {
      return res.status(400).json(responses.badRequest('Banner image is required'));
    }

    // Optimize image with sharp
    const optimizedFilename = `banner-${Date.now()}-optimized.jpeg`;
    const optimizedPath = path.join('uploads', 'banners', optimizedFilename);

    await sharp(req.file.path)
      .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
      .jpeg({ quality: 85 })
      .toFile(optimizedPath);

    // Remove the original unoptimized file
    fs.unlinkSync(req.file.path);

    const { title, tagline, sort_order, status } = req.body;

    // Get next sort order if not provided
    const finalSortOrder = sort_order || await Banner.getNextSortOrder();

    const banner = await Banner.create({
      title,
      tagline,
      image_url: optimizedPath.replace(/\\/g, '/'),
      sort_order: finalSortOrder,
      status: status || 'Active',
      created_by: req.user?.id || null
    });

    const bannerWithUrl = {
      ...banner,
      image_url: banner.image_url
        ? `${config.storage.baseUrl}/${banner.image_url}`
        : null
    };

    res.status(201).json(responses.created(bannerWithUrl));
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Create banner error:', error);
    res.status(500).json(responses.internalError('Failed to create banner'));
  }
};

/**
 * Update a banner (with optional image replacement)
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json(responses.notFound('Banner'));
    }

    const updateData = {};
    const { title, tagline, sort_order, status } = req.body;

    if (title !== undefined) updateData.title = title;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (status !== undefined) updateData.status = status;

    // Handle image update
    if (req.file) {
      // Optimize new image with sharp
      const optimizedFilename = `banner-${Date.now()}-optimized.jpeg`;
      const optimizedPath = path.join('uploads', 'banners', optimizedFilename);

      await sharp(req.file.path)
        .resize(1920, null, { withoutEnlargement: true, fit: 'inside' })
        .jpeg({ quality: 85 })
        .toFile(optimizedPath);

      // Remove the original unoptimized upload
      fs.unlinkSync(req.file.path);

      // Delete old image file
      if (existingBanner.image_url) {
        const oldImagePath = path.join(__dirname, '../../', existingBanner.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.image_url = optimizedPath.replace(/\\/g, '/');
    }

    const banner = await Banner.update(id, updateData);

    const bannerWithUrl = {
      ...banner,
      image_url: banner.image_url
        ? `${config.storage.baseUrl}/${banner.image_url}`
        : null
    };

    res.json(responses.ok(bannerWithUrl));
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Update banner error:', error);
    res.status(500).json(responses.internalError('Failed to update banner'));
  }
};

/**
 * Delete a banner and its image file
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return res.status(404).json(responses.notFound('Banner'));
    }

    // Delete image file
    if (existingBanner.image_url) {
      const imagePath = path.join(__dirname, '../../', existingBanner.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Banner.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json(responses.internalError('Failed to delete banner'));
  }
};

module.exports = {
  list,
  getById,
  create,
  update,
  remove
};
