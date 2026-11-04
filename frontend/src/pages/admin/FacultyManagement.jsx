import React, { useState, useEffect } from 'react';
import { facultyService, departmentService } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FiUserCheck, FiPlus, FiMail, FiPhone, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    employee_id: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech / Ph.D.',
    specialization: '',
    office_room: '',
    department_id: ''
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resF, resD] = await Promise.all([
        facultyService.getAll(),
        departmentService.getAll()
      ]);
      if (resF.data?.success) setFaculty(resF.data.faculty || []);
      if (resD.data?.success) setDepartments(resD.data.departments || []);
    } catch (err) {
      showToast('Error loading faculty records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      employee_id: '',
      designation: 'Assistant Professor',
      qualification: 'M.Tech / Ph.D.',
      specialization: '',
      office_room: '',
      department_id: departments[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await facultyService.create(formData);
      showToast('Faculty member added successfully.');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add faculty.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete faculty record? Courses taught by this faculty will become unassigned.')) return;
    try {
      await facultyService.delete(id);
      showToast('Faculty record deleted.');
      loadData();
    } catch (err) {
      showToast('Failed to delete faculty member.', 'error');
    }
  };

  const columns = [
    {
      header: 'Faculty Member',
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {f.full_name ? f.full_name.charAt(0).toUpperCase() : 'F'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{f.full_name}</p>
            <p className="text-xs text-slate-400">{f.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Employee ID',
      render: (f) => <span className="font-mono text-xs font-semibold">{f.employee_id}</span>
    },
    {
      header: 'Designation & Dept',
      render: (f) => (
        <div>
          <p className="font-medium text-xs text-slate-800 dark:text-slate-200">{f.designation}</p>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">{f.department_name}</span>
        </div>
      )
    },
    {
      header: 'Specialization',
      render: (f) => <span className="text-xs text-slate-500 dark:text-slate-400">{f.specialization || 'Engineering'}</span>
    },
    {
      header: 'Office',
      render: (f) => <span className="text-xs font-mono">{f.office_room || 'Room TBA'}</span>
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (f) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleDelete(f.id)}
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
            Faculty Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage academic professors, instructors and departmental appointments.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      <DataTable columns={columns} data={faculty} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Faculty Member"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Prof. Grace Hopper"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Employee ID *</label>
              <input
                type="text"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="FAC-CSE-001"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="faculty@sms.edu"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1-555-0201"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Department *</label>
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
              <label className="block text-xs font-semibold mb-1">Designation *</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              >
                <option value="Professor & HOD">Professor & HOD</option>
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Distributed Computing"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Office Room</label>
              <input
                type="text"
                value={formData.office_room}
                onChange={(e) => setFormData({ ...formData, office_room: e.target.value })}
                placeholder="e.g. CS-Lab-301"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
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
              Save Faculty Member
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FacultyManagement;

