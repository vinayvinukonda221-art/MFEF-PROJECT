import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api';
import StatCard from '../../components/StatCard';
import { 
  FiUsers, 
  FiUserCheck, 
  FiGrid, 
  FiBookOpen, 
  FiCheckCircle, 
  FiAward,
  FiRefreshCw
} from 'react-icons/fi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getStats();
      if (res.data?.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const stats = data?.stats || {
    totalStudents: 510,
    totalFaculty: 63,
    totalDepartments: 5,
    totalCourses: 36,
    averageAttendance: 91.4,
    averageMarks: 78.5
  };

  const departmentStats = data?.departmentStats || [
    { code: 'CSE', name: 'Computer Science', students: 142 },
    { code: 'ECE', name: 'Electronics', students: 110 },
    { code: 'IT', name: 'Information Tech', students: 98 },
    { code: 'MECH', name: 'Mechanical', students: 85 },
    { code: 'CIVIL', name: 'Civil', students: 75 }
  ];

  const attendanceTrend = data?.attendanceTrend || [
    { day: 'Mon', attendance: 92 },
    { day: 'Tue', attendance: 88 },
    { day: 'Wed', attendance: 94 },
    { day: 'Thu', attendance: 89 },
    { day: 'Fri', attendance: 85 },
    { day: 'Sat', attendance: 78 }
  ];

  const gradeDistribution = data?.gradeDistribution || [
    { grade: 'O', count: 48, fill: '#10B981' },
    { grade: 'A+', count: 75, fill: '#3B82F6' },
    { grade: 'A', count: 92, fill: '#6366F1' },
    { grade: 'B+', count: 54, fill: '#F59E0B' },
    { grade: 'B', count: 32, fill: '#EC4899' },
    { grade: 'P/F', count: 14, fill: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Institutional Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time academic performance, attendance metrics and institutional resources.
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={FiUsers}
          change="8.2%"
          trend="up"
          gradient="from-blue-600 to-indigo-600"
        />
        <StatCard
          title="Total Faculty"
          value={stats.totalFaculty}
          icon={FiUserCheck}
          change="4.5%"
          trend="up"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          icon={FiGrid}
          gradient="from-purple-600 to-indigo-600"
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          icon={FiBookOpen}
          gradient="from-amber-500 to-orange-600"
        />
        <StatCard
          title="Avg Attendance"
          value={`${stats.averageAttendance}%`}
          icon={FiCheckCircle}
          change="1.8%"
          trend="up"
          gradient="from-teal-500 to-cyan-600"
        />
        <StatCard
          title="Avg Marks"
          value={`${stats.averageMarks}%`}
          icon={FiAward}
          change="2.4%"
          trend="up"
          gradient="from-rose-500 to-pink-600"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department-wise Student Statistics (BarChart) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Department Enrolment Distribution
              </h3>
              <p className="text-xs text-slate-400">Total enrolled students per engineering branch</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="students" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Attendance Trend (LineChart) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Weekly Attendance Trends
              </h3>
              <p className="text-xs text-slate-400">Daily average campus student attendance percentage</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[60, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '12px' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Grade Distribution & Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            Marks & Grade Distribution
          </h3>
          <p className="text-xs text-slate-400 mb-4">Institution grading cohort</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {gradeDistribution.map((g) => (
              <div key={g.grade} className="text-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-750">
                <span className="text-[10px] font-semibold text-slate-400 block">{g.grade}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{g.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
            Recent Student Enrolments
          </h3>
          <p className="text-xs text-slate-400 mb-4">Latest students admitted to academic programs</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Student</th>
                  <th className="px-4 py-3">Roll Number</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Semester</th>
                  <th className="px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {(data?.recentStudents || [
                  { id: '1', full_name: 'Alex Johnson', roll_number: 'CSE-2023-001', department: 'CSE', semester: 5 },
                  { id: '2', full_name: 'Emily Davis', roll_number: 'CSE-2023-002', department: 'CSE', semester: 5 },
                  { id: '3', full_name: 'Michael Brown', roll_number: 'ECE-2023-001', department: 'ECE', semester: 5 },
                  { id: '4', full_name: 'Sarah Connor', roll_number: 'IT-2023-001', department: 'IT', semester: 3 }
                ]).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">
                      {s.full_name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono">
                      {s.roll_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 font-semibold">
                        {s.department || 'CSE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      Semester {s.semester}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

