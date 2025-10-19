const router = require('express').Router();
const { validateQuery } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const ctrl = require('../controllers/dashboard.controller');
// All routes require authentication and manager/admin/super_admin role
router.use(verifyJWT);
router.use(checkRole(['Super_Admin', 'Admin', 'Manager']));
router.get('/metrics', ctrl.getMetrics);
router.get('/sales-performance',
  validateQuery(require('joi').object({
    from: require('joi').date().iso(),
    to: require('joi').date().iso(),
    interval: require('joi').string().valid('month', 'day').default('month')
  })),
  ctrl.getSalesPerformance
);
router.get('/sales-by-category',
  validateQuery(require('joi').object({
    from: require('joi').date().iso(),
    to: require('joi').date().iso()
  })),
  ctrl.getSalesByCategory
);
module.exports = router;
