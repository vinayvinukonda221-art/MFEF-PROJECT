import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/StatCard';
import { FiCheckCircle, FiBookOpen, FiAward, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        if (res.data?.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = data?.stats || {
    attendancePercentage: 92.4,
    enrolledCourses: 4,
    cgpa: 8.85,
    pendingAssignments: 2
  };

  const attendanceChart = data?.attendanceChart || [
    { course: 'CS501', percentage: 94 },
    { course: 'CS502', percentage: 90 },
    { course: 'CS503', percentage: 88 },
    { course: 'EC501', percentage: 96 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Student Academic Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Track personal attendance percentage, semester grades, cumulative GPA and enrolled subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats.attendancePercentage}%`}
          icon={FiCheckCircle}
          description="Eligible for University Exam"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Cumulative CGPA"
          value={stats.cgpa}
          icon={FiAward}
          description="10-point scale grading"
          gradient="from-blue-600 to-indigo-600"
        />
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          icon={FiBookOpen}
          description="Semester 5 Core & Elective"
          gradient="from-purple-600 to-indigo-600"
        />
        <StatCard
          title="Semester Standing"
          value="Distinction"
          icon={FiCalendar}
          description="Top 5% in Class"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course-wise Attendance */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            Subject-Wise Attendance Breakdown
          </h3>
          <p className="text-xs text-slate-400 mb-4">Mandatory minimum is 75% per course</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="course" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="percentage" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latest Exam Grades */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            Recent Examination Scores
          </h3>
          <p className="text-xs text-slate-400 mb-4">Official continuous internal assessment results</p>

          <div className="space-y-3">
            {(data?.recentMarks || [
              { course: 'CS501: DBMS', exam: 'Mid-Term Assessment 1', marks: '46.5 / 50', grade: 'A+', points: '9.30' },
              { course: 'CS502: Operating Systems', exam: 'Mid-Term Test', marks: '44.0 / 50', grade: 'A', points: '8.80' }
            ]).map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-750 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{m.course}</h4>
                  <p className="text-[11px] text-slate-400">{m.exam}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 font-mono">{m.marks}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono">
                    Grade {m.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Semester Grade Point Average (SGPA):</span>
            <span className="text-base font-bold text-brand-600 dark:text-brand-400 font-mono">9.05 / 10.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

