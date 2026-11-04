import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import FacultyManagement from './pages/admin/FacultyManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import CourseManagement from './pages/admin/CourseManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import MarksManagement from './pages/admin/MarksManagement';
import AcademicReports from './pages/admin/AcademicReports';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyAttendance from './pages/faculty/FacultyAttendance';
import FacultyMarks from './pages/faculty/FacultyMarks';
import FacultyCourses from './pages/faculty/FacultyCourses';
import FacultyStudents from './pages/faculty/FacultyStudents';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMarks from './pages/student/StudentMarks';
import StudentCourses from './pages/student/StudentCourses';
import StudentProfile from './pages/student/StudentProfile';

// Protected Route Guard with Role Verification
const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to own role dashboard
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Root index redirector
const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  if (role === 'student') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <RoleRoute allowedRoles={['admin']}>
          <DashboardLayout />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="faculty" element={<FacultyManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="attendance" element={<AttendanceManagement />} />
        <Route path="marks" element={<MarksManagement />} />
        <Route path="reports" element={<AcademicReports />} />
      </Route>

      {/* Faculty Protected Routes */}
      <Route path="/faculty" element={
        <RoleRoute allowedRoles={['faculty', 'admin']}>
          <DashboardLayout />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="/faculty/dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="attendance" element={<FacultyAttendance />} />
        <Route path="marks" element={<FacultyMarks />} />
        <Route path="courses" element={<FacultyCourses />} />
        <Route path="students" element={<FacultyStudents />} />
      </Route>

      {/* Student Protected Routes */}
      <Route path="/student" element={
        <RoleRoute allowedRoles={['student', 'admin']}>
          <DashboardLayout />
        </RoleRoute>
      }>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="marks" element={<StudentMarks />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

