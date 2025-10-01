const responses = require('../utils/responses');

const parsePagination = (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sortBy,
    sortDir = 'asc',
    search,
    from,
    to,
    minPrice,
    maxPrice,
    ...filters
  } = req.query;
  
  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json(responses.validationError([{
      path: 'page',
      type: 'number.positive',
      message: 'Page must be a positive integer'
    }]));
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json(responses.validationError([{
      path: 'limit',
      type: 'number.range',
      message: 'Limit must be between 1 and 100'
    }]));
  }
  
  // Validate sort direction
  if (sortDir && !['asc', 'desc'].includes(sortDir.toLowerCase())) {
    return res.status(400).json(responses.validationError([{
      path: 'sortDir',
      type: 'string.valid',
      message: 'Sort direction must be asc or desc'
    }]));
  }
  
  // Build pagination object
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    sortBy,
    sortDir: sortDir.toLowerCase(),
    search,
    from,
    to,
    minPrice,
    maxPrice,
    ...filters
  };
  
  next();
};

module.exports = {
  parsePagination
};
