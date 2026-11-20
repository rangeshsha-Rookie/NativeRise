// client/src/components/ui/Select.jsx
import React from 'react';
import clsx from 'clsx';
import { AlertCircle, ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(function Select(
  {
    label,
    helperText,
    error,
    id,
    children,
    className = '',
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={clsx(
            'w-full h-[52px] pl-4 pr-10 rounded-input bg-surface border text-ink text-base appearance-none transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
            error ? 'border-danger focus:ring-danger' : 'border-line',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-ink-2">
          {error ? <AlertCircle className="w-5 h-5 text-danger" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-danger flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-ink-2">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
