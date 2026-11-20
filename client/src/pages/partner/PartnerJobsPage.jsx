// client/src/pages/partner/PartnerJobsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Briefcase,
  Store,
  MapPin,
  Truck,
  ArrowRight,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';

export function PartnerJobsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await apiClient.get('/partner/jobs');
      if (res?.ok && res.data) {
        setJobs(res.data.jobs || res.data || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (orderId) => {
    setAcceptingId(orderId);
    setErrorMessage('');
    try {
      const res = await apiClient.post(`/partner/orders/${orderId}/accept`);
      if (res?.ok) {
        navigate('/partner/active');
      }
    } catch (err) {
      if (err.code === 'ORDER_ALREADY_ASSIGNED' || err.status === 409) {
        setErrorMessage(
          isMr
            ? 'इतर डिलिव्हरी पार्टनरने ही ऑर्डर नुकतीच स्वीकारली आहे.'
            : 'Another partner just accepted this order. Refreshing available jobs...'
        );
      } else {
        setErrorMessage(err.message || 'Failed to accept order');
      }
      fetchJobs();
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'उपलब्ध डिलिव्हरी ऑर्डर्स' : 'Available Delivery Jobs'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 mt-1">
            {isMr
              ? 'तुमच्या कार्यक्षेत्रातील (Service Radius) पॅक झालेल्या ऑर्डर्स स्वीकारा.'
              : 'Accept ready-to-deliver packages within your service radius.'}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchJobs}
          className="px-4 py-2 rounded-full bg-surface border border-line text-ink text-xs font-semibold hover:bg-cream-2 transition-colors flex items-center gap-2 w-fit shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-clay' : ''}`} />
          <span>{isMr ? 'अद्ययावत करा' : 'Refresh Jobs'}</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-card flex items-center gap-2 text-amber-900 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => {
            const orderId = job.id || job._id;
            const payoutRs = Math.round((job.partnerPayoutPaise || 0) / 100);
            const shopName =
              job.seller?.shopName?.[isMr ? 'mr' : 'en'] ||
              job.seller?.shopName?.mr ||
              job.seller?.shopName?.en ||
              'Village Shop';
            const distanceKm = job.roadDistanceKm ? job.roadDistanceKm.toFixed(1) : '5.0';
            const isAccepting = acceptingId === orderId;

            return (
              <div
                key={orderId}
                className="p-6 bg-surface border border-line rounded-card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-all"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold font-mono text-base text-ink">
                      #{job.orderNo}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {isMr ? 'पॅक व तयार' : 'Packed & Ready'}
                    </span>
                    <span className="text-xs text-ink-2 font-medium">
                      {job.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Prepaid (Online)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    {/* Pickup Shop */}
                    <div className="flex items-start gap-2 text-ink">
                      <Store className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">{shopName}</strong>
                        <span className="text-ink-2 text-xs">{job.pickup?.line}</span>
                      </div>
                    </div>

                    {/* Drop Customer */}
                    <div className="flex items-start gap-2 text-ink">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">{isMr ? 'ग्राहक पत्ता:' : 'Drop Location:'}</strong>
                        <span className="text-ink-2 text-xs">{job.address?.line}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-ink-2 flex items-center gap-4 pt-1">
                    <span>
                      {isMr ? 'अंतर:' : 'Route distance:'} <strong>{distanceKm} km</strong>
                    </span>
                    <span>
                      {isMr ? 'अंदाजे वेळ:' : 'Estimated time:'} <strong>~{job.etaMins || 25} mins</strong>
                    </span>
                  </div>
                </div>

                {/* Guaranteed Payout & Accept CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-6 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-ink-2 block">{isMr ? 'हमी दिलेली कमाई' : 'Guaranteed Payout'}</span>
                    <span className="text-2xl font-bold font-serif text-emerald-700">
                      ₹{payoutRs}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isAccepting}
                    onClick={() => handleAcceptJob(orderId)}
                    className="px-6 py-2.5 rounded-full bg-primary text-ink text-xs sm:text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-all shadow-sm"
                  >
                    {isAccepting ? '...' : isMr ? 'ऑर्डर स्वीकारा' : 'Accept Job'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-3">
          <Briefcase className="w-10 h-10 mx-auto text-ink-2" />
          <p className="text-base font-semibold text-ink">
            {isMr ? 'सध्या कोणतीही नवीन ऑर्डर उपलब्ध नाही.' : 'No ready orders in your area right now.'}
          </p>
          <p className="text-xs text-ink-2">
            {isMr
              ? 'विक्रेत्याने ऑर्डर पॅक केल्यावर ती येथे आपोआप दिसेल.'
              : 'As soon as a village seller packs an order, it will appear here.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default PartnerJobsPage;
