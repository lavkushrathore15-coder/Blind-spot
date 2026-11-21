import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ children, title, subtitle, icon: Icon, action, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-sm transition-all',
        className
      )}
      {...props}
    >
      {(title || subtitle || Icon || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
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
