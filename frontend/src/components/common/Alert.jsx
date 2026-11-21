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
    success: 'bg-emerald-50/90 border-emerald-200 text-emerald-900',
    warning: 'bg-amber-50/90 border-amber-200 text-amber-900',
    danger: 'bg-rose-50/90 border-rose-200 text-rose-900',
    info: 'bg-cyan-50/90 border-cyan-200 text-cyan-900',
  };

  const iconColors = {
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
    info: 'text-cyan-600',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm backdrop-blur-md shadow-sm',
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
