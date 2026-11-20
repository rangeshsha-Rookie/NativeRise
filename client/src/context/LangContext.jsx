// client/src/context/LangContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import apiClient from '../api/client';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('nr_lang') || 'en';
  });

  useEffect(() => {
    // Apply lang to html document tag
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
    localStorage.setItem('nr_lang', lang);
  }, [lang]);

  const changeLanguage = async (newLang) => {
    if (newLang !== 'en' && newLang !== 'mr') return;
    setLangState(newLang);
    document.documentElement.lang = newLang;
    await i18n.changeLanguage(newLang);
    localStorage.setItem('nr_lang', newLang);

    // If user is logged in, sync with server asynchronously
    const token = localStorage.getItem('nr_token');
    if (token) {
      try {
        await apiClient.patch('/me/language', { lang: newLang });
      } catch (err) {
        // Silently continue if network fails
      }
    }
  };

  return (
    <LangContext.Provider value={{ lang, changeLanguage }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
}

export default LangContext;
