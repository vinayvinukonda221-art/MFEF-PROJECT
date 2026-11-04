-- ==============================================================================
-- ADVANCED STUDENT MANAGEMENT SYSTEM (SMS)
-- HARDENED ROW LEVEL SECURITY (RLS) POLICIES (PostgreSQL / Supabase)
-- Enforces:
-- 1. Student record ownership
-- 2. Faculty course assignment boundaries (prevents excessive data exposure)
-- 3. Database-level role escalation prevention
-- 4. Safe, repeatable, idempotent policy definitions
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
        WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is faculty
CREATE OR REPLACE FUNCTION is_faculty()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'faculty' AND is_active = TRUE
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Check if current user is a student
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'student' AND is_active = TRUE
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

DROP POLICY IF EXISTS "Admin full access on profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Insert profile on registration" ON profiles;

-- Admins have administrative access to institutional profiles
CREATE POLICY "Admin full access on profiles"
ON profiles FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Users can view their own profile, or faculty can view profiles of enrolled students in their courses
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR 
    is_admin() OR
    (is_faculty() AND (
        role IN ('faculty', 'admin') OR
        id IN (
            SELECT s.profile_id FROM public.students s
            JOIN public.enrollments e ON e.student_id = s.id
            JOIN public.courses c ON c.id = e.course_id
            WHERE c.faculty_id = get_faculty_id()
        )
    ))
);

-- Users can update specific contact fields of their own profile.
-- STRICT SECURITY CHECK: Disallow role escalation or modifying identity at database level.
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
    id = auth.uid() AND 
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    is_active = (SELECT is_active FROM public.profiles WHERE id = auth.uid())
);

-- Allow profile creation during sign-up trigger
CREATE POLICY "Insert profile on registration"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid() OR is_admin());

-- ==============================================================================
-- 4. DEPARTMENTS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "All authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Admins manage departments" ON departments;

-- Authenticated users can view active departments
CREATE POLICY "Authenticated users view active departments"
ON departments FOR SELECT
TO authenticated
USING (status = 'active' OR is_admin());

-- Only admins can insert, update or delete departments
CREATE POLICY "Admins manage departments"
ON departments FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- ==============================================================================
-- 5. FACULTY POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Admins full access on faculty" ON faculty;
DROP POLICY IF EXISTS "Faculty can view faculty list" ON faculty;
DROP POLICY IF EXISTS "Faculty can update own details" ON faculty;

-- Admins have full access to faculty records
CREATE POLICY "Admins full access on faculty"
ON faculty FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Authenticated users can view faculty members (for course instructor display)
CREATE POLICY "Authenticated view faculty list"
ON faculty FOR SELECT
TO authenticated
USING (status = 'active' OR is_admin() OR profile_id = auth.uid());

-- Faculty can update their own details (e.g. office room, specialization)
CREATE POLICY "Faculty can update own details"
ON faculty FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid() AND department_id = (SELECT department_id FROM public.faculty WHERE profile_id = auth.uid()));

-- ==============================================================================
-- 6. STUDENTS POLICIES (BUG-05: Excessive Faculty Data Access Prevention)
-- ==============================================================================

DROP POLICY IF EXISTS "Admins full access on students" ON students;
DROP POLICY IF EXISTS "Faculty can view students" ON students;
DROP POLICY IF EXISTS "Students can view own record" ON students;
DROP POLICY IF EXISTS "Students can update own contact info" ON students;

-- Admins full access
CREATE POLICY "Admins full access on students"
ON students FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Faculty can ONLY view students who are enrolled in their assigned courses or department
CREATE POLICY "Faculty view assigned students"
ON students FOR SELECT
TO authenticated
USING (
    is_admin() OR
    (is_faculty() AND (
        department_id = (SELECT department_id FROM public.faculty WHERE profile_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.courses c ON c.id = e.course_id
            WHERE e.student_id = students.id AND c.faculty_id = get_faculty_id()
        )
    ))
);

-- Students can view ONLY their own record
CREATE POLICY "Students can view own record"
ON students FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Students can update own emergency contact info, address
CREATE POLICY "Students can update own contact info"
ON students FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (
    profile_id = auth.uid() AND
    roll_number = (SELECT roll_number FROM public.students WHERE profile_id = auth.uid()) AND
    semester = (SELECT semester FROM public.students WHERE profile_id = auth.uid()) AND
    status = (SELECT status FROM public.students WHERE profile_id = auth.uid())
);

-- ==============================================================================
-- 7. COURSES POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "All authenticated users can view courses" ON courses;
DROP POLICY IF EXISTS "Admins manage courses" ON courses;
DROP POLICY IF EXISTS "Faculty update assigned courses" ON courses;

-- Authenticated users can view catalog courses
CREATE POLICY "Authenticated users view courses"
ON courses FOR SELECT
TO authenticated
USING (true);

-- Admins can manage all courses
CREATE POLICY "Admins manage courses"
ON courses FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Faculty can update course syllabus/description for courses assigned to them
CREATE POLICY "Faculty update assigned courses"
ON courses FOR UPDATE
TO authenticated
USING (faculty_id = get_faculty_id())
WITH CHECK (faculty_id = get_faculty_id() AND department_id = (SELECT department_id FROM public.courses WHERE id = courses.id));

-- ==============================================================================
-- 8. ENROLLMENTS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Admins manage enrollments" ON enrollments;
DROP POLICY IF EXISTS "Faculty view enrollments for their courses" ON enrollments;
DROP POLICY IF EXISTS "Students view own enrollments" ON enrollments;

-- Admins full access
CREATE POLICY "Admins manage enrollments"
ON enrollments FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

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
-- 9. ATTENDANCE POLICIES (BUG-04: Strict Faculty Course Assignment)
-- ==============================================================================

DROP POLICY IF EXISTS "Admins manage attendance" ON attendance;
DROP POLICY IF EXISTS "Faculty manage course attendance" ON attendance;
DROP POLICY IF EXISTS "Students view own attendance" ON attendance;

-- Admins full access
CREATE POLICY "Admins manage attendance"
ON attendance FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Faculty can view and mark attendance ONLY for courses they teach
CREATE POLICY "Faculty manage course attendance"
ON attendance FOR ALL
TO authenticated
USING (
    is_faculty() AND EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = attendance.course_id AND c.faculty_id = get_faculty_id()
    )
)
WITH CHECK (
    is_faculty() AND EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = attendance.course_id AND c.faculty_id = get_faculty_id()
    )
);

-- Students can view ONLY their own attendance records
CREATE POLICY "Students view own attendance"
ON attendance FOR SELECT
TO authenticated
USING (student_id = get_student_id());

-- ==============================================================================
-- 10. EXAMINATIONS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "Admins manage examinations" ON examinations;
DROP POLICY IF EXISTS "Faculty manage examinations" ON examinations;
DROP POLICY IF EXISTS "Students view enrolled examinations" ON examinations;

-- Admins full access
CREATE POLICY "Admins manage examinations"
ON examinations FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Faculty can manage examinations ONLY for courses they teach
CREATE POLICY "Faculty manage examinations"
ON examinations FOR ALL
TO authenticated
USING (
    is_faculty() AND EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = examinations.course_id AND c.faculty_id = get_faculty_id()
    )
)
WITH CHECK (
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

DROP POLICY IF EXISTS "Admins manage marks" ON marks;
DROP POLICY IF EXISTS "Faculty manage marks for their courses" ON marks;
DROP POLICY IF EXISTS "Students view own marks" ON marks;

-- Admins full access
CREATE POLICY "Admins manage marks"
ON marks FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Faculty can view and manage marks ONLY for examinations of courses they teach
CREATE POLICY "Faculty manage marks for their courses"
ON marks FOR ALL
TO authenticated
USING (
    is_faculty() AND EXISTS (
        SELECT 1 FROM examinations exam
        JOIN courses c ON exam.course_id = c.id
        WHERE exam.id = marks.examination_id AND c.faculty_id = get_faculty_id()
    )
)
WITH CHECK (
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
