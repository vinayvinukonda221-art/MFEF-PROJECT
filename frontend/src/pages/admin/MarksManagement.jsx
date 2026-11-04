import React, { useState, useEffect } from 'react';
import { marksService, courseService, studentService } from '../../services/api';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import { FiAward, FiPlus, FiBook, FiCheckSquare, FiAlertCircle } from 'react-icons/fi';

const MarksManagement = () => {
  const [marks, setMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState('');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // New Exam Form
  const [examForm, setExamForm] = useState({
    course_id: '',
    exam_name: '',
    exam_type: 'midterm',
    total_marks: 50,
    passing_marks: 20,
    weightage_percentage: 25,
    exam_date: new Date().toISOString().split('T')[0],
    semester: 5
  });

  // Record Marks Form
  const [markForm, setMarkForm] = useState({
    examination_id: '',
    student_id: '',
    marks_obtained: '',
    remarks: ''
  });

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resE, resC, resS, resM] = await Promise.all([
        marksService.getExams(),
        courseService.getAll(),
        studentService.getAll({ limit: 100 }),
        marksService.getMarks({ examination_id: selectedExam || undefined })
      ]);
      if (resE.data?.success) setExams(resE.data.examinations || []);
      if (resC.data?.success) setCourses(resC.data.courses || []);
      if (resS.data?.success) setStudents(resS.data.students || []);
      if (resM.data?.success) setMarks(resM.data.marks || []);
    } catch (err) {
      showToast('Error loading examination marks.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedExam]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await marksService.createExam(examForm);
      showToast('Examination schedule created.');
      setIsExamModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create exam.', 'error');
    }
  };

  const handleRecordMarks = async (e) => {
    e.preventDefault();
    try {
      await marksService.recordMarks(markForm);
      showToast('Marks submitted and automatically graded.');
      setIsMarkModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record marks.', 'error');
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (m) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{m.student_name}</p>
          <p className="text-xs text-slate-400 font-mono">{m.roll_number}</p>
        </div>
      )
    },
    {
      header: 'Examination',
      render: (m) => (
        <div>
          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{m.exam_name}</p>
          <span className="text-[11px] text-slate-400 font-mono">{m.course_code}</span>
        </div>
      )
    },
    {
      header: 'Marks Scored',
      render: (m) => (
        <span className="font-bold text-xs text-slate-800 dark:text-slate-100 font-mono">
          {m.marks_obtained} / {m.total_marks || 100}
        </span>
      )
    },
    {
      header: 'Grade Awarded',
      render: (m) => {
        let style = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        if (m.grade === 'F') style = 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
        else if (m.grade === 'B' || m.grade === 'C') style = 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${style}`}>
            Grade {m.grade}
          </span>
        );
      }
    },
    {
      header: 'Grade Point',
      render: (m) => <span className="font-mono text-xs font-semibold">{m.grade_point || '0.00'}</span>
    },
    {
      header: 'Remarks',
      render: (m) => <span className="text-xs text-slate-400">{m.remarks || '—'}</span>
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
            Examinations & Evaluation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage test schedules, input marks, and calculate automatic academic grades.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Exam</span>
          </button>
          <button
            onClick={() => {
              setMarkForm({
                examination_id: exams[0]?.id || '',
                student_id: students[0]?.id || '',
                marks_obtained: '',
                remarks: ''
              });
              setIsMarkModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/20"
          >
            <FiCheckSquare className="w-4 h-4" />
            <span>Record Marks</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Filter by Examination
        </label>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Examinations</option>
          {exams.map(e => (
            <option key={e.id} value={e.id}>{e.exam_name} ({e.course_code})</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={marks} loading={loading} />

      {/* Create Exam Modal */}
      <Modal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        title="Schedule New Examination"
      >
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Associated Course *</label>
            <select
              required
              value={examForm.course_id}
              onChange={(e) => setExamForm({ ...examForm, course_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            >
              <option value="">Select Course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Exam Title *</label>
            <input
              type="text"
              required
              value={examForm.exam_name}
              onChange={(e) => setExamForm({ ...examForm, exam_name: e.target.value })}
              placeholder="e.g. Mid-Term Assessment 1"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Total Marks *</label>
              <input
                type="number"
                required
                value={examForm.total_marks}
                onChange={(e) => setExamForm({ ...examForm, total_marks: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Passing Marks *</label>
              <input
                type="number"
                required
                value={examForm.passing_marks}
                onChange={(e) => setExamForm({ ...examForm, passing_marks: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={examForm.exam_date}
                onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Semester *</label>
              <input
                type="number"
                min="1"
                max="8"
                required
                value={examForm.semester}
                onChange={(e) => setExamForm({ ...examForm, semester: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsExamModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md"
            >
              Save Examination
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Marks Modal */}
      <Modal
        isOpen={isMarkModalOpen}
        onClose={() => setIsMarkModalOpen(false)}
        title="Record Student Examination Marks"
      >
        <form onSubmit={handleRecordMarks} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Examination *</label>
            <select
              required
              value={markForm.examination_id}
              onChange={(e) => setMarkForm({ ...markForm, examination_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            >
              <option value="">Select Exam</option>
              {exams.map(e => (
                <option key={e.id} value={e.id}>{e.exam_name} ({e.course_code}) - Max: {e.total_marks}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Student *</label>
            <select
              required
              value={markForm.student_id}
              onChange={(e) => setMarkForm({ ...markForm, student_id: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Marks Obtained *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={markForm.marks_obtained}
              onChange={(e) => setMarkForm({ ...markForm, marks_obtained: e.target.value })}
              placeholder="e.g. 45.5"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Faculty Remarks</label>
            <input
              type="text"
              value={markForm.remarks}
              onChange={(e) => setMarkForm({ ...markForm, remarks: e.target.value })}
              placeholder="e.g. Excellent analytical performance"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            />
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
              Evaluate & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MarksManagement;

