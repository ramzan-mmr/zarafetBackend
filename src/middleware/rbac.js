const responses = require('../utils/responses');

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(responses.unauthorized('Authentication required'));
    }
    
    const userRole = req.user.role;
    console.log(userRole);
    console.log(allowedRoles);

    if (userRole === 'Super_Admin') {
      return next();
    } 
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json(responses.forbidden('Insufficient permissions'));
    }
    
    next();
  };
};


module.exports = {
  checkRole
};
