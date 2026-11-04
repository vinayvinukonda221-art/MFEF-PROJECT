const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);
router.get('/summary', authorizeRoles('admin', 'faculty'), reportController.getAcademicReport);

module.exports = router;

