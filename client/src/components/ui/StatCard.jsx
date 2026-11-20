// client/src/components/ui/StatCard.jsx
import React from 'react';
import clsx from 'clsx';

export function StatCard({
  title,
  value,
  subtitle,
  variant = 'surface',
  className = ''
}) {
  const isDark = variant === 'dark';

  return (
    <div
      className={clsx(
        'rounded-card p-5 sm:p-6 border shadow-soft flex flex-col justify-between transition-all duration-150',
        isDark
          ? 'bg-bark text-on-bark border-bark'
          : 'bg-surface text-ink border-line',
        className
      )}
    >
      <span
        className={clsx(
          'text-sm font-medium tracking-wide uppercase',
          isDark ? 'text-cream/80' : 'text-ink-2'
        )}
      >
        {title}
      </span>
      <div className="my-2">
        <span className="text-3xl sm:text-4xl font-bold font-serif">
          {value}
        </span>
      </div>
      {subtitle && (
        <span
          className={clsx(
            'text-xs sm:text-sm',
            isDark ? 'text-cream/70' : 'text-ink-2'
          )}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

export default StatCard;
