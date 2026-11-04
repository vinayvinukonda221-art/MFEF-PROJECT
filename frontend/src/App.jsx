import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StudentManagement = lazy(() => import('./pages/admin/StudentManagement'));
const FacultyManagement = lazy(() => import('./pages/admin/FacultyManagement'));
const DepartmentManagement = lazy(() => import('./pages/admin/DepartmentManagement'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement'));
const AttendanceManagement = lazy(() => import('./pages/admin/AttendanceManagement'));
const MarksManagement = lazy(() => import('./pages/admin/MarksManagement'));
const AcademicReports = lazy(() => import('./pages/admin/AcademicReports'));

// Faculty Pages
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'));
const FacultyAttendance = lazy(() => import('./pages/faculty/FacultyAttendance'));
const FacultyMarks = lazy(() => import('./pages/faculty/FacultyMarks'));
const FacultyCourses = lazy(() => import('./pages/faculty/FacultyCourses'));
const FacultyStudents = lazy(() => import('./pages/faculty/FacultyStudents'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentAttendance = lazy(() => import('./pages/student/StudentAttendance'));
const StudentMarks = lazy(() => import('./pages/student/StudentMarks'));
const StudentCourses = lazy(() => import('./pages/student/StudentCourses'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));

// Full-Page Route Loading Spinner
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading EduPulse module...</p>
    </div>
  </div>
);

// Protected Route Guard with Role Verification
const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default App;
