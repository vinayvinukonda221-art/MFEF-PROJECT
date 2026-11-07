import React, { useState, useEffect } from 'react';
import { studentService, departmentService } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiFilter, 
  FiUserCheck,
  FiAlertCircle
} from 'react-icons/fi';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: 'Password@123',
    phone: '',
    roll_number: '',
    registration_number: '',
    department_id: '',
    semester: 1,
    academic_year: '2025-2026',
    batch: '2023-2027',
    date_of_birth: '2004-01-01',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    emergency_contact: ''
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      if (res.data?.success) setDepartments(res.data.departments || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await studentService.getAll({
        search: searchTerm,
        department_id: selectedDept,
        semester: selectedSemester,
        page,
        limit: pagination.limit
      });
      if (res.data?.success) {
        setStudents(res.data.students || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      showToast('Error loading student records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchStudents(1);
  }, [searchTerm, selectedDept, selectedSemester]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      full_name: '',
      email: '',
      password: 'Password@123',
      phone: '',
      roll_number: '',
      registration_number: '',
      department_id: departments[0]?.id || '',
      semester: 1,
      academic_year: '2025-2026',
      batch: '2023-2027',
      date_of_birth: '2004-01-01',
      gender: 'Male',
      blood_group: 'O+',
      address: '',
      emergency_contact: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || '',
      email: student.email || '',
      phone: student.phone || '',
      roll_number: student.roll_number || '',
      registration_number: student.registration_number || '',
      department_id: student.department_id || '',
      semester: student.semester || 1,
      academic_year: student.academic_year || '2025-2026',
      batch: student.batch || '2023-2027',
      date_of_birth: student.date_of_birth || '2004-01-01',
      gender: student.gender || 'Male',
      blood_group: student.blood_group || 'O+',
      address: student.address || '',
      emergency_contact: student.emergency_contact || '',
      status: student.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, formData);
        showToast('Student information updated successfully.');
      } else {
        await studentService.create(formData);
        showToast('New student registered successfully.');
      }
      setIsModalOpen(false);
      fetchStudents(pagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    try {
      await studentService.delete(studentToDelete.id);
      showToast('Student record deleted successfully.');
      setIsDeleteModalOpen(false);
      fetchStudents(pagination.page);
    } catch (err) {
      showToast('Failed to delete student record.', 'error');
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {s.full_name ? s.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{s.full_name}</p>
            <p className="text-xs text-slate-400">{s.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Roll / Reg No.',
      render: (s) => (
        <div>
          <p className="font-mono font-semibold text-slate-700 dark:text-slate-200 text-xs">{s.roll_number}</p>
          <p className="text-[11px] text-slate-400 font-mono">{s.registration_number}</p>
        </div>
      )
    },
    {
      header: 'Department',
      render: (s) => (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          {s.department_code || s.department_name || 'Engineering'}
        </span>
      )
    },
    {
      header: 'Semester',
      render: (s) => <span className="font-medium text-xs">Semester {s.semester}</span>
    },
    {
      header: 'Status',
      render: (s) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          s.status === 'active' 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
        }`}>
          {s.status || 'Active'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEditModal(s)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
            title="Edit Details"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setStudentToDelete(s);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
            title="Delete Student"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium shadow-lg transition-all ${
          notification.type === 'error' 
            ? 'bg-rose-500 text-white' 
            : 'bg-emerald-600 text-white'
        }`}>
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Student Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student registrations, academic standing and institutional profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20 transition-all"
        >
          <FiPlus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, roll no, email..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 dark:text-slate-200"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
          ))}
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 dark:text-slate-200"
        >
          <option value="">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
            <option key={sem} value={sem}>Semester {sem}</option>
          ))}
        </select>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => fetchStudents(page)}
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Information' : 'Register New Student'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Alex Johnson"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email *
              </label>
              <input
                type="email"
                required
                disabled={Boolean(editingStudent)}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@sms.edu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
              />
            </div>

            {!editingStudent && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Login Password * (Student Access)
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password@123"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-brand-600 dark:text-brand-400 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Used by student to log into their portal</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Roll Number *
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingStudent)}
                value={formData.roll_number}
                onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                placeholder="CSE-2023-001"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester *
              </label>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0301"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="+1-555-9001"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Campus hostel or residential street address"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md shadow-brand-500/20 disabled:opacity-50"
            >
              {formSubmitting ? 'Saving...' : editingStudent ? 'Update Student' : 'Register Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Student Removal"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete student{' '}
            <span className="font-bold text-slate-800 dark:text-white">
              {studentToDelete?.full_name} ({studentToDelete?.roll_number})
            </span>? This action cascades to their enrollments, attendance and marks.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-500/20"
            >
              Delete Student Record
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentManagement;

