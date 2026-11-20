// client/src/components/LanguageToggle.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from '../context/LangContext';

const ALLOWED_ROUTES = ['/', '/seller', '/partner', '/login', '/register'];

export function LanguageToggle() {
  const { lang, changeLanguage } = useLang();
  const location = useLocation();

  // Strict route visibility enforcement per Section 8.2
  const isAllowed = ALLOWED_ROUTES.includes(location.pathname);
  if (!isAllowed) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center p-1 bg-cream-2 border border-line rounded-full shadow-sm"
    >
      <button
        type="button"
        onClick={() => changeLanguage('en')}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-150 ${
          lang === 'en'
            ? 'bg-primary text-ink shadow-sm'
            : 'text-ink-2 hover:text-ink'
        }`}
        aria-pressed={lang === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => changeLanguage('mr')}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-150 ${
          lang === 'mr'
            ? 'bg-primary text-ink shadow-sm'
            : 'text-ink-2 hover:text-ink'
        }`}
        aria-pressed={lang === 'mr'}
      >
        मराठी
      </button>
    </div>
  );
}

export default LanguageToggle;
