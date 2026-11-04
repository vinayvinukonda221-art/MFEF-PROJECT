import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiUserCheck, 
  FiBookOpen, 
  FiGrid, 
  FiCheckCircle, 
  FiAward, 
  FiFileText, 
  FiUser, 
  FiLogOut,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const { role, logout, user } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
          { name: 'Students', path: '/admin/students', icon: FiUsers },
          { name: 'Faculty', path: '/admin/faculty', icon: FiUserCheck },
          { name: 'Departments', path: '/admin/departments', icon: FiGrid },
          { name: 'Courses', path: '/admin/courses', icon: FiBookOpen },
          { name: 'Attendance', path: '/admin/attendance', icon: FiCheckCircle },
          { name: 'Marks & Exams', path: '/admin/marks', icon: FiAward },
          { name: 'Academic Reports', path: '/admin/reports', icon: FiFileText },
        ];
      case 'faculty':
        return [
          { name: 'Faculty Dashboard', path: '/faculty/dashboard', icon: FiHome },
          { name: 'Mark Attendance', path: '/faculty/attendance', icon: FiCheckCircle },
          { name: 'Enter Marks', path: '/faculty/marks', icon: FiAward },
          { name: 'My Courses', path: '/faculty/courses', icon: FiBookOpen },
          { name: 'Student List', path: '/faculty/students', icon: FiUsers },
        ];
      case 'student':
        return [
          { name: 'Student Dashboard', path: '/student/dashboard', icon: FiHome },
          { name: 'My Attendance', path: '/student/attendance', icon: FiCheckCircle },
          { name: 'Marks & Grades', path: '/student/marks', icon: FiAward },
          { name: 'Enrolled Courses', path: '/student/courses', icon: FiBookOpen },
          { name: 'My Profile', path: '/student/profile', icon: FiUser },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-brand-500/20">
              🎓
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                EduPulse <span className="text-brand-500 text-xs font-semibold uppercase">SMS</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">
                Student Management
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:bg-brand-600' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded-xl mb-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 font-semibold flex items-center justify-center text-xs">
              {role ? role.slice(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {user?.full_name || 'Academic User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate capitalize">
                {role} Account
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
          >
            <FiLogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

