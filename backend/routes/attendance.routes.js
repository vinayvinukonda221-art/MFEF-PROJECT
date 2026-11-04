const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { validateAttendanceInput } = require('../middleware/validator');

router.use(verifyToken);

router.get('/', attendanceController.getAttendance);
router.get('/summary/:studentId', attendanceController.getStudentAttendanceSummary);

// Mark / Update attendance (Admin & Faculty)
router.post('/', authorizeRoles('admin', 'faculty'), validateAttendanceInput, attendanceController.markAttendance);
router.put('/:id', authorizeRoles('admin', 'faculty'), attendanceController.updateAttendance);

module.exports = router;

