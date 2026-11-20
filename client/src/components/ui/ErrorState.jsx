// client/src/components/ui/ErrorState.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

export function ErrorState({
  code,
  message,
  onRetry,
  className = ''
}) {
  const { t } = useTranslation();

  const errorMessage =
    message || (code ? t(`errors.${code}`, t('errors.UNKNOWN')) : t('errors.UNKNOWN'));

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-danger-soft/30 border border-danger/20 rounded-card ${className}`}
      role="alert"
    >
      <div className="w-14 h-14 mb-4 flex items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="w-7 h-7" />
      </div>

      <h3 className="text-lg sm:text-xl font-bold font-serif text-ink mb-2">
        {t('common.retry', 'Something went wrong')}
      </h3>

      <p className="text-sm sm:text-base text-ink-2 max-w-md mb-6 leading-relaxed">
        {errorMessage}
      </p>

      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          {t('common.retry', 'Try again')}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
