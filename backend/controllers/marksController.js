const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { calculateGrade } = require('../utils/gradeCalculator');
let { mockExaminations, mockMarks } = require('../utils/mockData');

/**
 * Get Examinations List
 * GET /api/marks/examinations
 */
const getExaminations = async (req, res) => {
    try {
        const { course_id, semester } = req.query;

        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('examinations')
                .select(`
                    id, exam_name, exam_type, total_marks, passing_marks, weightage_percentage,
                    exam_date, academic_year, semester,
                    courses (id, code, name)
                `);

            if (course_id) query = query.eq('course_id', course_id);
            if (semester) query = query.eq('semester', semester);

            const { data, error } = await query.order('exam_date', { ascending: false });

            if (error) return res.status(500).json({ success: false, message: error.message });

            const formatted = data.map(e => ({
                id: e.id,
                exam_name: e.exam_name,
                exam_type: e.exam_type,
                total_marks: e.total_marks,
                passing_marks: e.passing_marks,
                weightage_percentage: e.weightage_percentage,
                exam_date: e.exam_date,
                academic_year: e.academic_year,
                semester: e.semester,
                course_id: e.courses?.id,
                course_code: e.courses?.code,
                course_name: e.courses?.name
            }));

            return res.status(200).json({ success: true, examinations: formatted });
        }

        return res.status(200).json({ success: true, examinations: mockExaminations });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving examinations.', error: err.message });
    }
};

/**
 * Create Examination
 * POST /api/marks/examinations
 */
const createExamination = async (req, res) => {
    try {
        const {
            course_id,
            exam_name,
            exam_type,
            total_marks = 100,
            passing_marks = 40,
            weightage_percentage = 100,
            exam_date,
            academic_year = '2025-2026',
            semester
        } = req.body;

        if (!course_id || !exam_name || !exam_type || !exam_date || !semester) {
            return res.status(400).json({
                success: false,
                message: 'course_id, exam_name, exam_type, exam_date, and semester are required.'
            });
        }

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('examinations')
                .insert([{
                    course_id,
                    exam_name,
                    exam_type,
                    total_marks,
                    passing_marks,
                    weightage_percentage,
                    exam_date,
                    academic_year,
                    semester: parseInt(semester)
                }])
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(201).json({ success: true, message: 'Examination created.', examination: data });
        }

        const newExam = {
            id: `ex-${Date.now()}`,
            course_id,
            exam_name,
            exam_type,
            total_marks,
            passing_marks,
            weightage_percentage,
            exam_date,
            academic_year,
            semester: parseInt(semester),
            course_code: 'CS501',
            course_name: 'Database Management Systems'
        };
        mockExaminations.push(newExam);

        return res.status(201).json({ success: true, message: 'Examination added in demo data.', examination: newExam });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error creating exam.', error: err.message });
    }
};

/**
 * Get Marks
 * GET /api/marks
 */
const getMarks = async (req, res) => {
    try {
        const { examination_id, student_id, course_id } = req.query;

        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('marks')
                .select(`
                    id, marks_obtained, grade, grade_point, remarks, created_at,
                    examinations (
                        id, exam_name, exam_type, total_marks, passing_marks,
                        courses (id, code, name)
                    ),
                    students (
                        id, roll_number,
                        profiles (full_name)
                    )
                `);

            if (examination_id) query = query.eq('examination_id', examination_id);
            if (student_id) query = query.eq('student_id', student_id);

            const { data, error } = await query;
            if (error) return res.status(500).json({ success: false, message: error.message });

            let formatted = data.map(m => ({
                id: m.id,
                examination_id: m.examinations?.id,
                exam_name: m.examinations?.exam_name,
                exam_type: m.examinations?.exam_type,
                total_marks: m.examinations?.total_marks,
                passing_marks: m.examinations?.passing_marks,
                course_code: m.examinations?.courses?.code,
                course_name: m.examinations?.courses?.name,
                student_id: m.students?.id,
                roll_number: m.students?.roll_number,
                student_name: m.students?.profiles?.full_name,
                marks_obtained: m.marks_obtained,
                grade: m.grade,
                grade_point: m.grade_point,
                remarks: m.remarks
            }));

            if (course_id) {
                formatted = formatted.filter(m => m.examinations?.courses?.id === course_id);
            }

            return res.status(200).json({ success: true, marks: formatted });
        }

        // Mock Fallback
        let filtered = [...mockMarks];
        if (examination_id) filtered = filtered.filter(m => m.examination_id === examination_id);
        if (student_id) filtered = filtered.filter(m => m.student_id === student_id);

        return res.status(200).json({ success: true, marks: filtered });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving marks.', error: err.message });
    }
};

/**
 * Record Marks with Auto-Grading
 * POST /api/marks
 */
const recordMarks = async (req, res) => {
    try {
        const { examination_id, student_id, marks_obtained, remarks } = req.body;

        if (isSupabaseConfigured() && supabase) {
            // Fetch total marks for this examination to calculate grade accurately
            const { data: exam, error: examErr } = await supabase
                .from('examinations')
                .select('total_marks')
                .eq('id', examination_id)
                .single();

            const total = exam ? exam.total_marks : 100;
            const evalResult = calculateGrade(marks_obtained, total);

            const { data, error } = await supabase
                .from('marks')
                .upsert([{
                    examination_id,
                    student_id,
                    marks_obtained: Number(marks_obtained),
                    grade: evalResult.grade,
                    grade_point: evalResult.gradePoint,
                    remarks: remarks || evalResult.remarks
                }], { onConflict: 'examination_id, student_id' })
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });

            return res.status(201).json({
                success: true,
                message: 'Marks recorded and graded successfully.',
                marks: data,
                evaluation: evalResult
            });
        }

        // Mock calculation
        const evalResult = calculateGrade(marks_obtained, 50);
        const newRecord = {
            id: `m-${Date.now()}`,
            examination_id,
            exam_name: 'Mid-Term Assessment 1',
            student_id,
            student_name: 'Student Name',
            roll_number: 'CSE-2023-001',
            course_code: 'CS501',
            course_name: 'Database Management Systems',
            total_marks: 50.00,
            marks_obtained: Number(marks_obtained),
            grade: evalResult.grade,
            grade_point: evalResult.gradePoint,
            remarks: remarks || evalResult.remarks
        };
        mockMarks.push(newRecord);

        return res.status(201).json({
            success: true,
            message: 'Marks recorded in demo data.',
            marks: newRecord,
            evaluation: evalResult
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error recording marks.', error: err.message });
    }
};

/**
 * Update Marks
 * PUT /api/marks/:id
 */
const updateMarks = async (req, res) => {
    try {
        const { id } = req.params;
        const { marks_obtained, remarks } = req.body;

        if (isSupabaseConfigured() && supabase) {
            const { data: currentMark } = await supabase
                .from('marks')
                .select('examination_id, examinations(total_marks)')
                .eq('id', id)
                .single();

            const total = currentMark?.examinations?.total_marks || 100;
            const evalResult = calculateGrade(marks_obtained, total);

            const { data, error } = await supabase
                .from('marks')
                .update({
                    marks_obtained: Number(marks_obtained),
                    grade: evalResult.grade,
                    grade_point: evalResult.gradePoint,
                    remarks: remarks || evalResult.remarks,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Marks updated.', marks: data });
        }

        const idx = mockMarks.findIndex(m => m.id === id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Marks record not found.' });

        const evalResult = calculateGrade(marks_obtained, mockMarks[idx].total_marks || 50);
        mockMarks[idx] = {
            ...mockMarks[idx],
            marks_obtained: Number(marks_obtained),
            grade: evalResult.grade,
            grade_point: evalResult.gradePoint,
            remarks: remarks || evalResult.remarks
        };

        return res.status(200).json({ success: true, message: 'Marks updated in demo data.', marks: mockMarks[idx] });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating marks.', error: err.message });
    }
};

module.exports = {
    getExaminations,
    createExamination,
    getMarks,
    recordMarks,
    updateMarks
};

