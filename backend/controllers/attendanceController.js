const { supabase, isSupabaseConfigured } = require('../config/supabase');
let { mockAttendance } = require('../utils/mockData');

const getAttendance = async (req, res) => {
    try {
        const { course_id, student_id, date, status } = req.query;

        if (isSupabaseConfigured() && supabase) {
            let query = supabase
                .from('attendance')
                .select(`
                    id, date, status, remarks, created_at,
                    students (
                        id, roll_number,
                        profiles (full_name)
                    ),
                    courses (id, code, name),
                    faculty (
                        id,
                        profiles (full_name)
                    )
                `);

            if (course_id) query = query.eq('course_id', course_id);
            if (student_id) query = query.eq('student_id', student_id);
            if (date) query = query.eq('date', date);
            if (status) query = query.eq('status', status);

            const { data, error } = await query.order('date', { ascending: false });

            if (error) return res.status(500).json({ success: false, message: error.message });

            const formatted = data.map(a => ({
                id: a.id,
                date: a.date,
                status: a.status,
                remarks: a.remarks,
                student_id: a.students?.id,
                roll_number: a.students?.roll_number,
                student_name: a.students?.profiles?.full_name,
                course_id: a.courses?.id,
                course_code: a.courses?.code,
                course_name: a.courses?.name,
                faculty_name: a.faculty?.profiles?.full_name
            }));

            return res.status(200).json({ success: true, attendance: formatted });
        }

        // Mock Fallback
        let filtered = [...mockAttendance];
        if (course_id) filtered = filtered.filter(a => a.course_id === course_id);
        if (student_id) filtered = filtered.filter(a => a.student_id === student_id);
        if (date) filtered = filtered.filter(a => a.date === date);
        if (status) filtered = filtered.filter(a => a.status === status);

        return res.status(200).json({ success: true, attendance: filtered });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error retrieving attendance records.', error: err.message });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { course_id, date, records, student_id, status, remarks } = req.body;
        const faculty_id = req.user.faculty_id || null;

        // Support batch marking (e.g., records: [{ student_id, status, remarks }])
        if (records && Array.isArray(records) && records.length > 0) {
            const rowsToInsert = records.map(r => ({
                course_id,
                date,
                faculty_id,
                student_id: r.student_id,
                status: r.status,
                remarks: r.remarks || ''
            }));

            if (isSupabaseConfigured() && supabase) {
                const { data, error } = await supabase
                    .from('attendance')
                    .upsert(rowsToInsert, { onConflict: 'student_id, course_id, date' })
                    .select();

                if (error) return res.status(400).json({ success: false, message: error.message });
                return res.status(201).json({ success: true, message: `Attendance marked for ${records.length} students.`, count: records.length });
            }

            // Mock batch upsert
            rowsToInsert.forEach(row => {
                const existingIdx = mockAttendance.findIndex(a => a.student_id === row.student_id && a.course_id === row.course_id && a.date === row.date);
                if (existingIdx !== -1) {
                    mockAttendance[existingIdx] = { ...mockAttendance[existingIdx], ...row };
                } else {
                    mockAttendance.push({ id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, ...row });
                }
            });

            return res.status(201).json({ success: true, message: `Demo attendance marked for ${records.length} students.` });
        }

        // Single record marking
        if (!student_id || !course_id || !date || !status) {
            return res.status(400).json({ success: false, message: 'student_id, course_id, date and status are required.' });
        }

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('attendance')
                .upsert([{ student_id, course_id, faculty_id, date, status, remarks }], { onConflict: 'student_id, course_id, date' })
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(201).json({ success: true, message: 'Attendance recorded.', attendance: data });
        }

        const newEntry = {
            id: `att-${Date.now()}`,
            student_id,
            course_id,
            date,
            status,
            remarks: remarks || '',
            student_name: 'Student',
            course_name: 'Course'
        };
        mockAttendance.push(newEntry);

        return res.status(201).json({ success: true, message: 'Attendance recorded in demo mode.', attendance: newEntry });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error marking attendance.', error: err.message });
    }
};

const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('attendance')
                .update({ status, remarks, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) return res.status(400).json({ success: false, message: error.message });
            return res.status(200).json({ success: true, message: 'Attendance updated.', attendance: data });
        }

        const idx = mockAttendance.findIndex(a => a.id === id);
        if (idx === -1) return res.status(404).json({ success: false, message: 'Attendance record not found.' });

        mockAttendance[idx] = { ...mockAttendance[idx], status, remarks };
        return res.status(200).json({ success: true, message: 'Attendance updated.', attendance: mockAttendance[idx] });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error updating attendance.', error: err.message });
    }
};

const getStudentAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (isSupabaseConfigured() && supabase) {
            const { data, error } = await supabase
                .from('attendance')
                .select('status, course_id, courses(code, name)')
                .eq('student_id', studentId);

            if (error) return res.status(500).json({ success: false, message: error.message });

            const total = data.length;
            const present = data.filter(d => d.status === 'present').length;
            const late = data.filter(d => d.status === 'late').length;
            const absent = data.filter(d => d.status === 'absent').length;
            const percentage = total > 0 ? (((present + late * 0.5) / total) * 100).toFixed(2) : 0;

            return res.status(200).json({
                success: true,
                summary: { total, present, late, absent, percentage: Number(percentage) }
            });
        }

        const studentRecords = mockAttendance.filter(a => a.student_id === studentId);
        const total = studentRecords.length || 10;
        const present = studentRecords.filter(a => a.status === 'present').length || 9;
        const absent = total - present;
        const percentage = Number(((present / total) * 100).toFixed(2));

        return res.status(200).json({
            success: true,
            summary: { total, present, late: 0, absent, percentage }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error summarizing attendance.', error: err.message });
    }
};

module.exports = {
    getAttendance,
    markAttendance,
    updateAttendance,
    getStudentAttendanceSummary
};

