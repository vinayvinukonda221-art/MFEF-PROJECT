const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', facultyController.getAllFaculty);
router.get('/:id', facultyController.getFacultyById);

// Admin-only management
router.post('/', authorizeRoles('admin'), facultyController.createFaculty);
router.put('/:id', authorizeRoles('admin'), facultyController.updateFaculty);
router.delete('/:id', authorizeRoles('admin'), facultyController.deleteFaculty);

module.exports = router;

