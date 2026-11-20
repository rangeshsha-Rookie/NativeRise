// client/src/components/ui/Card.jsx
import React from 'react';
import clsx from 'clsx';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={clsx(
        'bg-surface border border-line rounded-card p-5 sm:p-6 shadow-soft transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
