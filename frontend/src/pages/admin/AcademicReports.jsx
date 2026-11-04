import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/api';
import { FiFileText, FiPrinter, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const AcademicReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await reportService.getAcademicReport();
        if (res.data?.success) setReport(res.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Academic & Institutional Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Consolidated institution pass metrics, departmental evaluations and attendance compliance.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FiPrinter className="w-4 h-4" />
          <span>Print / Export Report</span>
        </button>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Academic Year</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">
            {report?.academicYear || '2025-2026'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">Semester 5 Mid-Term Evaluation</p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Overall Institution Pass Rate</p>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {report?.overallPassRate || '94.2%'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">UGC standard benchmark satisfied</p>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Examinations Conducted</p>
          <h3 className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-1">
            {report?.totalExamsConducted || 24} Sessions
          </h3>
          <p className="text-xs text-slate-400 mt-1">Continuous internal evaluations</p>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
          Departmental Academic Performance
        </h3>
        <p className="text-xs text-slate-400 mb-4">Branch pass percentages and academic toppers</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Department</th>
                <th className="px-4 py-3">Pass Percentage</th>
                <th className="px-4 py-3">Average Score</th>
                <th className="px-4 py-3 rounded-r-lg">Academic Topper</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(report?.departmentPerformances || [
                { department: 'Computer Science and Engineering', passPercentage: 96.5, averageMarks: 81.2, topScorer: 'Alex Johnson (9.30 SGPA)' },
                { department: 'Electronics & Communication', passPercentage: 93.0, averageMarks: 76.8, topScorer: 'Michael Brown (8.80 SGPA)' },
                { department: 'Information Technology', passPercentage: 95.2, averageMarks: 79.4, topScorer: 'Sarah Connor (9.15 SGPA)' },
                { department: 'Mechanical Engineering', passPercentage: 91.8, averageMarks: 73.1, topScorer: 'David Miller (8.65 SGPA)' }
              ]).map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                  <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                    {d.department}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.passPercentage}%</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold">
                    {d.averageMarks}%
                  </td>
                  <td className="px-4 py-3.5 font-medium text-brand-600 dark:text-brand-400">
                    {d.topScorer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Compliance & Warnings */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <FiAlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Attendance Shortage Alerts (&lt; 75%)
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Students below mandatory academic attendance threshold required for university examinations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Roll Number</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Current Attendance</th>
                <th className="px-4 py-3 rounded-r-lg">Advisory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(report?.lowAttendanceAlerts || [
                { rollNumber: 'CSE-2023-089', name: 'James Wilson', department: 'CSE', attendance: '68.4%', status: 'Critical Warning' },
                { rollNumber: 'ECE-2023-044', name: 'Sophia Martinez', department: 'ECE', attendance: '71.2%', status: 'Warning' }
              ]).map((a, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                  <td className="px-4 py-3 font-mono font-semibold">{a.rollNumber}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{a.name}</td>
                  <td className="px-4 py-3">{a.department}</td>
                  <td className="px-4 py-3 font-bold text-rose-500">{a.attendance}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcademicReports;

