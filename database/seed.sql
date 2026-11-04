-- ==============================================================================
-- ADVANCED STUDENT MANAGEMENT SYSTEM (SMS)
-- SEED DATA SCRIPT (PostgreSQL / Supabase)
-- ==============================================================================

-- ==============================================================================
-- 1. INSERT DEPARTMENTS
-- ==============================================================================

INSERT INTO departments (id, code, name, description, head_of_department, contact_email, contact_phone, status)
VALUES
('d1111111-1111-1111-1111-111111111111', 'CSE', 'Computer Science and Engineering', 'Department of Computer Science and Software Engineering', 'Dr. Alan Turing', 'cse-hod@sms.edu', '+1-800-111-222', 'active'),
('d2222222-2222-2222-2222-222222222222', 'ECE', 'Electronics & Communication', 'Department of Electronics, Embedded Systems and Telecommunication', 'Dr. Claude Shannon', 'ece-hod@sms.edu', '+1-800-222-333', 'active'),
('d3333333-3333-3333-3333-333333333333', 'IT', 'Information Technology', 'Department of Network Architecture, Cloud and Cybersecurity', 'Dr. Tim Berners-Lee', 'it-hod@sms.edu', '+1-800-333-444', 'active'),
('d4444444-4444-4444-4444-444444444444', 'MECH', 'Mechanical Engineering', 'Department of Thermodynamics, Robotics and Manufacturing', 'Dr. Nikola Tesla', 'mech-hod@sms.edu', '+1-800-444-555', 'active'),
('d5555555-5555-5555-5555-555555555555', 'CIVIL', 'Civil and Structural Engineering', 'Department of Infrastructure, Smart Cities and Structural Design', 'Dr. John Smeaton', 'civil-hod@sms.edu', '+1-800-555-666', 'active')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- ==============================================================================
-- 2. CREATE AUTH USERS IN SUPABASE AUTH (Pass: Admin@123, Faculty@123, Student@123)
-- Note: When running in Supabase SQL editor, this creates auth credentials directly.
-- ==============================================================================

-- Admin User
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@sms.edu',
    crypt('Admin@123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Chief Administrator","role":"admin"}',
    FALSE, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Faculty User 1
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'f0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'faculty@sms.edu',
    crypt('Faculty@123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Prof. Grace Hopper","role":"faculty"}',
    FALSE, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Faculty User 2
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'f0000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'dr.turing@sms.edu',
    crypt('Faculty@123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Dr. Alan Turing","role":"faculty"}',
    FALSE, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Student User 1
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    's0000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'student@sms.edu',
    crypt('Student@123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Alex Johnson","role":"student"}',
    FALSE, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Student User 2
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    's0000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'emily.davis@sms.edu',
    crypt('Student@123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Emily Davis","role":"student"}',
    FALSE, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- Student User 3
INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, recovery_sent_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    's0000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'michael.brown@sms.edu',
    crypt('Student@123', gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Michael Brown","role":"student"}',
    FALSE, NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 3. PROFILES MAPPING
-- ==============================================================================

INSERT INTO profiles (id, email, full_name, role, phone, is_active)
VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@sms.edu', 'Chief Administrator', 'admin', '+1-555-0100', TRUE),
('f0000000-0000-0000-0000-000000000001', 'faculty@sms.edu', 'Prof. Grace Hopper', 'faculty', '+1-555-0201', TRUE),
('f0000000-0000-0000-0000-000000000002', 'dr.turing@sms.edu', 'Dr. Alan Turing', 'faculty', '+1-555-0202', TRUE),
('s0000000-0000-0000-0000-000000000001', 'student@sms.edu', 'Alex Johnson', 'student', '+1-555-0301', TRUE),
('s0000000-0000-0000-0000-000000000002', 'emily.davis@sms.edu', 'Emily Davis', 'student', '+1-555-0302', TRUE),
('s0000000-0000-0000-0000-000000000003', 'michael.brown@sms.edu', 'Michael Brown', 'student', '+1-555-0303', TRUE)
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- ==============================================================================
-- 4. FACULTY DETAILS
-- ==============================================================================

INSERT INTO faculty (id, profile_id, department_id, employee_id, designation, qualification, specialization, office_room)
VALUES
('fc111111-1111-1111-1111-111111111111', 'f0000000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 'FAC-CSE-001', 'Associate Professor', 'Ph.D. in Computer Science', 'Distributed Systems & Compiler Design', 'CS-Lab-301'),
('fc222222-2222-2222-2222-222222222222', 'f0000000-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 'FAC-CSE-002', 'Professor & HOD', 'Ph.D. in Artificial Intelligence', 'Algorithms & Computability Theory', 'CS-Admin-101')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 5. STUDENTS DETAILS
-- ==============================================================================

INSERT INTO students (id, profile_id, department_id, roll_number, registration_number, semester, academic_year, batch, date_of_birth, gender, blood_group, address, emergency_contact, status)
VALUES
('st111111-1111-1111-1111-111111111111', 's0000000-0000-0000-0000-000000000001', 'd1111111-1111-1111-1111-111111111111', 'CSE-2023-001', 'REG2023CSE001', 5, '2025-2026', '2023-2027', '2004-05-14', 'Male', 'O+', '42 Silicon Avenue, Cambridge, MA', '+1-555-9001', 'active'),
('st222222-2222-2222-2222-222222222222', 's0000000-0000-0000-0000-000000000002', 'd1111111-1111-1111-1111-111111111111', 'CSE-2023-002', 'REG2023CSE002', 5, '2025-2026', '2023-2027', '2004-09-22', 'Female', 'A+', '104 Beacon Street, Boston, MA', '+1-555-9002', 'active'),
('st333333-3333-3333-3333-333333333333', 's0000000-0000-0000-0000-000000000003', 'd2222222-2222-2222-2222-222222222222', 'ECE-2023-001', 'REG2023ECE001', 5, '2025-2026', '2023-2027', '2004-02-18', 'Male', 'B+', '77 Tech Drive, Waltham, MA', '+1-555-9003', 'active')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 6. COURSES
-- ==============================================================================

INSERT INTO courses (id, code, name, description, credits, semester, department_id, faculty_id)
VALUES
('c1111111-1111-1111-1111-111111111111', 'CS501', 'Database Management Systems', 'Relational database theory, normalization, SQL, indexing and ACID transactions', 4, 5, 'd1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'CS502', 'Operating Systems & Architecture', 'Processes, threads, CPU scheduling, virtual memory and concurrency', 4, 5, 'd1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111'),
('c3333333-3333-3333-3333-333333333333', 'CS503', 'Design & Analysis of Algorithms', 'Asymptotic analysis, greedy algorithms, dynamic programming and NP-completeness', 4, 5, 'd1111111-1111-1111-1111-111111111111', 'fc222222-2222-2222-2222-222222222222'),
('c4444444-4444-4444-4444-444444444444', 'EC501', 'Digital Signal Processing', 'Discrete-time signals, Z-transform, FFT, filter design and spectral analysis', 3, 5, 'd2222222-2222-2222-2222-222222222222', NULL)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. ENROLLMENTS
-- ==============================================================================

INSERT INTO enrollments (id, student_id, course_id, academic_year, semester, status)
VALUES
('e1111111-1111-1111-1111-111111111111', 'st111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '2025-2026', 5, 'enrolled'),
('e2222222-2222-2222-2222-222222222222', 'st111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', '2025-2026', 5, 'enrolled'),
('e3333333-3333-3333-3333-333333333333', 'st111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', '2025-2026', 5, 'enrolled'),
('e4444444-4444-4444-4444-444444444444', 'st222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', '2025-2026', 5, 'enrolled'),
('e5555555-5555-5555-5555-555555555555', 'st222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '2025-2026', 5, 'enrolled'),
('e6666666-6666-6666-6666-666666666666', 'st333333-3333-3333-3333-333333333333', 'c4444444-4444-4444-4444-444444444444', '2025-2026', 5, 'enrolled')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 8. ATTENDANCE SAMPLES
-- ==============================================================================

INSERT INTO attendance (student_id, course_id, faculty_id, date, status, remarks)
VALUES
('st111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-01', 'present', 'On time'),
('st111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-02', 'present', 'Active participation'),
('st111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-03', 'absent', 'Medical leave'),
('st111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-04', 'present', 'On time'),
('st111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-05', 'present', 'On time'),
('st222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-01', 'present', 'On time'),
('st222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-02', 'present', 'On time'),
('st222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-03', 'present', 'On time'),
('st222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-04', 'present', 'On time'),
('st222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'fc111111-1111-1111-1111-111111111111', '2026-10-05', 'late', '10 mins late')
ON CONFLICT (student_id, course_id, date) DO NOTHING;

-- ==============================================================================
-- 9. EXAMINATIONS
-- ==============================================================================

INSERT INTO examinations (id, course_id, exam_name, exam_type, total_marks, passing_marks, weightage_percentage, exam_date, academic_year, semester)
VALUES
('ex111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Mid-Term Assessment 1', 'midterm', 50.00, 20.00, 25.00, '2026-09-15', '2025-2026', 5),
('ex222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'End Semester Examination', 'final', 100.00, 40.00, 50.00, '2026-11-20', '2025-2026', 5),
('ex333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'OS Mid-Term Test', 'midterm', 50.00, 20.00, 25.00, '2026-09-18', '2025-2026', 5)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. MARKS
-- ==============================================================================

INSERT INTO marks (examination_id, student_id, marks_obtained, grade, grade_point, remarks)
VALUES
('ex111111-1111-1111-1111-111111111111', 'st111111-1111-1111-1111-111111111111', 46.50, 'A+', 9.30, 'Outstanding performance in SQL queries and normalization theory'),
('ex111111-1111-1111-1111-111111111111', 'st222222-2222-2222-2222-222222222222', 41.00, 'A', 8.20, 'Very good analytical design in ER modeling'),
('ex333333-3333-3333-3333-333333333333', 'st111111-1111-1111-1111-111111111111', 44.00, 'A', 8.80, 'Thorough understanding of process scheduling algorithms')
ON CONFLICT (examination_id, student_id) DO NOTHING;

