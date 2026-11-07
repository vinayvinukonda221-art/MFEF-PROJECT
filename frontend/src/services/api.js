import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/api`;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid and on protected route
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('sms_token');
        localStorage.removeItem('sms_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  createAdmin: (data) => api.post('/auth/create-admin', data),
  getAdmins: () => api.get('/auth/admins')
};

// Students Services
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`)
};

// Faculty Services
export const facultyService = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`)
};

// Courses Services
export const courseService = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`)
};

// Departments Services
export const departmentService = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

// Attendance Services
export const attendanceService = {
  get: (params) => api.get('/attendance', { params }),
  getStudentSummary: (studentId) => api.get(`/attendance/summary/${studentId}`),
  mark: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data)
};

// Marks & Examinations Services
export const marksService = {
  getExams: (params) => api.get('/marks/examinations', { params }),
  createExam: (data) => api.post('/marks/examinations', data),
  getMarks: (params) => api.get('/marks', { params }),
  recordMarks: (data) => api.post('/marks', data),
  updateMarks: (id, data) => api.put(`/marks/${id}`, data)
};

// Dashboard Services
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats')
};

// Academic Reports Services
export const reportService = {
  getAcademicReport: () => api.get('/reports/summary')
};

export default api;

