/**
 * In-Memory Demo / Mock Data Store
 * Used when running locally prior to connecting live Supabase instance
 */

const mockDepartments = [
    {
        id: 'd1111111-1111-1111-1111-111111111111',
        code: 'CSE',
        name: 'Computer Science and Engineering',
        description: 'Department of Computer Science and Software Engineering',
        head_of_department: 'Dr. Alan Turing',
        contact_email: 'cse-hod@sms.edu',
        contact_phone: '+1-800-111-222',
        status: 'active',
        student_count: 142,
        faculty_count: 18
    },
    {
        id: 'd2222222-2222-2222-2222-222222222222',
        code: 'ECE',
        name: 'Electronics & Communication',
        description: 'Department of Electronics, Embedded Systems and Telecommunication',
        head_of_department: 'Dr. Claude Shannon',
        contact_email: 'ece-hod@sms.edu',
        contact_phone: '+1-800-222-333',
        status: 'active',
        student_count: 110,
        faculty_count: 14
    },
    {
        id: 'd3333333-3333-3333-3333-333333333333',
        code: 'IT',
        name: 'Information Technology',
        description: 'Department of Network Architecture, Cloud and Cybersecurity',
        head_of_department: 'Dr. Tim Berners-Lee',
        contact_email: 'it-hod@sms.edu',
        contact_phone: '+1-800-333-444',
        status: 'active',
        student_count: 98,
        faculty_count: 12
    },
    {
        id: 'd4444444-4444-4444-4444-444444444444',
        code: 'MECH',
        name: 'Mechanical Engineering',
        description: 'Department of Thermodynamics, Robotics and Manufacturing',
        head_of_department: 'Dr. Nikola Tesla',
        contact_email: 'mech-hod@sms.edu',
        contact_phone: '+1-800-444-555',
        status: 'active',
        student_count: 85,
        faculty_count: 10
    },
    {
        id: 'd5555555-5555-5555-5555-555555555555',
        code: 'CIVIL',
        name: 'Civil and Structural Engineering',
        description: 'Department of Infrastructure, Smart Cities and Structural Design',
        head_of_department: 'Dr. John Smeaton',
        contact_email: 'civil-hod@sms.edu',
        contact_phone: '+1-800-555-666',
        status: 'active',
        student_count: 75,
        faculty_count: 9
    }
];

const mockFaculty = [
    {
        id: 'fc111111-1111-1111-1111-111111111111',
        profile_id: 'f0000000-0000-0000-0000-000000000001',
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        employee_id: 'FAC-CSE-001',
        full_name: 'Prof. Grace Hopper',
        email: 'faculty@sms.edu',
        designation: 'Associate Professor',
        qualification: 'Ph.D. in Computer Science',
        specialization: 'Distributed Systems & Compilers',
        office_room: 'CS-Lab-301',
        phone: '+1-555-0201',
        status: 'active'
    },
    {
        id: 'fc222222-2222-2222-2222-222222222222',
        profile_id: 'f0000000-0000-0000-0000-000000000002',
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        employee_id: 'FAC-CSE-002',
        full_name: 'Dr. Alan Turing',
        email: 'dr.turing@sms.edu',
        designation: 'Professor & HOD',
        qualification: 'Ph.D. in Artificial Intelligence',
        specialization: 'Algorithms & Automata',
        office_room: 'CS-Admin-101',
        phone: '+1-555-0202',
        status: 'active'
    }
];

let mockStudents = [
    {
        id: 'st111111-1111-1111-1111-111111111111',
        profile_id: 's0000000-0000-0000-0000-000000000001',
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        department_code: 'CSE',
        roll_number: 'CSE-2023-001',
        registration_number: 'REG2023CSE001',
        full_name: 'Alex Johnson',
        email: 'student@sms.edu',
        phone: '+1-555-0301',
        semester: 5,
        academic_year: '2025-2026',
        batch: '2023-2027',
        date_of_birth: '2004-05-14',
        gender: 'Male',
        blood_group: 'O+',
        address: '42 Silicon Avenue, Cambridge, MA',
        emergency_contact: '+1-555-9001',
        status: 'active',
        attendance_percentage: 92.4,
        cgpa: 8.85
    },
    {
        id: 'st222222-2222-2222-2222-222222222222',
        profile_id: 's0000000-0000-0000-0000-000000000002',
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        department_code: 'CSE',
        roll_number: 'CSE-2023-002',
        registration_number: 'REG2023CSE002',
        full_name: 'Emily Davis',
        email: 'emily.davis@sms.edu',
        phone: '+1-555-0302',
        semester: 5,
        academic_year: '2025-2026',
        batch: '2023-2027',
        date_of_birth: '2004-09-22',
        gender: 'Female',
        blood_group: 'A+',
        address: '104 Beacon Street, Boston, MA',
        emergency_contact: '+1-555-9002',
        status: 'active',
        attendance_percentage: 96.0,
        cgpa: 9.12
    },
    {
        id: 'st333333-3333-3333-3333-333333333333',
        profile_id: 's0000000-0000-0000-0000-000000000003',
        department_id: 'd2222222-2222-2222-2222-222222222222',
        department_name: 'Electronics & Communication',
        department_code: 'ECE',
        roll_number: 'ECE-2023-001',
        registration_number: 'REG2023ECE001',
        full_name: 'Michael Brown',
        email: 'michael.brown@sms.edu',
        phone: '+1-555-0303',
        semester: 5,
        academic_year: '2025-2026',
        batch: '2023-2027',
        date_of_birth: '2004-02-18',
        gender: 'Male',
        blood_group: 'B+',
        address: '77 Tech Drive, Waltham, MA',
        emergency_contact: '+1-555-9003',
        status: 'active',
        attendance_percentage: 84.5,
        cgpa: 8.20
    }
];

let mockCourses = [
    {
        id: 'c1111111-1111-1111-1111-111111111111',
        code: 'CS501',
        name: 'Database Management Systems',
        description: 'Relational database theory, normalization, SQL, indexing and ACID transactions',
        credits: 4,
        semester: 5,
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        faculty_id: 'fc111111-1111-1111-1111-111111111111',
        faculty_name: 'Prof. Grace Hopper',
        is_elective: false
    },
    {
        id: 'c2222222-2222-2222-2222-222222222222',
        code: 'CS502',
        name: 'Operating Systems & Architecture',
        description: 'Processes, threads, CPU scheduling, virtual memory and concurrency',
        credits: 4,
        semester: 5,
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        faculty_id: 'fc111111-1111-1111-1111-111111111111',
        faculty_name: 'Prof. Grace Hopper',
        is_elective: false
    },
    {
        id: 'c3333333-3333-3333-3333-333333333333',
        code: 'CS503',
        name: 'Design & Analysis of Algorithms',
        description: 'Asymptotic analysis, greedy algorithms, dynamic programming and NP-completeness',
        credits: 4,
        semester: 5,
        department_id: 'd1111111-1111-1111-1111-111111111111',
        department_name: 'Computer Science and Engineering',
        faculty_id: 'fc222222-2222-2222-2222-222222222222',
        faculty_name: 'Dr. Alan Turing',
        is_elective: false
    },
    {
        id: 'c4444444-4444-4444-4444-444444444444',
        code: 'EC501',
        name: 'Digital Signal Processing',
        description: 'Discrete-time signals, Z-transform, FFT, filter design and spectral analysis',
        credits: 3,
        semester: 5,
        department_id: 'd2222222-2222-2222-2222-222222222222',
        department_name: 'Electronics & Communication',
        faculty_id: null,
        faculty_name: 'Unassigned',
        is_elective: false
    }
];

let mockAttendance = [
    {
        id: 'att-1',
        student_id: 'st111111-1111-1111-1111-111111111111',
        student_name: 'Alex Johnson',
        roll_number: 'CSE-2023-001',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        date: '2026-10-01',
        status: 'present',
        remarks: 'On time'
    },
    {
        id: 'att-2',
        student_id: 'st111111-1111-1111-1111-111111111111',
        student_name: 'Alex Johnson',
        roll_number: 'CSE-2023-001',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        date: '2026-10-02',
        status: 'present',
        remarks: 'Active participation'
    },
    {
        id: 'att-3',
        student_id: 'st111111-1111-1111-1111-111111111111',
        student_name: 'Alex Johnson',
        roll_number: 'CSE-2023-001',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        date: '2026-10-03',
        status: 'absent',
        remarks: 'Sick leave'
    },
    {
        id: 'att-4',
        student_id: 'st222222-2222-2222-2222-222222222222',
        student_name: 'Emily Davis',
        roll_number: 'CSE-2023-002',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        date: '2026-10-01',
        status: 'present',
        remarks: 'On time'
    },
    {
        id: 'att-5',
        student_id: 'st222222-2222-2222-2222-222222222222',
        student_name: 'Emily Davis',
        roll_number: 'CSE-2023-002',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        date: '2026-10-02',
        status: 'present',
        remarks: 'On time'
    }
];

let mockExaminations = [
    {
        id: 'ex111111-1111-1111-1111-111111111111',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        exam_name: 'Mid-Term Assessment 1',
        exam_type: 'midterm',
        total_marks: 50.00,
        passing_marks: 20.00,
        weightage_percentage: 25.00,
        exam_date: '2026-09-15',
        academic_year: '2025-2026',
        semester: 5
    },
    {
        id: 'ex222222-2222-2222-2222-222222222222',
        course_id: 'c1111111-1111-1111-1111-111111111111',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        exam_name: 'End Semester Examination',
        exam_type: 'final',
        total_marks: 100.00,
        passing_marks: 40.00,
        weightage_percentage: 50.00,
        exam_date: '2026-11-20',
        academic_year: '2025-2026',
        semester: 5
    },
    {
        id: 'ex333333-3333-3333-3333-333333333333',
        course_id: 'c2222222-2222-2222-2222-222222222222',
        course_code: 'CS502',
        course_name: 'Operating Systems & Architecture',
        exam_name: 'OS Mid-Term Test',
        exam_type: 'midterm',
        total_marks: 50.00,
        passing_marks: 20.00,
        weightage_percentage: 25.00,
        exam_date: '2026-09-18',
        academic_year: '2025-2026',
        semester: 5
    }
];

let mockMarks = [
    {
        id: 'm1111111-1111-1111-1111-111111111111',
        examination_id: 'ex111111-1111-1111-1111-111111111111',
        exam_name: 'Mid-Term Assessment 1',
        student_id: 'st111111-1111-1111-1111-111111111111',
        student_name: 'Alex Johnson',
        roll_number: 'CSE-2023-001',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        total_marks: 50.00,
        marks_obtained: 46.50,
        grade: 'A+',
        grade_point: 9.30,
        remarks: 'Outstanding performance in SQL queries and normalization theory'
    },
    {
        id: 'm2222222-2222-2222-2222-222222222222',
        examination_id: 'ex111111-1111-1111-1111-111111111111',
        exam_name: 'Mid-Term Assessment 1',
        student_id: 'st222222-2222-2222-2222-222222222222',
        student_name: 'Emily Davis',
        roll_number: 'CSE-2023-002',
        course_code: 'CS501',
        course_name: 'Database Management Systems',
        total_marks: 50.00,
        marks_obtained: 41.00,
        grade: 'A',
        grade_point: 8.20,
        remarks: 'Very good analytical design in ER modeling'
    },
    {
        id: 'm3333333-3333-3333-3333-333333333333',
        examination_id: 'ex333333-3333-3333-3333-333333333333',
        exam_name: 'OS Mid-Term Test',
        student_id: 'st111111-1111-1111-1111-111111111111',
        student_name: 'Alex Johnson',
        roll_number: 'CSE-2023-001',
        course_code: 'CS502',
        course_name: 'Operating Systems & Architecture',
        total_marks: 50.00,
        marks_obtained: 44.00,
        grade: 'A',
        grade_point: 8.80,
        remarks: 'Thorough understanding of process scheduling algorithms'
    }
];

const mockUsers = [
    {
        id: 'a0000000-0000-0000-0000-000000000001',
        email: 'admin@sms.edu',
        password: 'Admin@123',
        full_name: 'Chief Administrator',
        role: 'admin',
        phone: '+1-555-0100'
    },
    {
        id: 'f0000000-0000-0000-0000-000000000001',
        email: 'faculty@sms.edu',
        password: 'Faculty@123',
        full_name: 'Prof. Grace Hopper',
        role: 'faculty',
        faculty_id: 'fc111111-1111-1111-1111-111111111111',
        department: 'Computer Science and Engineering',
        phone: '+1-555-0201'
    },
    {
        id: 's0000000-0000-0000-0000-000000000001',
        email: 'student@sms.edu',
        password: 'Student@123',
        full_name: 'Alex Johnson',
        role: 'student',
        student_id: 'st111111-1111-1111-1111-111111111111',
        roll_number: 'CSE-2023-001',
        department: 'Computer Science and Engineering',
        phone: '+1-555-0301'
    }
];

module.exports = {
    mockDepartments,
    mockFaculty,
    mockStudents,
    mockCourses,
    mockAttendance,
    mockExaminations,
    mockMarks,
    mockUsers
};

