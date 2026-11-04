const { supabase, isSupabaseConfigured } = require('../config/supabase');
let { mockFaculty } = require('../utils/mockData');

const getAllFaculty = async (req, res) => {
    try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('faculty')
                .select(`
                    id, employee_id, designation, qualification, specialization, office_room, status,
                    departments (id, code, name),
                    profiles (id, email, full_name, phone, avatar_url)
                `);

            if (error) return res.status(500).json({ success: false, message: error.message });

            const formatted = data.map(f => ({
                id: f.id,
                profile_id: f.profiles?.id,
                full_name: f.profiles?.full_name,
                email: f.profiles?.email,
                phone: f.profiles?.phone,
                employee_id: f.employee_id,
                designation: f.designation,
                qualification: f.qualification,
                specialization: f.specialization,
                office_room: f.office_room,
                status: f.status,
                department_id: f.departments?.id,
                department_name: f.departments?.name
            }));

            return res.status(200).json({ success: true, faculty: formatted });
        }

        return res.status(200).json({ success: true, faculty: mockFaculty });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error fetching faculty.', error: err.message });
    }
};

const getFacultyById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('faculty')
                .select(`
                    *,
                    departments (id, code, name),
                    profiles (id, email, full_name, phone),
                    courses (id, code, name, credits, semester)
                `)
                .eq('id', id)
                .single();

            if (error || !data) return res.status(404).json({ success: false, message: 'Faculty not found.' });
            return res.status(200).json({ success: true, faculty: data });
        }

        const fac = mockFaculty.find(f => f.id === id || f.profile_id === id);
        if (!fac) return res.status(404).json({ success: false, message: 'Faculty not found.' });

        return res.status(200).json({ success: true, faculty: fac });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving faculty member.', error: err.message });
    }
};

const createFaculty = async (req, res) => {
    try {
        const {
            email,
            password = 'Password@123',
            full_name,
            phone,
            department_id,
            employee_id,
            designation,
            qualification,
            specialization,
            office_room
        } = req.body;

        if (!email || !full_name || !employee_id || !designation) {
            return res.status(400).json({
                success: false,
                message: 'Email, Full Name, Employee ID and Designation are required.'
            });
        }

        if (isSupabaseConfigured() && supabase) {
            const { data: authUser, error: authErr } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { full_name, role: 'faculty' }
            });

            if (authErr) {
                return res.status(400).json({ success: false, message: authErr.message });
            }

            const userId = authUser.user.id;

            await supabase.from('profiles').upsert({
                id: userId,
                email,
                full_name,
                role: 'faculty',
                phone
            });

            const { data: faculty, error: facErr } = await supabase
                .from('faculty')
                .insert([{
                    profile_id: userId,
                    department_id,
                    employee_id,
                    designation,
                    qualification,
                    specialization,
                    office_room,
                    status: 'active'
                }])
                .select()
                .single();

            if (facErr) {
                await supabase.auth.admin.deleteUser(userId);
                return res.status(400).json({ success: false, message: facErr.message });
            }

            return res.status(201).json({ success: true, message: 'Faculty added successfully.', faculty });
        }

        const newFac = {
            id: `fc-${Date.now()}`,
            profile_id: `p-${Date.now()}`,
            department_id,
            department_name: 'Computer Science and Engineering',
            employee_id,
            full_name,
            email,
            designation,
            qualification,
            specialization,
            office_room,
            phone,
            status: 'active'
        };
        mockFaculty.push(newFac);

        return res.status(201).json({ success: true, message: 'Faculty added to demo data.', faculty: newFac });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error creating faculty record.', error: err.message });
    }
};

const updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name,
            phone,
            department_id,
            designation,
            qualification,
            specialization,
            office_room,
            status
        } = req.body;

        if (isSupabaseConfigured() && supabase) {
            // Find existing faculty to locate profile_id
            const { data: existingFac, error: findErr } = await supabase
                .from('faculty')
                .select('profile_id')
                .eq('id', id)
                .single();

            if (findErr || !existingFac) {
                return res.status(404).json({ success: false, message: 'Faculty record not found.' });
            }

            // Update profile if full_name or phone is provided
            if (full_name || phone) {
                await supabase
                    .from('profiles')
                    .update({
                        full_name,
                        phone,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingFac.profile_id);
            }

            // Update faculty record
            const facultyUpdates = {};
            if (department_id !== undefined) facultyUpdates.department_id = department_id;
            if (designation !== undefined) facultyUpdates.designation = designation;
            if (qualification !== undefined) facultyUpdates.qualification = qualification;
            if (specialization !== undefined) facultyUpdates.specialization = specialization;
            if (office_room !== undefined) facultyUpdates.office_room = office_room;
            if (status !== undefined) facultyUpdates.status = status;
            facultyUpdates.updated_at = new Date().toISOString();

            const { data, error } = await supabase
                .from('faculty')
                .update(facultyUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Faculty updated.', faculty: data });
        }

        const idx = mockFaculty.findIndex(f => f.id === id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Faculty not found.' });

        mockFaculty[idx] = { ...mockFaculty[idx], ...req.body };
        return res.status(200).json({ success: true, message: 'Faculty updated.', faculty: mockFaculty[idx] });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating faculty.', error: err.message });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { data: faculty } = await supabase.from('faculty').select('profile_id').eq('id', id).single();
            if (faculty && faculty.profile_id) {
                try {
                    if (supabase?.auth?.admin?.deleteUser) {
                        await supabase.auth.admin.deleteUser(faculty.profile_id);
                    }
                } catch (authErr) {
                    console.warn('[DeleteFaculty] Auth user deletion skipped/non-fatal:', authErr.message);
                }
                await supabase.from('profiles').delete().eq('id', faculty.profile_id);
                await supabase.from('faculty').delete().eq('id', id);
            } else {
                await supabase.from('faculty').delete().eq('id', id);
            }
            return res.status(200).json({ success: true, message: 'Faculty deleted successfully.' });
        }

        mockFaculty = mockFaculty.filter(f => f.id !== id);
        return res.status(200).json({ success: true, message: 'Faculty deleted from demo data.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error deleting faculty.', error: err.message });
    }
};

module.exports = {
    getAllFaculty,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty
};

