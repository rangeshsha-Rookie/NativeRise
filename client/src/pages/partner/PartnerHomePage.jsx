// client/src/pages/partner/PartnerHomePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  Navigation,
  DollarSign,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Smartphone
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

export function PartnerHomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [dashboard, setDashboard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [onlineError, setOnlineError] = useState('');

  const fetchDashboard = async () => {
    try {
      const [dashRes, profRes] = await Promise.all([
        apiClient.get('/partner/dashboard'),
        apiClient.get('/partner/profile')
      ]);

      if (dashRes?.ok && dashRes.data) {
        setDashboard(dashRes.data);
      }
      if (profRes?.ok && profRes.data) {
        setProfile(profRes.data);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleOnline = async () => {
    if (!profile || togglingOnline) return;
    setTogglingOnline(true);
    setOnlineError('');

    const targetOnline = !profile.isOnline;

    if (targetOnline) {
      // Need fresh GPS location
      if (!navigator.geolocation) {
        setOnlineError(isMr ? 'तुमच्या ब्राउझरमध्ये GPS सुविधा नाही.' : 'Geolocation is not supported by your browser.');
        setTogglingOnline(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude, accuracy } = pos.coords;
            const res = await apiClient.patch('/partner/online', {
              isOnline: true,
              lat: latitude,
              lng: longitude,
              accuracy
            });

            if (res?.ok) {
              setProfile((prev) => ({ ...prev, isOnline: true }));
              // Request Wake Lock (Correction C15)
              if ('wakeLock' in navigator) {
                try {
                  await navigator.wakeLock.request('screen');
                  setWakeLockActive(true);
                } catch (wErr) {
                  // Wake lock might be denied by user/battery saver
                }
              }
              fetchDashboard();
            }
          } catch (err) {
            setOnlineError(err.message || 'Failed to go online');
          } finally {
            setTogglingOnline(false);
          }
        },
        (err) => {
          // If browser GPS fails, use fallback base coordinates from profile so user is never blocked
          const fallbackLat = profile.lastLocation?.lat || profile.baseLocation?.lat || 19.2813;
          const fallbackLng = profile.lastLocation?.lng || profile.baseLocation?.lng || 72.8686;
          apiClient
            .patch('/partner/online', {
              isOnline: true,
              lat: fallbackLat,
              lng: fallbackLng,
              accuracy: 50
            })
            .then((res) => {
              if (res?.ok) {
                setProfile((prev) => ({ ...prev, isOnline: true }));
                fetchDashboard();
              }
            })
            .catch((e) => setOnlineError(e.message || 'GPS permission required'))
            .finally(() => setTogglingOnline(false));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Turning offline
      try {
        const res = await apiClient.patch('/partner/online', { isOnline: false });
        if (res?.ok) {
          setProfile((prev) => ({ ...prev, isOnline: false }));
          setWakeLockActive(false);
          fetchDashboard();
        }
      } catch (err) {
        setOnlineError(err.message || 'Failed to go offline');
      } finally {
        setTogglingOnline(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="h-10 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isOnline = Boolean(profile?.isOnline);
  const activeOrder = dashboard?.activeOrder;
  const todayEarningsRs = Math.round((dashboard?.todayEarningsPaise || 0) / 100);
  const cashToDepositRs = Math.round((dashboard?.cashToDepositPaise || 0) / 100);
  const availableJobsCount = dashboard?.availableJobsCount || 0;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Partner Status Banner */}
      <div className="p-6 bg-surface border border-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-clay" />
            <span className="text-xs font-bold uppercase tracking-wider text-clay">
              {isMr ? 'डिलिव्हरी पार्टनर डॅशबोर्ड' : 'Delivery Partner Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {profile?.user?.name?.[isMr ? 'mr' : 'en'] || profile?.user?.name?.mr || profile?.user?.name?.en || 'Partner'}
          </h1>
          <p className="text-xs text-ink-2">
            {profile?.vehicleType || 'BIKE'} · {profile?.vehicleNumber || 'MH-04-XX-0000'} ·{' '}
            {profile?.serviceRadiusKm || 25} km service radius
          </p>
        </div>

        {/* Online Toggle Switch */}
        <div className="flex items-center gap-4 bg-cream-2 px-5 py-3 rounded-2xl border border-line">
          <div className="text-right">
            <span className="text-xs sm:text-sm font-bold text-ink block">
              {isOnline ? (isMr ? 'तुम्ही ऑनलाईन आहात' : 'You are ONLINE') : (isMr ? 'ऑफलाईन आहात' : 'You are OFFLINE')}
            </span>
            <span className="text-[11px] text-ink-2">
              {isOnline ? (isMr ? 'ऑर्डर स्वीकारण्यासाठी तयार' : 'Ready for deliveries') : (isMr ? 'ऑनलाईन होण्यासाठी चालू करा' : 'Turn on to get jobs')}
            </span>
          </div>

          <button
            type="button"
            disabled={togglingOnline}
            onClick={handleToggleOnline}
            className={clsx(
              'w-14 h-7 rounded-full transition-colors relative focus:outline-none shrink-0',
              isOnline ? 'bg-success' : 'bg-line'
            )}
            aria-label="Toggle Online"
          >
            <span
              className={clsx(
                'w-6 h-6 rounded-full bg-cream absolute top-0.5 transition-transform shadow-sm',
                isOnline ? 'left-7' : 'left-1'
              )}
            />
          </button>
        </div>
      </div>

      {onlineError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-card flex items-center gap-2 text-red-900 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <span>{onlineError}</span>
        </div>
      )}

      {/* Screen Wake Lock Notice (Correction C15) */}
      {isOnline && (
        <div className="p-4 bg-sky-50 border border-sky-200 rounded-card flex items-start gap-3 text-sky-900 text-xs sm:text-sm">
          <Smartphone className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {isMr ? 'स्क्रीन वेक लॉक चालू आहे (Screen Wake Lock Active)' : 'Screen Wake Lock Active'}
            </span>
            <p className="mt-0.5 text-sky-800 leading-relaxed">
              {isMr
                ? 'डिलिव्हरी दरम्यान फोन स्क्रीन चालू ठेवा, जेणेकरून ग्राहकाला रिअल-टाइम GPS ट्रॅकिंग सुरळीत दिसेल.'
                : 'Keep this browser tab open while delivering so customer live checkpoint GPS coordinates update in real time.'}
            </p>
          </div>
        </div>
      )}

      {/* Active Order Highlight Card */}
      {activeOrder && (
        <div className="p-6 bg-gradient-to-r from-clay/10 via-primary-100/30 to-cream border-2 border-clay rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-clay font-bold text-xs uppercase tracking-wider">
              <Navigation className="w-4 h-4" />
              <span>{isMr ? 'सध्याची चालू डिलिव्हरी' : 'Active Delivery In Progress'}</span>
            </div>
            <h2 className="text-xl font-bold font-serif text-ink font-mono">
              #{activeOrder.orderNo}
            </h2>
            <p className="text-xs text-ink-2">
              Status: <span className="font-bold text-ink">{activeOrder.status}</span> ·{' '}
              {activeOrder.deliveryMode === 'SELLER_PAYS' ? 'Free Delivery' : 'Standard'}
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => navigate('/partner/active')}
            className="flex items-center gap-2 w-fit shadow-sm"
          >
            <span>{isMr ? 'डिलिव्हरी पानावर जा' : 'Go to Active Order'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* 3 Metric Cards: Earnings, Cash to Deposit, Nearby Jobs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Earnings */}
        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'आजची कमाई (सिम्युलेटेड)' : "Today's Earnings"}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700">
            ₹{todayEarningsRs}
          </p>
          <span className="text-[11px] text-ink-2">
            {isMr ? `${dashboard?.todayTrips || 0} ट्रिप्स पूर्ण` : `${dashboard?.todayTrips || 0} trips completed today`}
          </span>
        </div>

        {/* COD Cash to Deposit (Correction C9) */}
        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'जमा करायची रोख रक्कम (COD)' : 'Cash to Deposit'}</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-amber-700">
            ₹{cashToDepositRs}
          </p>
          <div className="pt-1">
            <Link
              to="/partner/earnings"
              className="text-xs font-semibold text-clay hover:underline inline-flex items-center gap-1"
            >
              <span>{isMr ? 'रक्कम जमा करा' : 'Deposit Cash'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Nearby Available Jobs */}
        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'उपलब्ध ऑर्डर्स (जवळपास)' : 'Available Jobs Nearby'}</span>
            <Briefcase className="w-4 h-4 text-primary-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-primary-800">
            {availableJobsCount}
          </p>
          <div className="pt-1">
            <Link
              to="/partner/jobs"
              className="text-xs font-semibold text-clay hover:underline inline-flex items-center gap-1"
            >
              <span>{isMr ? 'ऑर्डर्स पहा' : 'View & Accept'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/partner/jobs"
          className="p-5 bg-surface border border-line rounded-card flex items-center justify-between hover:bg-cream-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-clay" />
            <div>
              <span className="font-bold text-ink text-sm sm:text-base block">
                {isMr ? 'जवळपासच्या डिलिव्हरी ऑर्डर्स' : 'Find Delivery Jobs'}
              </span>
              <span className="text-xs text-ink-2">
                {isMr ? 'पॅक झालेल्या ऑर्डर्स स्वीकारा' : 'Browse PACKED village orders in your radius'}
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-ink-2" />
        </Link>

        <Link
          to="/partner/earnings"
          className="p-5 bg-surface border border-line rounded-card flex items-center justify-between hover:bg-cream-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-emerald-700" />
            <div>
              <span className="font-bold text-ink text-sm sm:text-base block">
                {isMr ? 'कमाई आणि कॅश डिपॉझिट' : 'Earnings & Cash Ledger'}
              </span>
              <span className="text-xs text-ink-2">
                {isMr ? 'सिम्युलेटेड हिशोब आणि रोख जमा' : 'Trip payouts and COD cash collection'}
              </span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-ink-2" />
        </Link>
      </div>
    </div>
  );
}

export default PartnerHomePage;
