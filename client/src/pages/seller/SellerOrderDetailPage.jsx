// client/src/pages/seller/SellerOrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  ArrowLeft,
  DollarSign,
  User,
  Phone
} from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

export function SellerOrderDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await apiClient.get(`/seller/orders/${id}`);
      if (res?.ok && res.data) {
        setOrder(res.data.order || res.data);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleAccept = async () => {
    setActing(true);
    try {
      await apiClient.post(`/seller/orders/${id}/accept`);
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setActing(false);
    }
  };

  const handlePack = async () => {
    setActing(true);
    try {
      await apiClient.post(`/seller/orders/${id}/pack`);
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Failed to pack order');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await apiClient.post(`/seller/orders/${id}/reject`, {
        reason: rejectReason.trim() || 'Unavailable'
      });
      setRejectModalOpen(false);
      fetchOrder();
    } catch (err) {
      alert(err.message || 'Failed to reject order');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-6 w-32 bg-cream-2 rounded animate-pulse" />
        <div className="h-40 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'ऑर्डर सापडली नाही' : 'Order Not Found'}
        </h2>
        <Link to="/seller/orders" className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'सर्व ऑर्डर्स' : 'Back to Orders'}
        </Link>
      </div>
    );
  }

  const itemsTotalRs = Math.round((order.amounts?.itemsTotalPaise || order.itemsTotalPaise || 0) / 100);
  const platformFeeRs = Math.round((order.platformFeePaise || 0) / 100);
  const partnerPayoutRs = Math.round((order.partnerPayoutPaise || 0) / 100);
  const sellerNetRs = Math.round((order.sellerNetPaise || 0) / 100);

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div>
        <Link
          to="/seller/orders"
          className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isMr ? 'सर्व ऑर्डर्सकडे परत' : 'Back to Orders'}</span>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink font-mono">
              #{order.orderNo}
            </h1>
            <p className="text-xs text-ink-2 mt-1">
              {new Date(order.createdAt).toLocaleString(isMr ? 'mr-IN' : 'en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold border border-line bg-cream text-ink">
              {order.status}
            </span>

            {order.status === 'PLACED' && (
              <>
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => setRejectModalOpen(true)}
                  className="px-4 py-2 rounded-full border border-danger text-danger text-xs font-semibold hover:bg-danger/10 disabled:opacity-50"
                >
                  {isMr ? 'नाकारा' : 'Reject'}
                </button>
                <button
                  type="button"
                  disabled={acting}
                  onClick={handleAccept}
                  className="px-5 py-2 rounded-full bg-primary text-ink text-xs font-semibold hover:bg-primary-600 disabled:opacity-50"
                >
                  {acting ? '...' : isMr ? 'ऑर्डर स्वीकारा' : 'Accept Order'}
                </button>
              </>
            )}

            {order.status === 'ACCEPTED' && (
              <button
                type="button"
                disabled={acting}
                onClick={handlePack}
                className="px-5 py-2 rounded-full bg-clay text-cream text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-sm"
              >
                {acting ? '...' : isMr ? 'पॅकिंग पूर्ण (तयार करा)' : 'Mark as Packed'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Partner assignment info */}
      {order.partner && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-purple-700" />
            <div>
              <span className="text-xs font-bold text-purple-900 block">
                {isMr ? 'नियुक्त डिलिव्हरी पार्टनर' : 'Assigned Delivery Partner'}
              </span>
              <span className="text-xs text-purple-800">
                {order.partner.name || 'Delivery Partner'} (📞 {order.partner.phone || 'Partner phone'})
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-900 rounded-full">
            {order.status === 'PICKED_UP' ? (isMr ? 'पार्सल उचलले' : 'In Transit') : (isMr ? 'पिकअपसाठी येत आहे' : 'Assigned')}
          </span>
        </div>
      )}

      {/* Grid: Items & Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ordered items */}
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <h2 className="font-bold font-serif text-base text-ink border-b border-line pb-2">
            {isMr ? 'मागवलेली उत्पादने' : 'Ordered Items'}
          </h2>
          <div className="space-y-3">
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-ink block">{it.name}</span>
                  <span className="text-ink-2">
                    {it.qty} × ₹{Math.round(it.unitPricePaise / 100)}
                  </span>
                </div>
                <span className="font-bold text-ink">
                  ₹{Math.round((it.lineTotalPaise || it.unitPricePaise * it.qty) / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Delivery Destination */}
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <h2 className="font-bold font-serif text-base text-ink border-b border-line pb-2">
            {isMr ? 'ग्राहक व डिलिव्हरी पत्ता' : 'Customer & Delivery Location'}
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-ink-2">
            <div className="flex items-center gap-2 text-ink font-semibold">
              <User className="w-4 h-4 text-clay" />
              <span>{order.address?.name || 'Customer'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-clay" />
              <span>{order.address?.phone || 'No phone'}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-clay shrink-0 mt-0.5" />
              <span>{order.address?.line} {order.address?.landmark && `(${order.address.landmark})`}</span>
            </div>
            {order.roadDistanceKm && (
              <p className="text-[11px] text-ink-2 pt-1">
                Distance: {order.roadDistanceKm.toFixed(1)} km
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Correction C18: Transparent Seller Net Breakdown */}
      <div className="p-6 bg-surface border border-line rounded-card space-y-4">
        <h2 className="font-bold font-serif text-base text-ink border-b border-line pb-2">
          {isMr ? 'कमाईचा तपशील (पारदर्शक हिशोब)' : 'Seller Net Earnings Breakdown'}
        </h2>

        <div className="space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between text-ink-2">
            <span>{isMr ? 'उत्पादने एकूण किंमत' : 'Items Total'}</span>
            <span className="font-semibold text-ink">₹{itemsTotalRs}</span>
          </div>

          <div className="flex justify-between text-ink-2">
            <span>{isMr ? 'प्लॅटफॉर्म शुल्क (५%)' : 'Platform Fee (5%)'}</span>
            <span className="font-semibold text-danger">-₹{platformFeeRs}</span>
          </div>

          {order.deliveryMode === 'SELLER_PAYS' && partnerPayoutRs > 0 && (
            <div className="flex justify-between text-ink-2">
              <span>{isMr ? 'डिलिव्हरी खर्च (विक्रेता देय)' : 'Delivery Cost (Seller Borne)'}</span>
              <span className="font-semibold text-danger">-₹{partnerPayoutRs}</span>
            </div>
          )}

          <div className="pt-2 border-t border-line flex justify-between font-bold text-base text-emerald-800">
            <span>{isMr ? 'तुमची निव्वळ कमाई (Net)' : 'Your Net Earnings'}</span>
            <span>₹{sellerNetRs}</span>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={isMr ? 'ऑर्डर नाकारा' : 'Reject Order'}
          maxWidth="max-w-md"
        >
          <div className="p-4 space-y-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder={isMr ? 'कारण सांगा...' : 'State reason...'}
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button variant="danger" loading={rejecting} onClick={handleReject}>
                {isMr ? 'नाकारा' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SellerOrderDetailPage;
