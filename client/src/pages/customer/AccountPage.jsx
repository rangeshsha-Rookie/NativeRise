// client/src/pages/customer/AccountPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Package,
  MapPin,
  LifeBuoy,
  LogOut,
  Globe,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import apiClient from '../../api/client';

export function AccountPage() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateProfile } = useAuth();
  const { lang, changeLanguage } = useLang();
  const isMr = i18n.language === 'mr';

  const [savingLang, setSavingLang] = useState(false);

  const handleLangSwitch = async (newLang) => {
    if (newLang === lang) return;
    setSavingLang(true);
    changeLanguage(newLang);
    try {
      await apiClient.put('/me/profile', { preferredLang: newLang });
      if (user) {
        updateProfile({ ...user, preferredLang: newLang });
      }
    } catch (err) {
      // Ignored
    } finally {
      setSavingLang(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'कृपया लॉगिन करा' : 'Please Log In'}
        </h2>
        <Link to="/login" className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'लॉगिन करा' : 'Go to Login'}
        </Link>
      </div>
    );
  }

  const displayName = user.name?.[isMr ? 'mr' : 'en'] || user.name?.mr || user.name?.en || 'Customer';

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'माझे खाते' : 'My Account'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr ? 'तुमची वैयक्तिक माहिती, पत्ते आणि प्राधान्ये व्यवस्थापित करा.' : 'Manage profile, addresses, and language settings.'}
        </p>
      </div>

      {/* User Info Card */}
      <div className="p-6 bg-surface border border-line rounded-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-2xl">
            {displayName[0]}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink">{displayName}</h2>
            <div className="flex items-center gap-4 text-xs text-ink-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-clay" />
                <span>{user.phone}</span>
              </span>
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-clay" />
                  <span>{user.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-clay/10 text-clay text-xs font-bold capitalize">
          {user.role}
        </span>
      </div>

      {/* Language Preference Setting */}
      <div className="p-6 bg-surface border border-line rounded-card space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-clay" />
          <h3 className="font-bold text-sm sm:text-base text-ink">
            {isMr ? 'भाषा निवडा (Language)' : 'Preferred Language'}
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

      {/* Navigation Quick Links */}
      <div className="bg-surface border border-line rounded-card divide-y divide-line overflow-hidden">
        <Link
          to="/orders"
          className="flex items-center justify-between p-4 sm:p-5 hover:bg-cream-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-clay" />
            <div>
              <span className="font-bold text-sm text-ink block">
                {isMr ? 'माझ्या ऑर्डर्स' : 'My Orders'}
              </span>
              <span className="text-xs text-ink-2">
                {isMr ? 'ऑर्डर ट्रॅकिंग, बिल आणि पावत्या' : 'Track orders, receipts, and delivery codes'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-ink-2" />
        </Link>

        <Link
          to="/account/addresses"
          className="flex items-center justify-between p-4 sm:p-5 hover:bg-cream-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-clay" />
            <div>
              <span className="font-bold text-sm text-ink block">
                {isMr ? 'साठवलेले पत्ते' : 'Saved Addresses'}
              </span>
              <span className="text-xs text-ink-2">
                {isMr ? 'डिलिव्हरीसाठी पत्ते जोडा किंवा संपादित करा' : 'Manage delivery addresses with map pins'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-ink-2" />
        </Link>

        <Link
          to="/support"
          className="flex items-center justify-between p-4 sm:p-5 hover:bg-cream-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <LifeBuoy className="w-5 h-5 text-clay" />
            <div>
              <span className="font-bold text-sm text-ink block">
                {isMr ? 'ग्राहक साहाय्य (सपोर्ट)' : 'Customer Support'}
              </span>
              <span className="text-xs text-ink-2">
                {isMr ? 'तक्रारी, प्रश्न व सहाय्यक संवाद' : 'View tickets, messages, and order help'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-ink-2" />
        </Link>
      </div>

      {/* Logout Action */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={logout}
          className="px-6 py-2.5 rounded-full border border-danger text-danger text-xs sm:text-sm font-semibold hover:bg-danger/10 transition-colors inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{isMr ? 'खात्यातून बाहेर पडा (Logout)' : 'Log Out'}</span>
        </button>
      </div>
    </div>
  );
}

export default AccountPage;
