import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Alert = ({ type = 'info', title, message, children, className }) => {
  const icons = {
    success: CheckCircle2,
    warning: AlertCircle,
    danger: XCircle,
    info: Info,
  };

  const Icon = icons[type];

  const variants = {
    success: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200',
    warning: 'bg-amber-950/40 border-amber-500/30 text-amber-200',
    danger: 'bg-rose-950/40 border-rose-500/30 text-rose-200',
    info: 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200',
  };

  const iconColors = {
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-rose-400',
    info: 'text-indigo-400',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm backdrop-blur-sm',
        variants[type],
        className
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[type])} />
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        {message && <p className="text-xs opacity-90 leading-relaxed">{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default Alert;
