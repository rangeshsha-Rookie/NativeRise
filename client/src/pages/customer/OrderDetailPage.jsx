import React from 'react';
import { useTranslation } from 'react-i18next';

export function OrderDetailPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink mb-4">
        Order Detail
      </h1>
      <p className="text-ink-2">
        {t('common.loading', 'Loading content...')}
      </p>
    </div>
  );
}

export default OrderDetailPage;
