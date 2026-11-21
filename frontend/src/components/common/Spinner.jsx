import React from 'react';
import { cn } from '../../utils/cn';

export const Spinner = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full border-indigo-500 border-t-transparent animate-spin',
        sizes[size],
        className
      )}
      role="status"
      aria-label="loading"
    />
  );
};

export default Spinner;
