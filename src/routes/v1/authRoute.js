const express = require('express');
const {authController} = require('../../controllers/authController');
const {authMiddleware} = require('../../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Protected route
router.get('/me', authMiddleware.isAuthorized, authController.getCurrentUser);

module.exports = router;