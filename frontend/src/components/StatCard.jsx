import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, trend = 'up', gradient = 'from-brand-500 to-indigo-600', description }) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 tracking-tight">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>

        <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${gradient} text-white flex items-center justify-center shadow-lg shadow-brand-500/10`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {change && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </span>
          <span className="text-slate-400">vs last semester</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

