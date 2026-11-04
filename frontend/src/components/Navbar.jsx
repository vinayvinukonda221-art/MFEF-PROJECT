import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FiSun, 
  FiMoon, 
  FiLogOut, 
  FiUser, 
  FiBell, 
  FiSearch,
  FiMenu
} from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const getRoleBadge = (r) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'faculty':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'student':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none"
          title="Toggle Navigation"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative hidden md:block w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Quick search records, ID, courses..."
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <FiSun className="w-5 h-5 text-amber-400" /> : <FiMoon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="System Notifications"
          >
            <FiBell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
          </button>
        </div>

        {/* Role Badge */}
        <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${getRoleBadge(role)}`}>
          {role || 'Guest'}
        </span>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-400 text-white font-semibold flex items-center justify-center text-sm shadow-sm ring-2 ring-white dark:ring-slate-800">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {user?.full_name || 'Academic User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate max-w-[140px]">
              {user?.email || 'user@sms.edu'}
            </p>
          </div>

          {/* Logout Action */}
          <button
            onClick={logout}
            className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Sign Out of SMS"
          >
            <FiLogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

