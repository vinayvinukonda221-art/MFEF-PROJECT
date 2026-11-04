const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { mockStudents } = require('../utils/mockData');

const getAcademicReport = async (req, res) => {
    try {
        const report = {
            academicYear: '2025-2026',
            generatedAt: new Date().toISOString(),
            overallPassRate: '94.2%',
            totalExamsConducted: 24,
            departmentPerformances: [
                { department: 'Computer Science and Engineering', passPercentage: 96.5, averageMarks: 81.2, topScorer: 'Alex Johnson (9.30 SGPA)' },
                { department: 'Electronics & Communication', passPercentage: 93.0, averageMarks: 76.8, topScorer: 'Michael Brown (8.80 SGPA)' },
                { department: 'Information Technology', passPercentage: 95.2, averageMarks: 79.4, topScorer: 'Sarah Connor (9.15 SGPA)' },
                { department: 'Mechanical Engineering', passPercentage: 91.8, averageMarks: 73.1, topScorer: 'David Miller (8.65 SGPA)' }
            ],
            lowAttendanceAlerts: [
                { rollNumber: 'CSE-2023-089', name: 'James Wilson', department: 'CSE', attendance: '68.4%', status: 'Critical Warning' },
                { rollNumber: 'ECE-2023-044', name: 'Sophia Martinez', department: 'ECE', attendance: '71.2%', status: 'Warning' }
            ]
        };

        return res.status(200).json({ success: true, report });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error generating report.', error: err.message });
    }
};

module.exports = {
    getAcademicReport
};

