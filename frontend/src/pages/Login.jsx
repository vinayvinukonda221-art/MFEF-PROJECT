import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiShield, FiUserCheck, FiBook } from 'react-icons/fi';

const Login = () => {
  const isDevMode = Boolean(import.meta.env.DEV);
  const [email, setEmail] = useState(isDevMode ? 'admin@sms.edu' : '');
  const [password, setPassword] = useState(isDevMode ? 'Admin@123' : '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      const role = result.user?.role;
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } else {
      setError(result.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white text-3xl shadow-xl shadow-brand-500/20 mb-3">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            EduPulse <span className="text-brand-400">SMS</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Enterprise Student Management System
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Enter your institutional email credentials below
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. admin@sms.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel (Gated to Local Development / Evaluation) */}
          {isDevMode && (
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                Development Evaluation Credentials
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@sms.edu', 'Admin@123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
                >
                  <FiShield className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold">Admin</span>
                  <span className="text-[9px] opacity-75">Admin@123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('faculty@sms.edu', 'Faculty@123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                >
                  <FiUserCheck className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold">Faculty</span>
                  <span className="text-[9px] opacity-75">Faculty@123</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('student@sms.edu', 'Student@123')}
                  className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                >
                  <FiBook className="w-4 h-4 mb-1" />
                  <span className="text-xs font-bold">Student</span>
                  <span className="text-[9px] opacity-75">Student@123</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security & RLS notice */}
        <p className="text-center text-xs text-slate-400 mt-6">
          🔒 Protected with Supabase PostgreSQL & Row Level Security (RLS)
        </p>
      </div>
    </div>
  );
};

export default Login;

