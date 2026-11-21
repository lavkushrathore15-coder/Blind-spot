import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({ children, variant = 'neutral', className }) => {
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 font-semibold shadow-xs',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-400/50 font-semibold shadow-xs',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-400/50 font-semibold shadow-xs',
    info: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-semibold shadow-xs',
    neutral: 'bg-slate-800/90 text-slate-200 border-slate-600 font-semibold shadow-xs',
    cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 font-semibold shadow-xs',
    indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50 font-semibold shadow-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant] || variants.neutral,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
