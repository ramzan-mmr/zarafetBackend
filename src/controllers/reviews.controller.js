const db = require('../config/db');
const responses = require('../utils/responses');

const SORT_COLUMNS = {
  created_at: 'r.created_at',
  rating: 'r.rating',
  reviewer_name: 'reviewer_name',
  product_name: 'p.name',
  status: 'r.status',
  source: 'r.source'
};

const ensureProductExists = async (productId) => {
  const [rows] = await db.execute(
    'SELECT id, name FROM products WHERE id = ?',
    [productId]
  );

  return rows[0] || null;
};

const toMysqlDateTime = (date) => {
  const value = new Date(date);
  return value.toISOString().slice(0, 10) + ' 12:00:00';
};

const buildListQuery = (query) => {
  const conditions = [];
  const values = [];

  if (query.product_id) {
    conditions.push('r.product_id = ?');
    values.push(query.product_id);
  }

  if (query.status) {
    conditions.push('r.status = ?');
    values.push(query.status);
  }

  if (query.source) {
    conditions.push('r.source = ?');
    values.push(query.source);
  }

  if (query.search) {
    conditions.push('(COALESCE(r.reviewer_name, u.name, \'Anonymous\') LIKE ? OR r.comment LIKE ? OR p.name LIKE ? OR p.sku LIKE ?)');
    const search = `%${query.search}%`;
    values.push(search, search, search, search);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    values
  };
};

const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const sortBy = SORT_COLUMNS[req.query.sortBy] || SORT_COLUMNS.created_at;
    const sortDir = String(req.query.sortDir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const { whereClause, values } = buildListQuery(req.query);

    const [rows] = await db.execute(
      `SELECT r.id, r.product_id, r.rating, r.comment, r.status, r.source,
              COALESCE(r.reviewer_name, u.name, 'Anonymous') as reviewer_name,
              r.created_at, r.updated_at,
              p.name as product_name, p.sku as product_sku,
              CASE WHEN r.source = 'real' THEN 1 ELSE 0 END as verified,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY \`order\` LIMIT 1) as product_image
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       LEFT JOIN users u ON r.user_id = u.id
       ${whereClause}
       ORDER BY ${sortBy} ${sortDir}
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [countRows] = await db.execute(
      `SELECT COUNT(*) as total
       FROM reviews r
       JOIN products p ON r.product_id = p.id
       LEFT JOIN users u ON r.user_id = u.id
       ${whereClause}`,
      values
    );

    res.json(responses.ok(rows, {
      page,
      limit,
      total: countRows[0].total
    }));
  } catch (error) {
    console.error('Reviews list error:', error);
    res.status(500).json(responses.internalError('Failed to fetch reviews'));
  }
};

const create = async (req, res) => {
  try {
    const { product_id, reviewer_name, rating, comment, review_date, status = 'Active' } = req.body;
    const product = await ensureProductExists(product_id);

    if (!product) {
      return res.status(404).json(responses.notFound('Product'));
    }

    const [result] = await db.execute(
      `INSERT INTO reviews
        (user_id, product_id, order_id, reviewer_name, rating, comment, status, source, created_at, updated_at)
       VALUES
        (NULL, ?, NULL, ?, ?, ?, ?, 'manual', ?, NOW())`,
      [product_id, reviewer_name, rating, comment || null, status, toMysqlDateTime(review_date)]
    );

    res.status(201).json(responses.created({
      id: result.insertId,
      product_id,
      product_name: product.name,
      reviewer_name,
      rating,
      comment: comment || null,
      created_at: toMysqlDateTime(review_date),
      status,
      source: 'manual'
    }));
  } catch (error) {
    console.error('Create manual review error:', error);
    res.status(500).json(responses.internalError('Failed to create manual review'));
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, reviewer_name, rating, comment, review_date, status } = req.body;

    const [reviewRows] = await db.execute(
      "SELECT id FROM reviews WHERE id = ? AND source = 'manual'",
      [id]
    );

    if (reviewRows.length === 0) {
      return res.status(404).json(responses.notFound('Manual review'));
    }

    const product = await ensureProductExists(product_id);
    if (!product) {
      return res.status(404).json(responses.notFound('Product'));
    }

    await db.execute(
      `UPDATE reviews
       SET product_id = ?, reviewer_name = ?, rating = ?, comment = ?, status = ?, created_at = ?, updated_at = NOW()
       WHERE id = ? AND source = 'manual'`,
      [product_id, reviewer_name, rating, comment || null, status, toMysqlDateTime(review_date), id]
    );

    res.json(responses.ok({
      id: parseInt(id),
      product_id,
      product_name: product.name,
      reviewer_name,
      rating,
      comment: comment || null,
      created_at: toMysqlDateTime(review_date),
      status,
      source: 'manual'
    }));
  } catch (error) {
    console.error('Update manual review error:', error);
    res.status(500).json(responses.internalError('Failed to update manual review'));
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute(
      "DELETE FROM reviews WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json(responses.notFound('Review'));
    }

    res.status(204).send();
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json(responses.internalError('Failed to delete review'));
  }
};

module.exports = {
  list,
  create,
  update,
  remove
};
