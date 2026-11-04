import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/api';
import DataTable from '../../components/DataTable';

const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentService.getAll({ limit: 50 });
        if (res.data?.success) setStudents(res.data.students || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const columns = [
    {
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center text-xs">
            {s.full_name?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">{s.full_name}</p>
            <p className="text-xs text-slate-400">{s.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Roll Number',
      render: (s) => <span className="font-mono text-xs font-semibold">{s.roll_number}</span>
    },
    {
      header: 'Department',
      render: (s) => <span>{s.department_code || 'CSE'}</span>
    },
    {
      header: 'Semester',
      render: (s) => <span>Semester {s.semester}</span>
    },
    {
      header: 'Status',
      render: (s) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          {s.status || 'Active'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Assigned Students Roster
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Directory of students enrolled in your designated department courses.
        </p>
      </div>

      <DataTable columns={columns} data={students} loading={loading} />
    </div>
  );
};

export default FacultyStudents;

