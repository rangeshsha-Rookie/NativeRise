// client/src/components/ui/Textarea.jsx
import React from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';

export const Textarea = React.forwardRef(function Textarea(
  {
    label,
    helperText,
    error,
    id,
    className = '',
    rows = 4,
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
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={clsx(
            'w-full p-4 rounded-input bg-surface border text-ink text-base transition-colors duration-150',
            'placeholder:text-ink-2/60 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
            error ? 'border-danger focus:ring-danger' : 'border-line',
            className
          )}
          {...props}
        />
        {error && (
          <div className="absolute top-3.5 right-3.5 pointer-events-none text-danger">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
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

export default Textarea;
