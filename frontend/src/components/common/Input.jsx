import React from 'react';
import { cn } from '../../utils/cn';

export const Input = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3.5 py-2 bg-white/90 border rounded-xl text-sm text-slate-900 placeholder-slate-400 transition-colors shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
          error
            ? 'border-rose-400 focus:ring-rose-400'
            : 'border-slate-200/90 hover:border-slate-300',
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
