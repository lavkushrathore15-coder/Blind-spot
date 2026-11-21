import React from 'react';
import { cn } from '../../utils/cn';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  isLoading,
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white focus:ring-cyan-500 shadow-md shadow-cyan-600/20 active:scale-[0.98]',
    secondary: 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 shadow-sm hover:border-slate-300 focus:ring-slate-400 active:scale-[0.98]',
    outline: 'border border-cyan-500/50 text-cyan-700 hover:bg-cyan-50 focus:ring-cyan-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-md shadow-rose-500/20 active:scale-[0.98]',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 focus:ring-slate-400',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
