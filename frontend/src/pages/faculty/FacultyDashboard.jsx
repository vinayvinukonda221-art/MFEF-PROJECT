import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/StatCard';
import { FiBookOpen, FiUsers, FiCheckCircle, FiAward, FiCalendar } from 'react-icons/fi';

const FacultyDashboard = () => {
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
    assignedCourses: 2,
    totalStudentsTaught: 95,
    averageAttendance: 91.2,
    upcomingExams: 3
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Faculty Portal & Teaching Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage classroom attendance, evaluate student examinations and oversee course curricula.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Courses"
          value={stats.assignedCourses}
          icon={FiBookOpen}
          gradient="from-blue-600 to-indigo-600"
        />
        <StatCard
          title="Students Taught"
          value={stats.totalStudentsTaught}
          icon={FiUsers}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Class Attendance"
          value={`${stats.averageAttendance}%`}
          icon={FiCheckCircle}
          gradient="from-teal-500 to-cyan-600"
        />
        <StatCard
          title="Upcoming Exams"
          value={stats.upcomingExams}
          icon={FiCalendar}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Courses */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            My Active Courses
          </h3>
          <p className="text-xs text-slate-400 mb-4">Courses assigned for Semester 5 instruction</p>

          <div className="space-y-3">
            {[
              { code: 'CS501', name: 'Database Management Systems', credits: 4, students: 48, time: 'Mon, Wed, Fri 10:00 AM' },
              { code: 'CS502', name: 'Operating Systems & Architecture', credits: 4, students: 47, time: 'Tue, Thu 02:00 PM' }
            ].map((c) => (
              <div key={c.code} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-750 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold font-mono flex items-center justify-center text-xs">
                    {c.code}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.name}</h4>
                    <p className="text-[11px] text-slate-400">{c.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{c.students} Students</span>
                  <p className="text-[10px] text-slate-400">{c.credits} Credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Classroom Actions */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
              Classroom Quick Actions
            </h3>
            <p className="text-xs text-slate-400 mb-4">Immediate tasks for today's teaching schedule</p>

            <div className="space-y-3">
              <a
                href="/faculty/attendance"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Take Class Attendance</p>
                    <p className="text-[11px] text-slate-400">Record today's attendance for CS501 & CS502</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600">Open &rarr;</span>
              </a>

              <a
                href="/faculty/marks"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                    <FiAward className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Enter Mid-Term Marks</p>
                    <p className="text-[11px] text-slate-400">Score student exam assessments</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600">Open &rarr;</span>
              </a>
            </div>
          </div>

          <div className="p-3 bg-brand-50/60 dark:bg-brand-950/30 rounded-xl mt-4 border border-brand-100 dark:border-brand-900/40 text-xs text-brand-700 dark:text-brand-300">
            ℹ️ Faculty permissions enforce that professors can only alter attendance and marks for courses formally assigned to them.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

