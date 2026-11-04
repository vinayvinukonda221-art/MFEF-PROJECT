import React, { useState, useEffect } from 'react';
import { attendanceService, courseService, studentService } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FiCheckCircle, FiPlus, FiCalendar, FiFilter, FiAlertCircle } from 'react-icons/fi';

const AttendanceManagement = () => {
  const [attendanceList, setAttendanceList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [batchRecords, setBatchRecords] = useState({});
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadInitial = async () => {
    try {
      const [resC, resS] = await Promise.all([
        courseService.getAll(),
        studentService.getAll({ limit: 100 })
      ]);
      if (resC.data?.success) {
        setCourses(resC.data.courses || []);
        if (resC.data.courses?.length > 0) setSelectedCourse(resC.data.courses[0].id);
      }
      if (resS.data?.success) setStudents(resS.data.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.get({
        course_id: selectedCourse || undefined,
        date: selectedDate || undefined
      });
      if (res.data?.success) setAttendanceList(res.data.attendance || []);
    } catch (err) {
      showToast('Error loading attendance records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchAttendance();
  }, [selectedCourse, selectedDate]);

  const handleOpenBatchModal = () => {
    // initialize all students as present
    const init = {};
    students.forEach(s => {
      init[s.id] = 'present';
    });
    setBatchRecords(init);
    setIsMarkModalOpen(true);
  };

  const handleBatchStatusChange = (studentId, status) => {
    setBatchRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      showToast('Please select a course.', 'error');
      return;
    }

    const payload = {
      course_id: selectedCourse,
      date: selectedDate,
      records: Object.keys(batchRecords).map(sId => ({
        student_id: sId,
        status: batchRecords[sId]
      }))
    };

    try {
      await attendanceService.mark(payload);
      showToast('Class attendance recorded successfully.');
      setIsMarkModalOpen(false);
      fetchAttendance();
    } catch (err) {
      showToast('Failed to record attendance.', 'error');
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (a) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{a.student_name}</p>
          <p className="text-xs text-slate-400 font-mono">{a.roll_number}</p>
        </div>
      )
    },
    {
      header: 'Course',
      render: (a) => (
        <div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
            {a.course_code}
          </span>
          <p className="text-xs text-slate-400 mt-0.5">{a.course_name}</p>
        </div>
      )
    },
    {
      header: 'Date',
      render: (a) => <span className="font-mono text-xs">{a.date}</span>
    },
    {
      header: 'Status',
      render: (a) => {
        let badgeStyle = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        if (a.status === 'absent') badgeStyle = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        if (a.status === 'late') badgeStyle = 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${badgeStyle}`}>
            {a.status}
          </span>
        );
      }
    },
    {
      header: 'Remarks',
      render: (a) => <span className="text-xs text-slate-400">{a.remarks || '—'}</span>
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
            Attendance Register
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor and record student classroom attendance and daily records.
          </p>
        </div>

        <button
          onClick={handleOpenBatchModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
        >
          <FiCheckCircle className="w-4 h-4" />
          <span>Mark Class Attendance</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <DataTable columns={columns} data={attendanceList} loading={loading} />

      {/* Batch Mark Attendance Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Classroom Attendance Sheet"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleBatchSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-750 rounded-xl text-xs font-medium">
            <span>Date: <strong>{selectedDate}</strong></span>
            <span>Course: <strong>{courses.find(c => c.id === selectedCourse)?.code || 'Selected'}</strong></span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
            {students.map((student) => (
              <div key={student.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-100">{student.full_name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{student.roll_number}</p>
                </div>

                <div className="flex items-center gap-2">
                  {['present', 'absent', 'late'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => handleBatchStatusChange(student.id, status)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                        batchRecords[student.id] === status
                          ? status === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : status === 'absent'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsMarkModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
            >
              Submit Attendance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;

