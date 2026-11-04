import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/api';
import Modal from '../../components/Modal';
import { FiGrid, FiPlus, FiMail, FiPhone, FiUser, FiEdit2, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    head_of_department: '',
    contact_email: '',
    contact_phone: ''
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getAll();
      if (res.data?.success) setDepartments(res.data.departments || []);
    } catch (err) {
      showToast('Error loading departments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      head_of_department: '',
      contact_email: '',
      contact_phone: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      head_of_department: dept.head_of_department || '',
      contact_email: dept.contact_email || '',
      contact_phone: dept.contact_phone || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await departmentService.update(editingDept.id, formData);
        showToast('Department updated successfully.');
      } else {
        await departmentService.create(formData);
        showToast('Department created successfully.');
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? Associated courses and faculty will be affected.')) return;
    try {
      await departmentService.delete(id);
      showToast('Department deleted.');
      fetchDepartments();
    } catch (err) {
      showToast('Error deleting department.', 'error');
    }
  };

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
            Departments & Faculties
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize institutional departments, leadership and branch resources.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-400">Loading departments...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-brand-500/20 font-mono">
                    {dept.code}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(dept)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-4">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {dept.description || 'Academic branch specializing in engineering curricula.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FiUser className="w-3.5 h-3.5 text-slate-400" />
                    <span>HOD: <strong className="text-slate-800 dark:text-slate-100">{dept.head_of_department || 'Appointed HOD'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FiMail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{dept.contact_email || `${dept.code.toLowerCase()}@sms.edu`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dept.contact_phone || '+1-800-000-000'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{dept.student_count || 120} Students</span>
                <span>{dept.faculty_count || 15} Faculty</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. CSE"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Head of Department (HOD)
              </label>
              <input
                type="text"
                value={formData.head_of_department}
                onChange={(e) => setFormData({ ...formData, head_of_department: e.target.value })}
                placeholder="e.g. Dr. Alan Turing"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Computer Science and Engineering"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="dept@sms.edu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+1-800-000-000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Academic overview, laboratories and research focus"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
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
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;

