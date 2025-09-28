const router = require('express').Router();
const { validateQuery, validateBody, validateParams } = require('../middleware/validate');
const { parsePagination } = require('../middleware/paginate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { 
  headersList, headerCreate, headerUpdate,
  valuesList, valueCreate, valueUpdate 
} = require('../validators/lookups');
const { idParam } = require('../validators/common');
const ctrl = require('../controllers/lookups.controller');

/**
 * @swagger
 * tags:
 *   name: Lookups
 *   description: Lookup management endpoints for headers and values
 */

// All routes require authentication and manager/admin/super_admin role
router.use(verifyJWT);
router.use(checkRole(['Super_Admin', 'Admin', 'Manager']));

/**
 * @swagger
 * /lookups/headers:
 *   get:
 *     summary: List lookup headers
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Product, Order, Payment, Location, Customer, Promotion]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [System, Custom]
 *         description: Filter by type
 *     responses:
 *       200:
 *         description: Lookup headers retrieved successfully
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
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Product Categories"
 *                       description:
 *                         type: string
 *                         example: "Categories for products"
 *                       category:
 *                         type: string
 *                         example: "Product"
 *                       type:
 *                         type: string
 *                         example: "Custom"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Create lookup header
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *                 example: "Product Categories"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Categories for products"
 *               category:
 *                 type: string
 *                 enum: [Product, Order, Payment, Location, Customer, Promotion]
 *                 nullable: true
 *                 example: "Product"
 *               type:
 *                 type: string
 *                 enum: [System, Custom]
 *                 default: Custom
 *                 example: "Custom"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 default: Active
 *                 example: "Active"
 *     responses:
 *       201:
 *         description: Lookup header created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Product Categories"
 *                     description:
 *                       type: string
 *                       example: "Categories for products"
 *                     category:
 *                       type: string
 *                       example: "Product"
 *                     type:
 *                       type: string
 *                       example: "Custom"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/headers',
  parsePagination,
  validateQuery(headersList),
  ctrl.listHeaders
);

router.post('/headers',
  validateBody(headerCreate),
  ctrl.createHeader
);

/**
 * @swagger
 * /lookups/headers/{id}:
 *   put:
 *     summary: Update lookup header
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Header ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 120
 *                 example: "Updated Product Categories"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Updated description"
 *               category:
 *                 type: string
 *                 enum: [Product, Order, Payment, Location, Customer, Promotion]
 *                 nullable: true
 *                 example: "Product"
 *               type:
 *                 type: string
 *                 enum: [System, Custom]
 *                 example: "Custom"
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 example: "Active"
 *     responses:
 *       200:
 *         description: Lookup header updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Updated Product Categories"
 *                     description:
 *                       type: string
 *                       example: "Updated description"
 *                     category:
 *                       type: string
 *                       example: "Product"
 *                     type:
 *                       type: string
 *                       example: "Custom"
 *                     status:
 *                       type: string
 *                       example: "Active"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Delete lookup header
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Header ID
 *     responses:
 *       200:
 *         description: Lookup header deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Lookup header deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/headers/:id',
  validateParams(idParam),
  validateBody(headerUpdate),
  ctrl.updateHeader
);

router.delete('/headers/:id',
  validateParams(idParam),
  ctrl.deleteHeader
);

/**
 * @swagger
 * /lookups/values:
 *   get:
 *     summary: List all lookup values
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *       Get all lookup values without filtering by header
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Lookup values retrieved successfully
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
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       header_id:
 *                         type: integer
 *                         example: 1
 *                       value:
 *                         type: string
 *                         example: "Electronics"
 *                       description:
 *                         type: string
 *                         example: "Electronic products"
 *                       status:
 *                         type: string
 *                         example: "Active"
 *                       order:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Value routes
router.get('/values',
  parsePagination,
  validateQuery(valuesList),
  ctrl.listValues
);

router.get('/values/:id',
  validateParams(idParam),
  ctrl.getValueById
);

/**
 * @swagger
 * /lookups/values/by-headers:
 *   post:
 *     summary: Get lookup values by multiple header IDs
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       **Access Control**: Super_Admin, Admin, Manager roles only
 *       Get lookup values for multiple header IDs in a single request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - header_ids
 *             properties:
 *               header_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 example: [1, 2, 3]
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *                 default: Active
 *                 description: Filter by status
 *     responses:
 *       200:
 *         description: Lookup values retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         header_id:
 *                           type: integer
 *                           example: 1
 *                         value:
 *                           type: string
 *                           example: "Electronics"
 *                         description:
 *                           type: string
 *                           example: "Electronic products"
 *                         status:
 *                           type: string
 *                           example: "Active"
 *                         order:
 *                           type: integer
 *                           example: 1
 *                         parent_value_id:
 *                           type: integer
 *                           nullable: true
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                         header_name:
 *                           type: string
 *                           example: "Product Categories"
 *                         header_category:
 *                           type: string
 *                           example: "Product"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/values/by-headers',
  validateBody(require('../validators/lookups').valuesByHeaders),
  ctrl.getValuesByHeaders
);

router.post('/values',
  validateBody(valueCreate),
  ctrl.createValue
);

router.put('/values/:id',
  validateParams(idParam),
  validateBody(valueUpdate),
  ctrl.updateValue
);

router.delete('/values/:id',
  validateParams(idParam),
  ctrl.deleteValue
);

module.exports = router;
