const router = require('express').Router();
const { validateBody, validateParams, validateQuery } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { checkRole } = require('../middleware/rbac');
const { idParam } = require('../validators/common');
const validators = require('../validators/adminReviews');
const ctrl = require('../controllers/reviews.controller');

router.use(verifyJWT);
router.use(checkRole(['Super_Admin', 'Admin', 'Manager']));

router.get('/', validateQuery(validators.listManualReviews), ctrl.list);
router.post('/', validateBody(validators.createManualReview), ctrl.create);
router.put('/:id', validateParams(idParam), validateBody(validators.updateManualReview), ctrl.update);
router.delete('/:id', validateParams(idParam), ctrl.remove);

module.exports = router;
