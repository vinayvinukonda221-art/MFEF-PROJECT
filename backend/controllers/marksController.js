const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { calculateGrade } = require('../utils/gradeCalculator');
let { mockExaminations, mockMarks, mockFaculty, mockCourses, mockStudents } = require('../utils/mockData');

/**
 * Helper: Resolve trusted faculty ID from authenticated user profile
 */
const resolveFacultyId = async (req) => {
    if (!req.user || req.user.role !== 'faculty') return null;

    if (isSupabaseConfigured() && supabase) {
        const client = req.supabase || supabase;
        const { data: fac } = await client
            .from('faculty')
            .select('id')
            .eq('profile_id', req.user.id)
            .single();
        return fac?.id || null;
    }

    const fac = mockFaculty.find(f => f.profile_id === req.user.id || f.id === req.user.id || f.email === req.user.email);
    return fac?.id || null;
};

/**
 * Helper: Check if course is assigned to faculty member
 */
const verifyCourseAssignment = async (req, courseId, facultyId) => {
    if (req.user.role === 'admin') return true;
    if (!facultyId || !courseId) return false;

    if (isSupabaseConfigured() && supabase) {
        const client = req.supabase || supabase;
        const { data: course } = await client
            .from('courses')
            .select('id, faculty_id')
            .eq('id', courseId)
            .single();

        return Boolean(course && course.faculty_id === facultyId);
    }

    const course = mockCourses.find(c => c.id === courseId);
    return Boolean(course && course.faculty_id === facultyId);
};

/**
 * Get Examinations List
 * GET /api/marks/examinations
 */
const getExaminations = async (req, res) => {
    try {
        const { course_id, semester } = req.query;

        if (isSupabaseConfigured() && supabase) {
            const client = req.supabase || supabase;
            let query = client
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

            const formatted = (data || []).map(e => ({
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
 * Create Examination (Admin and Faculty)
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
        const user = req.user;

        if (!course_id || !exam_name || !exam_type || !exam_date || !semester) {
            return res.status(400).json({
                success: false,
                message: 'course_id, exam_name, exam_type, exam_date, and semester are required.'
            });
        }

        // Faculty authorization check: course must be taught by this faculty member
        if (user.role === 'faculty') {
            const trustedFacultyId = await resolveFacultyId(req);
            const isAssigned = await verifyCourseAssignment(req, course_id, trustedFacultyId);
            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message: 'Access forbidden: Faculty can only schedule examinations for courses assigned to them.'
                });
            }
        }

        if (isSupabaseConfigured() && supabase) {
            const client = req.supabase || supabase;
            const { data, error } = await client
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
 * Get Marks with Record-Level Authorization
 * GET /api/marks
 */
const getMarks = async (req, res) => {
    try {
        const { examination_id, student_id, course_id } = req.query;
        const user = req.user;

        // Security check for Students: strictly limited to viewing own marks
        let effectiveStudentId = student_id;
        if (user.role === 'student') {
            let myStudentId = null;
            if (isSupabaseConfigured() && supabase) {
                const client = req.supabase || supabase;
                const { data: st } = await client.from('students').select('id').eq('profile_id', user.id).single();
                myStudentId = st?.id;
            } else {
                const st = mockStudents.find(s => s.profile_id === user.id || s.id === user.id || s.email === user.email);
                myStudentId = st?.id || mockStudents[0]?.id;
            }

            if (student_id && myStudentId && student_id !== myStudentId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access forbidden: Students are only permitted to view their own examination marks.'
                });
            }
            effectiveStudentId = myStudentId;
        }

        if (isSupabaseConfigured() && supabase) {
            const client = req.supabase || supabase;
            let query = client
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
            if (effectiveStudentId) query = query.eq('student_id', effectiveStudentId);

            const { data, error } = await query;
            if (error) return res.status(500).json({ success: false, message: error.message });

            let formatted = (data || []).map(m => ({
                id: m.id,
                examination_id: m.examinations?.id,
                exam_name: m.examinations?.exam_name,
                exam_type: m.examinations?.exam_type,
                total_marks: m.examinations?.total_marks,
                passing_marks: m.examinations?.passing_marks,
                course_id: m.examinations?.courses?.id,
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
                formatted = formatted.filter(m => m.course_id === course_id);
            }

            return res.status(200).json({ success: true, marks: formatted });
        }

        // Mock Fallback
        let filtered = [...mockMarks];
        if (examination_id) filtered = filtered.filter(m => m.examination_id === examination_id);
        if (effectiveStudentId) filtered = filtered.filter(m => m.student_id === effectiveStudentId);

        return res.status(200).json({ success: true, marks: filtered });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving marks.', error: err.message });
    }
};

/**
 * Record Marks with Auto-Grading & Authorization
 * POST /api/marks
 */
const recordMarks = async (req, res) => {
    try {
        const { examination_id, course_id, student_id, marks_obtained, remarks } = req.body;
        const user = req.user;

        // Faculty authorization check: must teach the course for this examination
        if (user.role === 'faculty') {
            const trustedFacultyId = await resolveFacultyId(req);
            let isAssigned = false;

            if (isSupabaseConfigured() && supabase) {
                const client = req.supabase || supabase;
                const { data: exam } = await client
                    .from('examinations')
                    .select('course_id, courses(faculty_id)')
                    .eq('id', examination_id)
                    .single();

                const targetFacultyId = exam?.courses?.faculty_id;
                if (targetFacultyId && targetFacultyId === trustedFacultyId) {
                    isAssigned = true;
                }
            } else {
                const exam = mockExaminations.find(e => e.id === examination_id);
                const targetCourseId = course_id || exam?.course_id;
                const course = mockCourses.find(c => c.id === targetCourseId);
                if (course && course.faculty_id && course.faculty_id === trustedFacultyId) {
                    isAssigned = true;
                }
            }

            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message: 'Access forbidden: Faculty members can only enter marks for examinations in their assigned courses.'
                });
            }
        }

        if (isSupabaseConfigured() && supabase) {
            const client = req.supabase || supabase;
            const { data: exam, error: examErr } = await client
                .from('examinations')
                .select('total_marks')
                .eq('id', examination_id)
                .single();

            const total = exam ? exam.total_marks : 100;
            const evalResult = calculateGrade(marks_obtained, total);

            const { data, error } = await client
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
 * Update Marks with Authorization
 * PUT /api/marks/:id
 */
const updateMarks = async (req, res) => {
    try {
        const { id } = req.params;
        const { marks_obtained, remarks } = req.body;
        const user = req.user;

        // Faculty authorization check for updates
        if (user.role === 'faculty') {
            const trustedFacultyId = await resolveFacultyId(req);
            let isAssigned = false;

            if (isSupabaseConfigured() && supabase) {
                const client = req.supabase || supabase;
                const { data: mark } = await client
                    .from('marks')
                    .select('examination_id, examinations(course_id, courses(faculty_id))')
                    .eq('id', id)
                    .single();

                if (mark && mark.examinations?.courses?.faculty_id === trustedFacultyId) {
                    isAssigned = true;
                }
            } else {
                isAssigned = true; // demo mode
            }

            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message: 'Access forbidden: You cannot modify marks for an examination outside your assigned courses.'
                });
            }
        }

        if (isSupabaseConfigured() && supabase) {
            const client = req.supabase || supabase;
            const { data: currentMark } = await client
                .from('marks')
                .select('examination_id, examinations(total_marks)')
                .eq('id', id)
                .single();

            const total = currentMark?.examinations?.total_marks || 100;
            const evalResult = calculateGrade(marks_obtained, total);

            const { data, error } = await client
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
