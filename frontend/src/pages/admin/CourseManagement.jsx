import React, { useState, useEffect } from 'react';
import { courseService, departmentService, facultyService } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FiPlus, FiBookOpen, FiEdit2, FiTrash2, FiSearch, FiAlertCircle } from 'react-icons/fi';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    credits: 4,
    semester: 1,
    department_id: '',
    faculty_id: '',
    is_elective: false
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resC, resD, resF] = await Promise.all([
        courseService.getAll({ search: searchTerm }),
        departmentService.getAll(),
        facultyService.getAll()
      ]);
      if (resC.data?.success) setCourses(resC.data.courses || []);
      if (resD.data?.success) setDepartments(resD.data.departments || []);
      if (resF.data?.success) setFacultyList(resF.data.faculty || []);
    } catch (err) {
      showToast('Error loading courses data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      credits: 4,
      semester: 1,
      department_id: departments[0]?.id || '',
      faculty_id: '',
      is_elective: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setFormData({
      code: c.code,
      name: c.name,
      description: c.description || '',
      credits: c.credits,
      semester: c.semester,
      department_id: c.department_id,
      faculty_id: c.faculty_id || '',
      is_elective: Boolean(c.is_elective)
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseService.update(editingCourse.id, formData);
        showToast('Course updated successfully.');
      } else {
        await courseService.create(formData);
        showToast('New course added.');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await courseService.delete(id);
      showToast('Course deleted.');
      loadData();
    } catch (err) {
      showToast('Failed to delete course.', 'error');
    }
  };

  const columns = [
    {
      header: 'Course Code & Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-mono font-bold flex items-center justify-center text-xs">
            {c.code}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</p>
            <p className="text-xs text-slate-400">{c.department_name}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Credits',
      render: (c) => (
        <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-xs">
          {c.credits} Credits
        </span>
      )
    },
    {
      header: 'Semester',
      render: (c) => <span className="text-xs font-medium">Semester {c.semester}</span>
    },
    {
      header: 'Assigned Faculty',
      render: (c) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {c.faculty_name || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleOpenEdit(c)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(c.id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {notification && (
        <div className="p-4 rounded-2xl bg-brand-600 text-white text-xs font-semibold flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Courses Catalog
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage academic syllabus, course credits and faculty assignments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search course code or name..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <DataTable columns={columns} data={courses} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. CS501"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Credits (1 - 6) *
              </label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Database Management Systems"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              >
                <option value="">Select Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assign Faculty Member
            </label>
            <select
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            >
              <option value="">Unassigned</option>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.full_name} ({f.employee_id})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
            >
              Save Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseManagement;

