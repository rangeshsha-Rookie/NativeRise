// client/src/components/ui/Badge.jsx
import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export function Badge({
  status,
  variant,
  children,
  className = ''
}) {
  const { t } = useTranslation();

  // Status color mapping per Section 7.2
  const statusVariantMap = {
    AWAITING_PAYMENT: 'warning',
    PLACED: 'primary-soft',
    ACCEPTED: 'primary-soft',
    PACKED: 'primary-soft',
    ASSIGNED: 'primary-soft',
    PICKED_UP: 'clay',
    DELIVERED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'danger',
    DELIVERY_FAILED: 'danger',
    // Payment statuses
    PAID: 'success',
    COD_PENDING: 'warning',
    COD_COLLECTED: 'success',
    REFUNDED: 'primary-soft',
    FAILED: 'danger',
    // Delivery modes
    INCLUDED: 'success',
    CUSTOMER_PAYS: 'primary-soft'
  };

  const resolvedVariant = variant || (status ? statusVariantMap[status] : 'primary-soft');

  const variantStyles = {
    'primary-soft': 'bg-primary-soft text-ink',
    warning: 'bg-warning-soft text-ink',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    clay: 'bg-clay text-cream'
  };

  const displayText = children || (status ? t(`status.${status}`) : '');

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap',
        variantStyles[resolvedVariant] || variantStyles['primary-soft'],
        className
      )}
    >
      {displayText}
    </span>
  );
}

export default Badge;
