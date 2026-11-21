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
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'w-full px-3.5 py-2.5 bg-slate-950/90 border rounded-xl text-sm text-white placeholder-slate-400 transition-all shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400',
          error
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-slate-700/80 hover:border-slate-500',
          className
        )}
        style={{ colorScheme: 'dark' }}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-400 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 font-normal">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
