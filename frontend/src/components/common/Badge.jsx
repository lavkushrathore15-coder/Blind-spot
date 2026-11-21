import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'neutral', className }) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
