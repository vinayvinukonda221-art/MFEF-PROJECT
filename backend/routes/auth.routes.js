const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Brute-force protected login endpoint
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Admin-restricted routes: Create and list administrators
router.post('/create-admin', verifyToken, authorizeRoles('admin'), authController.createAdmin);
router.get('/admins', verifyToken, authorizeRoles('admin'), authController.getAdmins);

module.exports = router;
