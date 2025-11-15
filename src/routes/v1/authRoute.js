// routes/authRoute.js
const express = require('express');
const authController = require('../../controllers/authController');
const { validateRegister, validateLogin } = require('../../validations/authValidation');
const router = express.Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Social Login: KHÔNG dùng checkJwt middleware
router.post('/social-callback', authController.socialCallback);

module.exports = router;