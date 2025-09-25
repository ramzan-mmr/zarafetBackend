/**
 * Standardized response helpers
 */

const ok = (data, meta = null) => {
  const response = { data };
  if (meta) {
    response.meta = meta;
  }
  return response;
};

const created = (data) => {
  return { data };
};

const error = (code, message, details = null) => {
  const response = {
    error: {
      code,
      message
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return response;
};

const validationError = (details) => {
  return error('VALIDATION_ERROR', 'Request validation failed', details);
};

const notFound = (resource = 'Resource') => {
  return error('NOT_FOUND', `${resource} not found`);
};

const unauthorized = (message = 'Unauthorized access') => {
  return error('UNAUTHORIZED', message);
};

const forbidden = (message = 'Access forbidden') => {
  return error('FORBIDDEN', message);
};

const conflict = (message = 'Resource conflict') => {
  return error('CONFLICT', message);
};

const internalError = (message = 'Internal server error') => {
  return error('INTERNAL_ERROR', message);
};

module.exports = {
  ok,
  created,
  error,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  conflict,
  internalError
};
