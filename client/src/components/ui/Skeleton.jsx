// client/src/components/ui/Skeleton.jsx
import React from 'react';
import clsx from 'clsx';

export function Skeleton({ className = '', variant = 'rect' }) {
  const variantStyles = {
    rect: 'rounded-input',
    circle: 'rounded-full',
    pill: 'rounded-full',
    card: 'rounded-card'
  };

  return (
    <div
      className={clsx(
        'bg-cream-2/80 animate-pulse',
        variantStyles[variant] || 'rounded-input',
        className
      )}
    />
  );
}

export default Skeleton;
