/**
 * Light, robust input validation helper middleware
 */

const validateStudentInput = (req, res, next) => {
    const { full_name, email, roll_number, semester, department_id } = req.body;

    const errors = [];
    if (!full_name || full_name.trim().length < 2) errors.push('Full name is required (min 2 characters).');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email address is required.');
    if (!roll_number || roll_number.trim().length < 2) errors.push('Roll number is required.');
    if (semester === undefined || semester < 1 || semester > 8) errors.push('Semester must be an integer between 1 and 8.');
    if (!department_id) errors.push('Department ID is required.');

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Input validation failed',
            errors
        });
    }

    next();
};

const validateMarksInput = (req, res, next) => {
    const { examination_id, student_id, marks_obtained } = req.body;

    const errors = [];
    if (!examination_id) errors.push('Examination ID is required.');
    if (!student_id) errors.push('Student ID is required.');
    if (marks_obtained === undefined || isNaN(marks_obtained) || Number(marks_obtained) < 0) {
        errors.push('Valid non-negative marks_obtained value is required.');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Input validation failed',
            errors
        });
    }

    next();
};

const validateAttendanceInput = (req, res, next) => {
    const { course_id, date, records } = req.body;

    const errors = [];
    if (!course_id) errors.push('Course ID is required.');
    if (!date) errors.push('Attendance date is required.');
    if (!records || !Array.isArray(records) || records.length === 0) {
        // Check if single student_id + status
        if (!req.body.student_id || !req.body.status) {
            errors.push('Either batch "records" array or single "student_id" and "status" must be provided.');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Input validation failed',
            errors
        });
    }

    next();
};

module.exports = {
    validateStudentInput,
    validateMarksInput,
    validateAttendanceInput
};

