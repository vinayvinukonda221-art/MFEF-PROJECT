const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { validateMarksInput } = require('../middleware/validator');

router.use(verifyToken);

router.get('/examinations', marksController.getExaminations);
router.post('/examinations', authorizeRoles('admin', 'faculty'), marksController.createExamination);

router.get('/', marksController.getMarks);
router.post('/', authorizeRoles('admin', 'faculty'), validateMarksInput, marksController.recordMarks);
router.put('/:id', authorizeRoles('admin', 'faculty'), marksController.updateMarks);

module.exports = router;

