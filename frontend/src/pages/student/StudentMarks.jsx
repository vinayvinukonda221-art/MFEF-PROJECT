import React, { useState, useEffect } from 'react';
import { marksService } from '../../services/api';
import DataTable from '../../components/DataTable';
import { FiAward, FiPrinter } from 'react-icons/fi';

const StudentMarks = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyMarks = async () => {
      try {
        const res = await marksService.getMarks();
        if (res.data?.success) setMarks(res.data.marks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyMarks();
  }, []);

  const columns = [
    {
      header: 'Subject Code & Name',
      render: (m) => (
        <div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
            {m.course_code || 'CS501'}
          </span>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">{m.course_name || 'Database Management Systems'}</p>
        </div>
      )
    },
    {
      header: 'Examination Event',
      render: (m) => <span className="text-xs font-semibold">{m.exam_name || 'Mid-Term Assessment'}</span>
    },
    {
      header: 'Marks Scored',
      render: (m) => (
        <span className="font-mono font-bold text-xs">
          {m.marks_obtained} / {m.total_marks || 50}
        </span>
      )
    },
    {
      header: 'Grade Awarded',
      render: (m) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          Grade {m.grade}
        </span>
      )
    },
    {
      header: 'Grade Points (10.0 scale)',
      render: (m) => <span className="font-mono font-semibold text-xs">{m.grade_point || '9.00'}</span>
    },
    {
      header: 'Faculty Remarks',
      render: (m) => <span className="text-xs text-slate-400">{m.remarks || 'Pass'}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Academic Grades & Examination Transcripts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Official record of continuous assessments, semester examinations and grade point averages.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FiPrinter className="w-4 h-4" />
          <span>Download Grade Sheet</span>
        </button>
      </div>

      <div className="p-6 bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-brand-200">Current Academic Standing</span>
          <h2 className="text-2xl font-bold mt-1">Semester 5 Examination Transcripts</h2>
          <p className="text-xs text-brand-100 mt-1">Status: Promoted with First Class with Distinction</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-brand-200 block">Semester SGPA</span>
            <span className="text-3xl font-extrabold font-mono">9.05</span>
          </div>
          <div className="text-right border-l border-brand-400/40 pl-6">
            <span className="text-xs text-brand-200 block">Cumulative CGPA</span>
            <span className="text-3xl font-extrabold font-mono">8.85</span>
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={marks} loading={loading} />

      {/* UGC 10-Point Scale Legend */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
          AICTE / UGC 10-Point Grading System Reference
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-emerald-600 block">O (10.0)</span>
            <span className="text-[10px] text-slate-400">&ge; 90%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-emerald-500 block">A+ (9.0)</span>
            <span className="text-[10px] text-slate-400">80 - 89%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-blue-600 block">A (8.0)</span>
            <span className="text-[10px] text-slate-400">70 - 79%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-blue-500 block">B+ (7.0)</span>
            <span className="text-[10px] text-slate-400">60 - 69%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-amber-500 block">B (6.0)</span>
            <span className="text-[10px] text-slate-400">50 - 59%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-amber-600 block">C (5.0)</span>
            <span className="text-[10px] text-slate-400">45 - 49%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-slate-500 block">P (4.0)</span>
            <span className="text-[10px] text-slate-400">40 - 44%</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
            <span className="font-bold text-rose-500 block">F (0.0)</span>
            <span className="text-[10px] text-slate-400">&lt; 40%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMarks;

