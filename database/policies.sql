-- ==============================================================================
-- ADVANCED STUDENT MANAGEMENT SYSTEM (SMS)
-- ROW LEVEL SECURITY (RLS) POLICIES (PostgreSQL / Supabase)
-- ==============================================================================

-- ==============================================================================
-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. SECURITY HELPER FUNCTIONS
-- ==============================================================================

-- Function to get the role of the currently authenticated user
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is faculty
CREATE OR REPLACE FUNCTION is_faculty()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'faculty'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is a student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'student'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get faculty ID for current user
CREATE OR REPLACE FUNCTION get_faculty_id()
RETURNS UUID AS $$
    SELECT f.id FROM public.faculty f 
    WHERE f.profile_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get student ID for current user
CREATE OR REPLACE FUNCTION get_student_id()
RETURNS UUID AS $$
    SELECT s.id FROM public.students s 
    WHERE s.profile_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 3. PROFILES POLICIES
-- ==============================================================================

-- Admins can do everything on profiles
CREATE POLICY "Admin full access on profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin());

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR is_admin() OR is_faculty());

-- Users can update specific fields of their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- Allow initial profile creation upon sign up
CREATE POLICY "Insert profile on registration"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() OR is_admin());

-- ==============================================================================
-- 4. DEPARTMENTS POLICIES
-- ==============================================================================

-- All authenticated users can read departments
CREATE POLICY "All authenticated users can view departments"
ON departments FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert, update or delete departments
CREATE POLICY "Admins manage departments"
ON departments FOR ALL
TO authenticated
USING (is_admin());

-- ==============================================================================
-- 5. FACULTY POLICIES
-- ==============================================================================

-- Admins have full access to faculty
CREATE POLICY "Admins full access on faculty"
ON faculty FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can view their own details and other faculty
CREATE POLICY "Faculty can view faculty list"
ON faculty FOR SELECT
TO authenticated
USING (true);

-- Faculty can update their own profile details
CREATE POLICY "Faculty can update own details"
ON faculty FOR UPDATE
TO authenticated
USING (profile_id = auth.uid());

-- ==============================================================================
-- 6. STUDENTS POLICIES
-- ==============================================================================

-- Admins full access
CREATE POLICY "Admins full access on students"
ON students FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can view all students (or enrolled students)
CREATE POLICY "Faculty can view students"
ON students FOR SELECT
TO authenticated
USING (is_faculty());

-- Students can view their own record
CREATE POLICY "Students can view own record"
ON students FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Students can update emergency contact or address
CREATE POLICY "Students can update own contact info"
ON students FOR UPDATE
TO authenticated
USING (profile_id = auth.uid());

-- ==============================================================================
-- 7. COURSES POLICIES
-- ==============================================================================

-- Everyone can view courses
CREATE POLICY "All authenticated users can view courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Admins can manage all courses
CREATE POLICY "Admins manage courses"
ON courses FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can update course syllabus/description for courses assigned to them
CREATE POLICY "Faculty update assigned courses"
ON courses FOR UPDATE
TO authenticated
USING (faculty_id = get_faculty_id());

-- ==============================================================================
-- 8. ENROLLMENTS POLICIES
-- ==============================================================================

-- Admins full access
CREATE POLICY "Admins manage enrollments"
ON enrollments FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can view enrollments for courses they teach
CREATE POLICY "Faculty view enrollments for their courses"
ON enrollments FOR SELECT
TO authenticated
USING (
    is_faculty() AND EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = enrollments.course_id AND c.faculty_id = get_faculty_id()
    )
);

-- Students can view their own enrollments
CREATE POLICY "Students view own enrollments"
ON enrollments FOR SELECT
TO authenticated
USING (student_id = get_student_id());

-- ==============================================================================
-- 9. ATTENDANCE POLICIES
-- ==============================================================================

-- Admins full access
CREATE POLICY "Admins manage attendance"
ON attendance FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can view and mark attendance for courses they teach
CREATE POLICY "Faculty manage course attendance"
ON attendance FOR ALL
TO authenticated
USING (
    is_faculty() AND (
        faculty_id = get_faculty_id() OR
        EXISTS (
            SELECT 1 FROM courses c 
            WHERE c.id = attendance.course_id AND c.faculty_id = get_faculty_id()
        )
    )
);

-- Students can view ONLY their own attendance
CREATE POLICY "Students view own attendance"
ON attendance FOR SELECT
TO authenticated
USING (student_id = get_student_id());

-- ==============================================================================
-- 10. EXAMINATIONS POLICIES
-- ==============================================================================

-- Admins full access
CREATE POLICY "Admins manage examinations"
ON examinations FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can manage examinations for their courses
CREATE POLICY "Faculty manage examinations"
ON examinations FOR ALL
TO authenticated
USING (
    is_faculty() AND EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = examinations.course_id AND c.faculty_id = get_faculty_id()
    )
);

-- Students can view examinations for enrolled courses
CREATE POLICY "Students view enrolled examinations"
ON examinations FOR SELECT
TO authenticated
USING (
    is_student() AND EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.course_id = examinations.course_id AND e.student_id = get_student_id()
    )
);

-- ==============================================================================
-- 11. MARKS POLICIES
-- ==============================================================================

-- Admins full access
CREATE POLICY "Admins manage marks"
ON marks FOR ALL
TO authenticated
USING (is_admin());

-- Faculty can view and manage marks for exams in their courses
CREATE POLICY "Faculty manage marks for their courses"
ON marks FOR ALL
TO authenticated
USING (
    is_faculty() AND EXISTS (
        SELECT 1 FROM examinations exam
        JOIN courses c ON exam.course_id = c.id
        WHERE exam.id = marks.examination_id AND c.faculty_id = get_faculty_id()
    )
);

-- Students can view ONLY their own marks
CREATE POLICY "Students view own marks"
ON marks FOR SELECT
TO authenticated
USING (student_id = get_student_id());

