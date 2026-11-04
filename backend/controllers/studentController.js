const { supabase, isSupabaseConfigured } = require('../config/supabase');
let { mockStudents } = require('../utils/mockData');

/**
 * Get All Students with Filtering & Pagination
 * GET /api/students
 */
const getAllStudents = async (req, res) => {
    try {
        const { search, department_id, semester, status, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('students')
                .select(`
                    id, roll_number, registration_number, semester, academic_year, batch,
                    date_of_birth, gender, blood_group, address, emergency_contact, status,
                    departments (id, code, name),
                    profiles (id, email, full_name, phone, avatar_url)
                `, { count: 'exact' });

            if (department_id) {
                query = query.eq('department_id', department_id);
            }
            if (semester) {
                query = query.eq('semester', semester);
            }
            if (status) {
                query = query.eq('status', status);
            }
            if (search) {
                query = query.or(`roll_number.ilike.%${search}%,registration_number.ilike.%${search}%`);
            }

            query = query.range(offset, offset + limitNum - 1).order('created_at', { ascending: false });

            const { data, count, error } = await query;

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Database query failed.',
                    error: error.message
                });
            }

            // Flatten data for easier frontend consumption
            const formatted = data.map(s => ({
                id: s.id,
                profile_id: s.profiles?.id,
                full_name: s.profiles?.full_name,
                email: s.profiles?.email,
                phone: s.profiles?.phone,
                avatar_url: s.profiles?.avatar_url,
                roll_number: s.roll_number,
                registration_number: s.registration_number,
                department_id: s.departments?.id,
                department_code: s.departments?.code,
                department_name: s.departments?.name,
                semester: s.semester,
                academic_year: s.academic_year,
                batch: s.batch,
                gender: s.gender,
                blood_group: s.blood_group,
                status: s.status,
                emergency_contact: s.emergency_contact,
                address: s.address
            }));

            return res.status(200).json({
                success: true,
                students: formatted,
                pagination: {
                    total: count,
                    page: pageNum,
                    limit: limitNum,
                    totalPages: Math.ceil(count / limitNum)
                }
            });
        }

        // Mock Fallback
        let filtered = [...mockStudents];
        if (department_id) {
            filtered = filtered.filter(s => s.department_id === department_id);
        }
        if (semester) {
            filtered = filtered.filter(s => s.semester === parseInt(semester));
        }
        if (search) {
            const term = search.toLowerCase();
            filtered = filtered.filter(s =>
                s.full_name.toLowerCase().includes(term) ||
                s.roll_number.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term)
            );
        }

        const total = filtered.length;
        const paginated = filtered.slice(offset, offset + limitNum);

        return res.status(200).json({
            success: true,
            students: paginated,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching students list.',
            error: err.message
        });
    }
};

/**
 * Get Student by ID
 * GET /api/students/:id
 */
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { data: student, error } = await supabase
                .from('students')
                .select(`
                    *,
                    departments (id, code, name),
                    profiles (id, email, full_name, phone, avatar_url),
                    enrollments (
                        id, status, semester, academic_year,
                        courses (id, code, name, credits)
                    )
                `)
                .eq('id', id)
                .single();

            if (error || !student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student record not found.'
                });
            }

            return res.status(200).json({
                success: true,
                student
            });
        }

        const student = mockStudents.find(s => s.id === id || s.profile_id === id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found in demo data.'
            });
        }

        return res.status(200).json({
            success: true,
            student
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error retrieving student.',
            error: err.message
        });
    }
};

/**
 * Create New Student
 * POST /api/students
 */
const createStudent = async (req, res) => {
    try {
        const {
            email,
            password = 'Password@123',
            full_name,
            phone,
            department_id,
            roll_number,
            registration_number,
            semester = 1,
            academic_year = '2025-2026',
            batch = '2023-2027',
            date_of_birth,
            gender,
            blood_group,
            address,
            emergency_contact
        } = req.body;

        if (isSupabaseConfigured() && supabase) {
            // 1. Create Supabase Auth user via admin client
            const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name,
                    role: 'student'
                }
            });

            if (authErr) {
                return res.status(400).json({
                    success: false,
                    message: `Could not create authentication user: ${authErr.message}`
                });
            }

            const userId = authUser.user.id;

            // 2. Insert Profile record
            await supabase.from('profiles').upsert({
                id: userId,
                email,
                full_name,
                role: 'student',
                phone
            });

            // 3. Insert Student Record
            const { data: student, error: studentErr } = await supabase
                .from('students')
                .insert([{
                    profile_id: userId,
                    department_id,
                    roll_number,
                    registration_number: registration_number || `REG-${roll_number}`,
                    semester,
                    academic_year,
                    batch,
                    date_of_birth,
                    gender,
                    blood_group,
                    address,
                    emergency_contact,
                    status: 'active'
                }])
                .select()
                .single();

            if (studentErr) {
                // Rollback user
                await supabase.auth.admin.deleteUser(userId);
                return res.status(400).json({
                    success: false,
                    message: `Failed to insert student record: ${studentErr.message}`
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Student registered successfully.',
                student
            });
        }

        // Mock Fallback
        const newId = `st-${Date.now()}`;
        const newStudent = {
            id: newId,
            profile_id: `p-${Date.now()}`,
            department_id,
            department_code: 'CSE',
            department_name: 'Computer Science and Engineering',
            roll_number,
            registration_number: registration_number || `REG-${roll_number}`,
            full_name,
            email,
            phone,
            semester: parseInt(semester),
            academic_year,
            batch,
            date_of_birth,
            gender,
            blood_group,
            address,
            emergency_contact,
            status: 'active',
            attendance_percentage: 100,
            cgpa: 0.0
        };

        mockStudents.unshift(newStudent);

        return res.status(201).json({
            success: true,
            message: 'Student added to demo system successfully.',
            student: newStudent
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error registering student.',
            error: err.message
        });
    }
};

/**
 * Update Student Details
 * PUT /api/students/:id
 */
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            phone,
            department_id,
            semester,
            status,
            date_of_birth,
            gender,
            blood_group,
            address,
            emergency_contact
        } = req.body;

        if (isSupabaseConfigured() && supabase) {
            // First get the student to find profile_id
            const { data: existingStudent, error: findErr } = await supabase
                .from('students')
                .select('profile_id')
                .eq('id', id)
                .single();

            if (findErr || !existingStudent) {
                return res.status(404).json({
                    success: false,
                    message: 'Student record not found.'
                });
            }

            // Update profile
            if (full_name || phone) {
                await supabase
                    .from('profiles')
                    .update({
                        full_name,
                        phone,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingStudent.profile_id);
            }

            // Update student
            const { data: updated, error: updateErr } = await supabase
                .from('students')
                .update({
                    department_id,
                    semester: semester ? parseInt(semester) : undefined,
                    status,
                    date_of_birth,
                    gender,
                    blood_group,
                    address,
                    emergency_contact,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (updateErr) {
                return res.status(400).json({
                    success: false,
                    message: updateErr.message
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Student record updated successfully.',
                student: updated
            });
        }

        // Mock Fallback
        const index = mockStudents.findIndex(s => s.id === id);
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student not found in demo data.'
            });
        }

        mockStudents[index] = {
            ...mockStudents[index],
            ...req.body
        };

        return res.status(200).json({
            success: true,
            message: 'Student record updated successfully.',
            student: mockStudents[index]
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error updating student record.',
            error: err.message
        });
    }
};

/**
 * Delete Student
 * DELETE /api/students/:id
 */
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { data: student } = await supabase
                .from('students')
                .select('profile_id')
                .eq('id', id)
                .single();

            if (student && student.profile_id) {
                // Deleting profile cascades to student, or auth user deletion
                await supabase.auth.admin.deleteUser(student.profile_id);
                await supabase.from('profiles').delete().eq('id', student.profile_id);
            } else {
                await supabase.from('students').delete().eq('id', id);
            }

            return res.status(200).json({
                success: true,
                message: 'Student record deleted successfully.'
            });
        }

        const initialLength = mockStudents.length;
        mockStudents = mockStudents.filter(s => s.id !== id);

        if (mockStudents.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Student not found in demo data.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student deleted successfully.'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting student.',
            error: err.message
        });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
};

