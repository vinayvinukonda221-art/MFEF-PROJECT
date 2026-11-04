import React, { useState, useEffect } from 'react';
import { courseService } from '../../services/api';
import { FiBookOpen, FiUser, FiAward } from 'react-icons/fi';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseService.getAll({ semester: 5 });
        if (res.data?.success) setCourses(res.data.courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Enrolled Academic Courses
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Curriculum, syllabus modules, faculty mentors and credits for Semester 5.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <div
            key={c.id}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-300">
                  {c.code}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {c.credits} Academic Credits
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-white mt-3">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">
                {c.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FiUser className="w-3.5 h-3.5 text-slate-400" />
                <span>Instructor: <strong>{c.faculty_name}</strong></span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Enrolment</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentCourses;

