const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Admin / Faculty management
router.post('/', authorizeRoles('admin'), courseController.createCourse);
router.put('/:id', authorizeRoles('admin', 'faculty'), courseController.updateCourse);
router.delete('/:id', authorizeRoles('admin'), courseController.deleteCourse);

module.exports = router;

