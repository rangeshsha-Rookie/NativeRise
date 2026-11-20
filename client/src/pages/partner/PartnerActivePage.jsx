// client/src/pages/partner/PartnerActivePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Truck,
  MapPin,
  Store,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Navigation,
  Smartphone,
  Banknote,
  DollarSign
} from 'lucide-react';
import apiClient from '../../api/client';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

// Normalize Devanagari digits (Correction C17)
function normalizeDigits(str) {
  if (!str) return '';
  const devanagari = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return str.toString().replace(/[०-९]/g, (w) => devanagari.indexOf(w));
}

export function PartnerActivePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [order, setOrder] = useState(null);
  const [partnerCoords, setPartnerCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // Delivery Code Modal
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [delivering, setDelivering] = useState(false);
  const [deliveryError, setDeliveryError] = useState('');

  // Delivery Failed Modal
  const [failModalOpen, setFailModalOpen] = useState(false);
  const [failReason, setFailReason] = useState('CUSTOMER_UNREACHABLE');
  const [failNote, setFailNote] = useState('');
  const [failing, setFailing] = useState(false);

  // Release Modal
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const fetchActive = async () => {
    try {
      const res = await apiClient.get('/partner/active');
      const data = res?.data || res;
      if (data && (data.order || data._id)) {
        setOrder(data.order || data);
      } else {
        setOrder(null);
      }
    } catch (err) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  // Periodic GPS Heartbeat (every 10s)
  useEffect(() => {
    if (!order || !['ASSIGNED', 'PICKED_UP'].includes(order.status)) return;

    const sendHeartbeat = () => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, speed, heading } = pos.coords;
          setPartnerCoords({ lat: latitude, lng: longitude });
          apiClient
            .post('/partner/location', {
              lat: latitude,
              lng: longitude,
              speed: speed || 0,
              heading: heading || 0
            })
            .catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 10000);
    return () => clearInterval(interval);
  }, [order?.status]);

  // Screen Wake Lock (Correction C15)
  useEffect(() => {
    if ('wakeLock' in navigator && order && order.status === 'PICKED_UP') {
      let lock = null;
      navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {});
      return () => {
        if (lock) lock.release().catch(() => {});
      };
    }
  }, [order?.status]);

  const handlePickup = async () => {
    setActing(true);
    try {
      const res = await apiClient.post(`/partner/orders/${order.id || order._id}/pickup`);
      if (res?.ok) {
        fetchActive();
      }
    } catch (err) {
      alert(err.message || 'Failed to confirm pickup');
    } finally {
      setActing(false);
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    const cleanCode = normalizeDigits(deliveryCode.trim());
    if (cleanCode.length !== 4) {
      setDeliveryError(isMr ? 'कृपया ४-अंकी कोड प्रविष्ट करा.' : 'Please enter 4-digit code.');
      return;
    }

    setDelivering(true);
    setDeliveryError('');

    try {
      const res = await apiClient.post(`/partner/orders/${order.id || order._id}/deliver`, {
        code: cleanCode,
        location: partnerCoords
      });

      if (res?.ok) {
        setDeliveryModalOpen(false);
        navigate('/partner/earnings');
      }
    } catch (err) {
      setDeliveryError(
        err.message || (isMr ? 'अवैध कोड! ग्राहकाकडून ४-अंकी कोड तपासा.' : 'Wrong delivery code! Please verify with customer.')
      );
    } finally {
      setDelivering(false);
    }
  };

  const handleConfirmFail = async () => {
    setFailing(true);
    try {
      await apiClient.post(`/partner/orders/${order.id || order._id}/fail`, {
        reason: failReason,
        note: failNote.trim()
      });
      setFailModalOpen(false);
      navigate('/partner');
    } catch (err) {
      alert(err.message || 'Failed to mark delivery failed');
    } finally {
      setFailing(false);
    }
  };

  const handleConfirmRelease = async () => {
    setReleasing(true);
    try {
      await apiClient.post(`/partner/orders/${order.id || order._id}/release`);
      setReleaseModalOpen(false);
      navigate('/partner/jobs');
    } catch (err) {
      alert(err.message || 'Failed to release order');
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="h-72 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-cream-2 flex items-center justify-center text-ink-2">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'कोणतीही चालू डिलिव्हरी नाही' : 'No Active Delivery'}
        </h2>
        <p className="text-xs sm:text-sm text-ink-2">
          {isMr
            ? 'नवीन ऑर्डर्स स्वीकारण्यासाठी उपलब्ध ऑर्डर्स तपासा.'
            : 'Accept a packed order from the available jobs board to begin delivery.'}
        </p>
        <Button variant="primary" onClick={() => navigate('/partner/jobs')}>
          {isMr ? 'उपलब्ध ऑर्डर्स पहा' : 'View Available Jobs'}
        </Button>
      </div>
    );
  }

  const isPickedUp = order.status === 'PICKED_UP';
  const payoutRs = Math.round((order.partnerPayoutPaise || 0) / 100);
  const totalCollectRs = Math.round((order.amounts?.totalPayablePaise || order.totalPayablePaise || 0) / 100);
  const isCOD = order.paymentMethod === 'COD';

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header Card */}
      <div className="p-6 bg-surface border border-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-bold font-mono text-xl text-ink">
              #{order.orderNo}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-clay text-cream">
              {order.status === 'ASSIGNED'
                ? isMr
                  ? 'पिकअपसाठी निघा'
                  : 'Go to Pickup'
                : isMr
                ? 'डिलिव्हरीसाठी रवाना'
                : 'Out for Delivery'}
            </span>
          </div>
          <p className="text-xs text-ink-2 mt-1">
            {isMr ? 'हमी दिलेली कमाई:' : 'Guaranteed Payout:'}{' '}
            <strong className="text-emerald-700 text-sm">₹{payoutRs}</strong>
          </p>
        </div>

        {order.status === 'ASSIGNED' && (
          <button
            type="button"
            onClick={() => setReleaseModalOpen(true)}
            className="text-xs text-danger hover:underline font-semibold"
          >
            {isMr ? 'ऑर्डर सोडा (Release)' : 'Release Job'}
          </button>
        )}
      </div>

      {/* Live Navigation Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-ink-2">
          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-clay">
            <Navigation className="w-4 h-4" />
            <span>{isMr ? 'थेट नेव्हिगेशन व ट्रॅक' : 'Live Navigation Map'}</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>GPS Active</span>
          </span>
        </div>

        <LiveTrackingMap
          pickup={order.pickup}
          drop={order.address}
          partnerLocation={partnerCoords}
          status={order.status}
        />
      </div>

      {/* Current Step Action Box */}
      {!isPickedUp ? (
        /* STEP 1: PICKUP FROM SELLER */
        <div className="p-6 bg-cream-2 border-2 border-clay rounded-card space-y-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-clay" />
              <h2 className="text-base sm:text-lg font-bold text-ink">
                {isMr ? 'पायरी १: दुकानातून पार्सल उचला (Pickup)' : 'Step 1: Pickup from Village Shop'}
              </h2>
            </div>
            <span className="text-xs font-bold text-clay uppercase">Pickup</span>
          </div>

          <div className="space-y-2 text-xs sm:text-sm text-ink">
            <p className="font-bold text-base">
              {order.seller?.shopName?.[isMr ? 'mr' : 'en'] || order.seller?.shopName?.mr || order.seller?.shopName?.en || 'Shop'}
            </p>
            <p className="text-ink-2 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-clay shrink-0 mt-0.5" />
              <span>{order.pickup?.line}</span>
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={acting}
            onClick={handlePickup}
            className="w-full justify-center shadow-md text-base"
          >
            <span>{isMr ? 'पार्सल उचलले (Confirm Pickup)' : 'Confirm Pickup from Shop'}</span>
          </Button>
        </div>
      ) : (
        /* STEP 2: DELIVER TO CUSTOMER */
        <div className="p-6 bg-surface border-2 border-success rounded-card space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base sm:text-lg font-bold text-ink">
                {isMr ? 'पायरी २: ग्राहकाला पोहचवा व कोड घ्या' : 'Step 2: Deliver to Customer & Enter Code'}
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-700 uppercase">Delivery</span>
          </div>

          {/* Customer destination & Contact */}
          <div className="space-y-2 text-xs sm:text-sm text-ink">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base">{order.address?.name || 'Customer'}</span>
              <a
                href={`tel:${order.address?.phone}`}
                className="px-3 py-1.5 bg-cream-2 border border-line rounded-full text-xs font-bold text-ink flex items-center gap-1.5 hover:bg-cream"
              >
                <Phone className="w-3.5 h-3.5 text-clay" />
                <span>Call: {order.address?.phone}</span>
              </a>
            </div>
            <p className="text-ink-2 leading-relaxed">{order.address?.line}</p>
          </div>

          {/* COD Cash Collection Alert (Correction C9) */}
          {isCOD && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-center justify-between gap-4 text-amber-900">
              <div className="flex items-center gap-3">
                <Banknote className="w-6 h-6 text-amber-700 shrink-0" />
                <div>
                  <span className="font-bold text-sm block">
                    {isMr ? 'कॅश ऑन डिलिव्हरी — रोख रक्कम गोळा करा' : 'COD: Collect Cash from Customer'}
                  </span>
                  <span className="text-xs text-amber-800">
                    {isMr ? 'ग्राहकाकडून ही रक्कम रोख स्वीकारा.' : 'Collect exact cash before handing parcel.'}
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold font-serif text-amber-900 shrink-0">
                ₹{totalCollectRs}
              </span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setDeliveryCode('');
                setDeliveryError('');
                setDeliveryModalOpen(true);
              }}
              className="w-full justify-center shadow-md text-base"
            >
              <KeyRound className="w-5 h-5 mr-2" />
              <span>{isMr ? 'डिलिव्हरी कोड प्रविष्ट करा (Confirm Delivery)' : 'Enter 4-Digit Customer Code'}</span>
            </Button>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setFailModalOpen(true)}
                className="text-xs text-danger hover:underline font-semibold"
              >
                {isMr ? 'डिलिव्हरी अयशस्वी झाली? (Customer Unavailable)' : 'Report Delivery Failed (Unable to Deliver)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Confirmation Modal (Decision D9 / Correction C4) */}
      {deliveryModalOpen && (
        <Modal
          isOpen={deliveryModalOpen}
          onClose={() => setDeliveryModalOpen(false)}
          title={isMr ? 'ग्राहकाचा ४-अंकी डिलिव्हरी कोड' : 'Enter 4-Digit Delivery Code'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleConfirmDelivery} className="p-5 space-y-5">
            <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
              {isMr
                ? 'ग्राहकाला पार्सल दिल्यावर त्यांच्या फोनवर आलेला ४-अंकी कोड येथे प्रविष्ट करा:'
                : 'Ask the customer for their 4-digit verification code to complete delivery:'}
            </p>

            {deliveryError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                <span>{deliveryError}</span>
              </div>
            )}

            <div>
              <input
                type="text"
                maxLength={4}
                autoFocus
                value={deliveryCode}
                onChange={(e) => setDeliveryCode(e.target.value)}
                placeholder="0 0 0 0"
                className="w-full h-16 text-center text-3xl font-mono font-bold tracking-widest bg-cream-2 border-2 border-clay rounded-2xl text-ink focus:outline-none focus:ring-4 focus:ring-primary-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setDeliveryModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" loading={delivering}>
                {isMr ? 'डिलिव्हरी पूर्ण करा' : 'Confirm Delivery'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delivery Failed Modal (Correction C8) */}
      {failModalOpen && (
        <Modal
          isOpen={failModalOpen}
          onClose={() => setFailModalOpen(false)}
          title={isMr ? 'डिलिव्हरी अयशस्वी नोंदवा' : 'Report Delivery Failure'}
          maxWidth="max-w-md"
        >
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'अयशस्वी होण्याचे कारण' : 'Failure Reason'}
              </label>
              <select
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 font-semibold"
              >
                <option value="CUSTOMER_UNREACHABLE">Customer Unreachable / Phone Off</option>
                <option value="INCORRECT_ADDRESS">Incorrect / Untraceable Address</option>
                <option value="CUSTOMER_REJECTED">Customer Refused Package</option>
                <option value="WEATHER_OR_ROAD_BLOCK">Road Block / Heavy Flooding</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'टीप' : 'Note'}
              </label>
              <textarea
                value={failNote}
                onChange={(e) => setFailNote(e.target.value)}
                rows={3}
                placeholder="Additional details..."
                className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setFailModalOpen(false)}>
                {isMr ? 'मागे' : 'Back'}
              </Button>
              <Button variant="danger" loading={failing} onClick={handleConfirmFail}>
                {isMr ? 'अयशस्वी नोंदवा' : 'Mark Failed'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Release Job Modal */}
      {releaseModalOpen && (
        <Modal
          isOpen={releaseModalOpen}
          onClose={() => setReleaseModalOpen(false)}
          title={isMr ? 'ऑर्डर सोडायची आहे का?' : 'Release Order?'}
          maxWidth="max-w-md"
        >
          <div className="p-5 space-y-4 text-xs sm:text-sm text-ink-2">
            <p>
              {isMr
                ? 'ही ऑर्डर सोडल्यास ती इतर उपलब्ध डिलिव्हरी पार्टनर्ससाठी पुन्हा खुली केली जाईल.'
                : 'Releasing this job will return it to the jobs pool for other partners.'}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setReleaseModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button variant="danger" loading={releasing} onClick={handleConfirmRelease}>
                {isMr ? 'होय, ऑर्डर सोडा' : 'Confirm Release'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PartnerActivePage;
