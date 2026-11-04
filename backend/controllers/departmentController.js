const { supabase, isSupabaseConfigured } = require('../config/supabase');
let { mockDepartments } = require('../utils/mockData');

const getAllDepartments = async (req, res) => {
    try {
        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('departments')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                return res.status(500).json({ success: false, message: error.message });
            }

            return res.status(200).json({ success: true, departments: data });
        }

        return res.status(200).json({ success: true, departments: mockDepartments });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving departments.', error: err.message });
    }
};

const createDepartment = async (req, res) => {
    try {
        const { code, name, description, head_of_department, contact_email, contact_phone } = req.body;

        if (!code || !name) {
            return res.status(400).json({ success: false, message: 'Code and Name are required.' });
        }

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('departments')
                .insert([{ code, name, description, head_of_department, contact_email, contact_phone }])
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(201).json({ success: true, message: 'Department created.', department: data });
        }

        const newDept = {
            id: `d-${Date.now()}`,
            code,
            name,
            description,
            head_of_department,
            contact_email,
            contact_phone,
            status: 'active',
            student_count: 0,
            faculty_count: 0
        };
        mockDepartments.push(newDept);

        return res.status(201).json({ success: true, message: 'Department created in demo data.', department: newDept });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error creating department.', error: err.message });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('departments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Department updated.', department: data });
        }

        const idx = mockDepartments.findIndex(d => d.id === id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Department not found.' });

        mockDepartments[idx] = { ...mockDepartments[idx], ...updates };
        return res.status(200).json({ success: true, message: 'Department updated.', department: mockDepartments[idx] });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating department.', error: err.message });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { error } = await supabase.from('departments').delete().eq('id', id);
            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Department deleted successfully.' });
        }

        mockDepartments = mockDepartments.filter(d => d.id !== id);
        return res.status(200).json({ success: true, message: 'Department deleted from demo data.' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error deleting department.', error: err.message });
    }
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};

