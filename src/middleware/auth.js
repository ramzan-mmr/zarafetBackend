const jwt = require('../config/jwt');
const responses = require('../utils/responses');

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(responses.unauthorized('Access token required'));
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json(responses.unauthorized('Access token required'));
    }
    
    const decoded = jwt.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(responses.unauthorized('Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(responses.unauthorized('Invalid token'));
    } else {
      return res.status(401).json(responses.unauthorized('Token verification failed'));
    }
  }
};

module.exports = {
  verifyJWT
};
