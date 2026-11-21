import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, title, subtitle, icon: Icon, action, className, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 shadow-glass-light transition-all',
        className
      )}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 shadow-sm">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
