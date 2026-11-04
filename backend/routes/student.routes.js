const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { validateStudentInput } = require('../middleware/validator');

// All endpoints require authentication
router.use(verifyToken);

// Accessible by admin and faculty (and students can view list or profile)
router.get('/', studentController.getAllStudents);
router.get('/:id', studentController.getStudentById);

// Admin-only operations
router.post('/', authorizeRoles('admin'), validateStudentInput, studentController.createStudent);
router.put('/:id', authorizeRoles('admin'), studentController.updateStudent);
router.delete('/:id', authorizeRoles('admin'), studentController.deleteStudent);

module.exports = router;

