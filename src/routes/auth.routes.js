const router = require('express').Router();
const { validateBody } = require('../middleware/validate');
const { verifyJWT } = require('../middleware/auth');
const { register, login, updateMe } = require('../validators/auth');
const ctrl = require('../controllers/auth.controller');
router.post('/register', validateBody(register), ctrl.register);
router.post('/login', validateBody(login), ctrl.login);
router.get('/me', verifyJWT, ctrl.getMe);
router.put('/me', verifyJWT, validateBody(updateMe), ctrl.updateMe);
router.get('/verify', verifyJWT, ctrl.verify);
// Password reset routes for admin users
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);
module.exports = router;
