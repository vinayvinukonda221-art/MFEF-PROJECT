import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService, studentService } from '../../services/api';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiShield, FiEdit2, FiAlertCircle } from 'react-icons/fi';
import Modal from '../../components/Modal';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authService.getProfile();
      if (res.data?.success) {
        setProfileData(res.data);
        const details = res.data.details || {};
        setPhone(details.phone || res.data.profile?.phone || '');
        setAddress(details.address || '');
        setEmergencyContact(details.emergency_contact || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (profileData?.details?.id) {
        await studentService.update(profileData.details.id, {
          phone,
          address,
          emergency_contact: emergencyContact
        });
      }
      setNotification({ message: 'Contact details updated successfully.', type: 'success' });
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (err) {
      setNotification({ message: 'Failed to update contact info.', type: 'error' });
    }
  };

  const p = profileData?.profile || user || {};
  const d = profileData?.details || {};

  return (
    <div className="space-y-6 max-w-4xl">
      {notification && (
        <div className="p-4 rounded-2xl bg-brand-600 text-white text-xs font-semibold flex items-center gap-2">
          <FiAlertCircle className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Student Profile Record
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Verified institutional identification and academic registration credentials.
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
        >
          <FiEdit2 className="w-3.5 h-3.5" />
          <span>Update Contact</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100 dark:border-slate-700">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold flex items-center justify-center text-3xl shadow-xl shadow-brand-500/20">
            {p.full_name ? p.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{p.full_name || 'Alex Johnson'}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Active Student
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{p.email || 'student@sms.edu'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                Roll: {d.roll_number || 'CSE-2023-001'}
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300">
                Reg: {d.registration_number || 'REG2023CSE001'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 text-xs">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Academic Placement</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.department_name || 'Computer Science and Engineering'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Current Semester:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">Semester {d.semester || 5}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Academic Year:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.academic_year || '2025-2026'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Degree Batch:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.batch || '2023-2027'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Personal & Contact</h4>
            <div className="space-y-3">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Phone Contact:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.phone || p.phone || '+1-555-0301'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Date of Birth:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.date_of_birth || '2004-05-14'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Blood Group:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.blood_group || 'O+'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-700">
                <span className="text-slate-400">Emergency Contact:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{d.emergency_contact || '+1-555-9001'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-xs">
          <span className="text-slate-400 block mb-1">Residential Campus Address:</span>
          <p className="font-medium text-slate-700 dark:text-slate-200">
            {d.address || '42 Silicon Avenue, Cambridge, MA'}
          </p>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Personal Contact Details"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Emergency Contact Phone</label>
            <input
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Residential Address</label>
            <textarea
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
            >
              Update Information
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentProfile;

