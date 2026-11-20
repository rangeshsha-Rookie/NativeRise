// client/src/pages/seller/SellerAccountPage.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Phone, Mail, Store, Globe, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import apiClient from '../../api/client';

export function SellerAccountPage() {
  const { t, i18n } = useTranslation();
  const { user, profile, logout, updateProfile } = useAuth();
  const { lang, changeLanguage } = useLang();
  const isMr = i18n.language === 'mr';

  const handleLangSwitch = async (newLang) => {
    if (newLang === lang) return;
    changeLanguage(newLang);
    try {
      await apiClient.put('/me/profile', { preferredLang: newLang });
      if (user) {
        updateProfile({ ...user, preferredLang: newLang });
      }
    } catch (err) {
      // Ignored
    }
  };

  const name = user?.name?.[isMr ? 'mr' : 'en'] || user?.name?.mr || user?.name?.en || 'Seller';
  const shopName = profile?.shopName?.[isMr ? 'mr' : 'en'] || profile?.shopName?.mr || profile?.shopName?.en || 'My Shop';

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'विक्रेता खाते तपशील' : 'Seller Profile & Account'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr ? 'तुमची वैयक्तिक माहिती आणि भाषा प्राधान्ये.' : 'Account details and preferred language settings.'}
        </p>
      </div>

      <div className="p-6 bg-surface border border-line rounded-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-2xl">
            {name[0]}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink">{name}</h2>
            <p className="text-xs text-clay font-bold flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>{shopName}</span>
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-2 pt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-clay" />
                <span>{user?.phone}</span>
              </span>
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-clay" />
                  <span>{user.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-clay text-cream text-xs font-bold uppercase tracking-wider">
          Seller
        </span>
      </div>

      {/* Language Switcher */}
      <div className="p-6 bg-surface border border-line rounded-card space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-clay" />
          <h3 className="font-bold text-sm sm:text-base text-ink">
            {isMr ? 'इंटरफेस भाषा निवडा' : 'App Language'}
          </h3>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleLangSwitch('en')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              lang === 'en'
                ? 'bg-clay text-cream shadow-sm'
                : 'bg-cream-2 border border-line text-ink hover:bg-cream'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLangSwitch('mr')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
              lang === 'mr'
                ? 'bg-clay text-cream shadow-sm'
                : 'bg-cream-2 border border-line text-ink hover:bg-cream'
            }`}
          >
            मराठी
          </button>
        </div>
      </div>

      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={logout}
          className="px-6 py-2.5 rounded-full border border-danger text-danger text-xs sm:text-sm font-semibold hover:bg-danger/10 transition-colors inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{isMr ? 'बाहेर पडा (Log Out)' : 'Log Out'}</span>
        </button>
      </div>
    </div>
  );
}

export default SellerAccountPage;
