import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 text-center">
      <div className="max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 mx-auto flex items-center justify-center text-3xl mb-4">
          <FiAlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Page Not Found</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
          The requested resource does not exist or your institutional role lacks authorization.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md"
        >
          <FiHome className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

