// client/src/components/ui/EmptyState.jsx
import React from 'react';
import Button from './Button';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface border border-line rounded-card ${className}`}
    >
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-cream-2 text-clay">
        {icon || (
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        )}
      </div>

      <h3 className="text-xl sm:text-2xl font-bold font-serif text-ink mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm sm:text-base text-ink-2 max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
