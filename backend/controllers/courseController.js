const { supabase, isSupabaseConfigured } = require('../config/supabase');
let { mockCourses } = require('../utils/mockData');

const getAllCourses = async (req, res) => {
    try {
        const { department_id, semester, search } = req.query;

        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('courses')
                .select(`
                    id, code, name, description, credits, semester, is_elective, syllabus_url,
                    departments (id, code, name),
                    faculty (id, employee_id, profiles (full_name))
                `);

            if (department_id) query = query.eq('department_id', department_id);
            if (semester) query = query.eq('semester', semester);
            if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);

            const { data, error } = await query.order('code', { ascending: true });

            if (error) {
                return res.status(500).json({ success: false, message: error.message });
            }

            const formatted = data.map(c => ({
                id: c.id,
                code: c.code,
                name: c.name,
                description: c.description,
                credits: c.credits,
                semester: c.semester,
                is_elective: c.is_elective,
                syllabus_url: c.syllabus_url,
                department_id: c.departments?.id,
                department_name: c.departments?.name,
                department_code: c.departments?.code,
                faculty_id: c.faculty?.id,
                faculty_name: c.faculty?.profiles?.full_name || 'Unassigned'
            }));

            return res.status(200).json({ success: true, courses: formatted });
        }

        // Mock Fallback
        let filtered = [...mockCourses];
        if (department_id) filtered = filtered.filter(c => c.department_id === department_id);
        if (semester) filtered = filtered.filter(c => c.semester === parseInt(semester));
        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term));
        }

        return res.status(200).json({ success: true, courses: filtered });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving courses.', error: err.message });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { data: course, error } = await supabase
                .from('courses')
                .select(`
                    *,
                    departments (id, code, name),
                    faculty (id, employee_id, profiles (full_name, email))
                `)
                .eq('id', id)
                .single();

            if (error || !course) {
                return res.status(404).json({ success: false, message: 'Course not found.' });
            }

            return res.status(200).json({ success: true, course });
        }

        const course = mockCourses.find(c => c.id === id);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found.' });
        }

        return res.status(200).json({ success: true, course });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving course.', error: err.message });
    }
};

const createCourse = async (req, res) => {
    try {
        const { code, name, description, credits, semester, department_id, faculty_id, is_elective } = req.body;

        if (!code || !name || !credits || !semester || !department_id) {
            return res.status(400).json({
                success: false,
                message: 'Code, Name, Credits, Semester and Department ID are required.'
            });
        }

        if (isSupabaseConfigured() && supabase) {
            const { data: course, error } = await supabase
                .from('courses')
                .insert([{
                    code,
                    name,
                    description,
                    credits: parseInt(credits),
                    semester: parseInt(semester),
                    department_id,
                    faculty_id: faculty_id || null,
                    is_elective: Boolean(is_elective)
                }])
                .select()
                .single();

            if (error) {
                return res.status(400).json({ success: false, message: error.message });
            }

            return res.status(201).json({ success: true, message: 'Course created successfully.', course });
        }

        const newCourse = {
            id: `c-${Date.now()}`,
            code,
            name,
            description,
            credits: parseInt(credits),
            semester: parseInt(semester),
            department_id,
            department_name: 'Computer Science and Engineering',
            faculty_id: faculty_id || null,
            faculty_name: faculty_id ? 'Assigned Faculty' : 'Unassigned',
            is_elective: Boolean(is_elective)
        };
        mockCourses.push(newCourse);

        return res.status(201).json({ success: true, message: 'Course added to demo data.', course: newCourse });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error creating course.', error: err.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (isSupabaseConfigured() && supabase) {
            const { data: course, error } = await supabase
                .from('courses')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Course updated.', course });
        }

        const idx = mockCourses.findIndex(c => c.id === id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Course not found.' });

        mockCourses[idx] = { ...mockCourses[idx], ...updates };
        return res.status(200).json({ success: true, message: 'Course updated.', course: mockCourses[idx] });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating course.', error: err.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('courses').delete().eq('id', id);
            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Course deleted successfully.' });
        }

        mockCourses = mockCourses.filter(c => c.id !== id);
        return res.status(200).json({ success: true, message: 'Course removed from demo data.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error deleting course.', error: err.message });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};

