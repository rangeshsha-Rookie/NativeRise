// client/src/components/ui/Button.jsx
import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-full transition-all duration-150 focus-visible:outline focus-visible:outline-3 focus-visible:outline-primary-600 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-primary text-ink hover:bg-primary-600 active:scale-[0.98]',
    secondary: 'bg-transparent text-ink border border-ink hover:bg-cream-2 active:scale-[0.98]',
    danger: 'bg-danger text-cream hover:opacity-90 active:scale-[0.98]',
    ghost: 'bg-transparent text-ink hover:bg-cream-2'
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-[52px] px-8 text-lg'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-inherit rounded-full">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}
      <span className={clsx('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
    </button>
  );
});

export default Button;
