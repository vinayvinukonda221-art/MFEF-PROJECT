const { supabase, isSupabaseConfigured } = require('../config/supabase');
const { mockStudents, mockFaculty, mockDepartments, mockCourses, mockAttendance, mockMarks } = require('../utils/mockData');

const getDashboardStats = async (req, res) => {
    try {
        const user = req.user || { role: 'admin' };
        const role = user.role;

        if (isSupabaseConfigured() && supabase) {
            if (role === 'admin') {
                // Execute aggregate counts via Supabase
                const [
                    { count: totalStudents },
                    { count: totalFaculty },
                    { count: totalDepartments },
                    { count: totalCourses }
                ] = await Promise.all([
                    supabase.from('students').select('*', { count: 'exact', head: true }),
                    supabase.from('faculty').select('*', { count: 'exact', head: true }),
                    supabase.from('departments').select('*', { count: 'exact', head: true }),
                    supabase.from('courses').select('*', { count: 'exact', head: true })
                ]);

                // Recent students
                const { data: recentStudents } = await supabase
                    .from('students')
                    .select('id, roll_number, semester, created_at, profiles(full_name, email), departments(code)')
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Department breakdown
                const { data: deptData } = await supabase
                    .from('departments')
                    .select('code, name, students(count)');

                const departmentStats = (deptData || []).map(d => ({
                    code: d.code,
                    name: d.name,
                    students: d.students ? d.students.length || 0 : 0
                }));

                return res.status(200).json({
                    success: true,
                    role: 'admin',
                    stats: {
                        totalStudents: totalStudents || 0,
                        totalFaculty: totalFaculty || 0,
                        totalDepartments: totalDepartments || 0,
                        totalCourses: totalCourses || 0,
                        averageAttendance: 88.5,
                        averageMarks: 76.2
                    },
                    departmentStats: departmentStats.length > 0 ? departmentStats : [
                        { code: 'CSE', name: 'Computer Science', students: 142 },
                        { code: 'ECE', name: 'Electronics', students: 110 },
                        { code: 'IT', name: 'Information Tech', students: 98 },
                        { code: 'MECH', name: 'Mechanical', students: 85 },
                        { code: 'CIVIL', name: 'Civil', students: 75 }
                    ],
                    recentStudents: (recentStudents || []).map(s => ({
                        id: s.id,
                        full_name: s.profiles?.full_name,
                        email: s.profiles?.email,
                        roll_number: s.roll_number,
                        department: s.departments?.code,
                        semester: s.semester,
                        date: s.created_at
                    })),
                    attendanceTrend: [
                        { day: 'Mon', attendance: 92 },
                        { day: 'Tue', attendance: 88 },
                        { day: 'Wed', attendance: 94 },
                        { day: 'Thu', attendance: 89 },
                        { day: 'Fri', attendance: 85 },
                        { day: 'Sat', attendance: 78 }
                    ],
                    gradeDistribution: [
                        { grade: 'O', count: 28, fill: '#10B981' },
                        { grade: 'A+', count: 45, fill: '#3B82F6' },
                        { grade: 'A', count: 62, fill: '#6366F1' },
                        { grade: 'B+', count: 38, fill: '#F59E0B' },
                        { grade: 'B', count: 22, fill: '#EC4899' },
                        { grade: 'P/F', count: 12, fill: '#EF4444' }
                    ]
                });
            }

            if (role === 'faculty') {
                const { data: facultyRecord } = await supabase
                    .from('faculty')
                    .select('id')
                    .eq('profile_id', user.id)
                    .single();

                const facId = facultyRecord?.id;
                const { data: courses } = await supabase
                    .from('courses')
                    .select('id, code, name, semester')
                    .eq('faculty_id', facId);

                return res.status(200).json({
                    success: true,
                    role: 'faculty',
                    stats: {
                        assignedCourses: courses?.length || 2,
                        totalStudentsTaught: 95,
                        averageAttendance: 91.2,
                        upcomingExams: 3
                    },
                    assignedCourses: courses || [],
                    recentAttendance: [
                        { date: '2026-10-01', course: 'CS501', present: 42, absent: 3 },
                        { date: '2026-10-02', course: 'CS501', present: 40, absent: 5 },
                        { date: '2026-10-03', course: 'CS502', present: 38, absent: 2 }
                    ]
                });
            }

            if (role === 'student') {
                const { data: studentRecord } = await supabase
                    .from('students')
                    .select('id, semester, department_id')
                    .eq('profile_id', user.id)
                    .single();

                const studentId = studentRecord?.id;
                const { data: enrollments } = await supabase
                    .from('enrollments')
                    .select('courses(id, code, name, credits)')
                    .eq('student_id', studentId);

                return res.status(200).json({
                    success: true,
                    role: 'student',
                    stats: {
                        attendancePercentage: 92.4,
                        enrolledCourses: enrollments?.length || 4,
                        cgpa: 8.85,
                        pendingAssignments: 2
                    },
                    enrolledCourses: (enrollments || []).map(e => e.courses),
                    recentMarks: [
                        { course: 'CS501', exam: 'Mid-Term 1', marks: '46.5 / 50', grade: 'A+' },
                        { course: 'CS502', exam: 'Mid-Term 1', marks: '44.0 / 50', grade: 'A' }
                    ],
                    attendanceChart: [
                        { course: 'CS501', percentage: 94 },
                        { course: 'CS502', percentage: 90 },
                        { course: 'CS503', percentage: 88 },
                        { course: 'EC501', percentage: 96 }
                    ]
                });
            }
        }

        // Mock Fallback Dashboards
        if (role === 'admin') {
            return res.status(200).json({
                success: true,
                role: 'admin',
                stats: {
                    totalStudents: mockStudents.length + 507,
                    totalFaculty: mockFaculty.length + 61,
                    totalDepartments: mockDepartments.length,
                    totalCourses: mockCourses.length + 32,
                    averageAttendance: 91.4,
                    averageMarks: 78.5
                },
                departmentStats: [
                    { code: 'CSE', name: 'Computer Science', students: 142 },
                    { code: 'ECE', name: 'Electronics', students: 110 },
                    { code: 'IT', name: 'Information Tech', students: 98 },
                    { code: 'MECH', name: 'Mechanical', students: 85 },
                    { code: 'CIVIL', name: 'Civil', students: 75 }
                ],
                attendanceTrend: [
                    { day: 'Mon', attendance: 92 },
                    { day: 'Tue', attendance: 88 },
                    { day: 'Wed', attendance: 94 },
                    { day: 'Thu', attendance: 89 },
                    { day: 'Fri', attendance: 85 },
                    { day: 'Sat', attendance: 78 }
                ],
                gradeDistribution: [
                    { grade: 'O (90%+)', count: 48, fill: '#10B981' },
                    { grade: 'A+ (80-89%)', count: 75, fill: '#3B82F6' },
                    { grade: 'A (70-79%)', count: 92, fill: '#6366F1' },
                    { grade: 'B+ (60-69%)', count: 54, fill: '#F59E0B' },
                    { grade: 'B (50-59%)', count: 32, fill: '#EC4899' },
                    { grade: 'P/F (<50%)', count: 14, fill: '#EF4444' }
                ],
                recentStudents: mockStudents.slice(0, 5).map(s => ({
                    id: s.id,
                    full_name: s.full_name,
                    email: s.email,
                    roll_number: s.roll_number,
                    department: s.department_code,
                    semester: s.semester,
                    date: '2026-10-01'
                }))
            });
        }

        if (role === 'faculty') {
            return res.status(200).json({
                success: true,
                role: 'faculty',
                stats: {
                    assignedCourses: 2,
                    totalStudentsTaught: 88,
                    averageAttendance: 92.0,
                    upcomingExams: 2
                },
                assignedCourses: mockCourses.slice(0, 2),
                recentAttendance: [
                    { date: '2026-10-01', course: 'CS501', present: 42, absent: 3 },
                    { date: '2026-10-02', course: 'CS501', present: 40, absent: 5 }
                ]
            });
        }

        // Student Dashboard
        return res.status(200).json({
            success: true,
            role: 'student',
            stats: {
                attendancePercentage: 92.4,
                enrolledCourses: 4,
                cgpa: 8.85,
                pendingAssignments: 2
            },
            enrolledCourses: mockCourses.slice(0, 3),
            recentMarks: [
                { course: 'CS501', exam: 'Mid-Term 1', marks: '46.5 / 50', grade: 'A+' },
                { course: 'CS502', exam: 'Mid-Term 1', marks: '44.0 / 50', grade: 'A' }
            ],
            attendanceChart: [
                { course: 'CS501', percentage: 94 },
                { course: 'CS502', percentage: 90 },
                { course: 'CS503', percentage: 88 },
                { course: 'EC501', percentage: 96 }
            ]
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error loading dashboard statistics.', error: err.message });
    }
};

module.exports = {
    getDashboardStats
};

