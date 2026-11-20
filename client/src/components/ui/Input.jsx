// client/src/components/ui/Input.jsx
import React from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';
import { normalizeDigits } from '../../i18n/digits';

export const Input = React.forwardRef(function Input(
  {
    label,
    helperText,
    error,
    id,
    type = 'text',
    className = '',
    inputMode,
    onChange,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  const handleChange = (e) => {
    if (inputMode === 'numeric' || type === 'number') {
      e.target.value = normalizeDigits(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          inputMode={inputMode}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={clsx(
            'w-full h-[52px] px-4 rounded-input bg-surface border text-ink text-base transition-colors duration-150',
            'placeholder:text-ink-2/60 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
            error ? 'border-danger focus:ring-danger' : 'border-line',
            className
          )}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-danger">
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

export default Input;
