const express = require('express');
const authController = require('../../controllers/authController');
const authMiddleware = require('../../middlewares/authMiddleware');
const { validateRegister, validateLogin } = require('../../validations/authValidation');
const router = express.Router();


// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.get('/me', authMiddleware.isAuthorized, authController.getCurrentUser);

module.exports = router;