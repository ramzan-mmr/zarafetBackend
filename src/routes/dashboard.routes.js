const router = require('express').Router();
const { validateQuery } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const ctrl = require('../controllers/dashboard.controller');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and metrics endpoints
 */

// All routes require authentication and manager/admin/super_admin role
router.use(verifyJWT);
router.use(checkRole(['Super_Admin', 'Admin', 'Manager']));

/**
 * @swagger
 * /dashboard/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_revenue:
 *                       type: number
 *                       format: float
 *                       example: 125000.50
 *                     total_orders:
 *                       type: integer
 *                       example: 1250
 *                     total_customers:
 *                       type: integer
 *                       example: 850
 *                     products_sold:
 *                       type: integer
 *                       example: 3500
 *                     delta_orders_pct:
 *                       type: number
 *                       format: float
 *                       example: 15.5
 *                     delta_revenue_pct:
 *                       type: number
 *                       format: float
 *                       example: 22.3
 *                     delta_customers_pct:
 *                       type: number
 *                       format: float
 *                       example: 8.7
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/metrics', ctrl.getMetrics);

/**
 * @swagger
 * /dashboard/sales-performance:
 *   get:
 *     summary: Get sales performance data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (ISO format)
 *         example: "2024-01-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (ISO format)
 *         example: "2024-12-31"
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [month, day]
 *           default: month
 *         description: Data aggregation interval
 *     responses:
 *       200:
 *         description: Sales performance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: "2024-01"
 *                           value:
 *                             type: integer
 *                             example: 45
 *                     revenue:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: "2024-01"
 *                           value:
 *                             type: number
 *                             format: float
 *                             example: 12500.50
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sales-performance',
  validateQuery(require('joi').object({
    from: require('joi').date().iso(),
    to: require('joi').date().iso(),
    interval: require('joi').string().valid('month', 'day').default('month')
  })),
  ctrl.getSalesPerformance
);

/**
 * @swagger
 * /dashboard/sales-by-category:
 *   get:
 *     summary: Get sales data by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (ISO format)
 *         example: "2024-01-01"
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (ISO format)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Sales by category data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       category_name:
 *                         type: string
 *                         example: "Electronics"
 *                       orders:
 *                         type: integer
 *                         example: 125
 *                       revenue:
 *                         type: number
 *                         format: float
 *                         example: 45000.50
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/sales-by-category',
  validateQuery(require('joi').object({
    from: require('joi').date().iso(),
    to: require('joi').date().iso()
  })),
  ctrl.getSalesByCategory
);

module.exports = router;
