// client/src/components/ui/Switch.jsx
import React from 'react';
import clsx from 'clsx';

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  id
}) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label
      htmlFor={switchId}
      className={clsx(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={clsx(
            'w-12 h-7 rounded-full transition-colors duration-200 ease-in-out border border-line',
            checked ? 'bg-primary-600' : 'bg-cream-2'
          )}
        />
        <div
          className={clsx(
            'absolute top-1 left-1 bg-surface w-5 h-5 rounded-full shadow-md transition-transform duration-200 ease-in-out',
            checked && 'transform translate-x-5'
          )}
        />
      </div>
      {label && <span className="text-sm font-medium text-ink">{label}</span>}
    </label>
  );
}

export default Switch;
