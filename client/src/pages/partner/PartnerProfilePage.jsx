// client/src/pages/partner/PartnerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Truck, Phone, Mail, Globe, LogOut, Save, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';

export function PartnerProfilePage() {
  const { t, i18n } = useTranslation();
  const { user, logout, updateProfile } = useAuth();
  const { lang, changeLanguage } = useLang();
  const isMr = i18n.language === 'mr';

  const [vehicleType, setVehicleType] = useState('BIKE');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    apiClient
      .get('/partner/profile')
      .then((res) => {
        const p = res?.data || res;
        if (p) {
          setVehicleType(p.vehicleType || 'BIKE');
          setVehicleNumber(p.vehicleNumber || '');
          setServiceRadiusKm(p.serviceRadiusKm || 25);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const res = await apiClient.put('/partner/profile', {
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        serviceRadiusKm: parseInt(serviceRadiusKm, 10) || 25
      });
      if (res?.ok) {
        setSuccessMessage(isMr ? 'प्रोफाइल यशस्वीपणे जतन केली!' : 'Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
      </div>
    );
  }

  const name = user?.name?.[isMr ? 'mr' : 'en'] || user?.name?.mr || user?.name?.en || 'Delivery Partner';

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'डिलिव्हरी पार्टनर प्रोफाइल' : 'Delivery Partner Profile'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr ? 'वाहन प्रकार, कार्यक्षेत्र मर्यादा (त्रिज्या) आणि भाषा प्राधान्ये.' : 'Vehicle details, service radius slider, and app language.'}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-2 text-emerald-900 text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* User Information */}
      <div className="p-6 bg-surface border border-line rounded-card flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-clay text-cream flex items-center justify-center font-bold text-2xl">
            {name[0]}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink">{name}</h2>
            <div className="flex items-center gap-4 text-xs text-ink-2">
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
          Partner
        </span>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="p-6 sm:p-8 bg-surface border border-line rounded-card space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'वाहन प्रकार (Vehicle Type)' : 'Vehicle Type'}
            </label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-semibold"
            >
              <option value="BIKE">Motorcycle / Bike (मोटारसायकल)</option>
              <option value="CYCLE">Bicycle (सायकल)</option>
              <option value="AUTO">Auto Rickshaw (रिक्षा)</option>
              <option value="ON_FOOT">On Foot (पादचारी)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'वाहन क्रमांक' : 'Vehicle Registration No.'}
            </label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="MH-04-AB-1234"
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Service Radius Slider (3 to 60 km) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold uppercase tracking-wider text-ink-2">
              {isMr ? 'डिलिव्हरी कार्यक्षेत्र त्रिज्या' : 'Service Delivery Radius'}
            </label>
            <span className="font-bold text-clay text-sm">{serviceRadiusKm} km</span>
          </div>
          <input
            type="range"
            min="3"
            max="60"
            step="1"
            value={serviceRadiusKm}
            onChange={(e) => setServiceRadiusKm(e.target.value)}
            className="w-full accent-clay cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-ink-2">
            <span>3 km</span>
            <span>25 km (Recommended)</span>
            <span>60 km</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isMr ? 'जतन करा' : 'Save Changes'}</span>
          </Button>
        </div>
      </form>

      {/* Language Switcher */}
      <div className="p-6 bg-surface border border-line rounded-card space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-clay" />
          <h3 className="font-bold text-sm sm:text-base text-ink">
            {isMr ? 'अॅप भाषा निवडा' : 'App Language'}
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

export default PartnerProfilePage;
