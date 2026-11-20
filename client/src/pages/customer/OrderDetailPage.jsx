// client/src/pages/customer/OrderDetailPage.jsx
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
  Store,
  KeyRound,
  RotateCcw,
  Star,
  LifeBuoy,
  CreditCard,
  Banknote,
  RefreshCw
} from 'lucide-react';
import apiClient from '../../api/client';
import LiveTrackingMap from '../../components/map/LiveTrackingMap';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { RatingStars } from '../../components/ui/RatingStars';
import clsx from 'clsx';

const ORDER_STEPS = [
  { key: 'PLACED', en: 'Placed', mr: 'नोंदवली' },
  { key: 'ACCEPTED', en: 'Accepted', mr: 'स्वीकारली' },
  { key: 'PACKED', en: 'Packed', mr: 'पॅक झाली' },
  { key: 'PICKED_UP', en: 'Out for Delivery', mr: 'डिलिव्हरीसाठी रवाना' },
  { key: 'DELIVERED', en: 'Delivered', mr: 'डिलिव्हर झाली' }
];

function getStepIndex(status) {
  switch (status) {
    case 'PLACED':
      return 0;
    case 'ACCEPTED':
      return 1;
    case 'PACKED':
      return 2;
    case 'ASSIGNED':
      return 2; // partner assigned, preparing for pickup
    case 'PICKED_UP':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return -1;
  }
}

export function OrderDetailPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const fetchOrderAndTracking = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [ordRes, trkRes] = await Promise.all([
        apiClient.get(`/orders/${id}`),
        apiClient.get(`/orders/${id}/tracking`).catch(() => null)
      ]);

      const orderData = ordRes?.order || ordRes?.data?.order || ordRes?.data || ordRes;
      if (orderData && (orderData.id || orderData._id || orderData.orderNo)) {
        setOrder(orderData);
      }
      const trackData = trkRes?.tracking || trkRes?.data?.tracking || trkRes?.data || trkRes;
      if (trackData && !trackData.error) {
        setTracking(trackData);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrderAndTracking();

    // Auto-poll tracking every 15s if order is active
    const interval = setInterval(() => {
      if (order && ['ASSIGNED', 'PICKED_UP'].includes(order.status)) {
        fetchOrderAndTracking();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [id, order?.status]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await apiClient.post(`/orders/${id}/cancel`, {
        reason: cancelReason.trim() || 'Customer requested cancellation'
      });
      if (res?.ok || res?.id || res?._id || res?.status) {
        setCancelModalOpen(false);
        fetchOrderAndTracking();
      }
    } catch (err) {
      alert(err.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!order?.items?.[0]?.productId) return;
    setReviewing(true);
    try {
      const res = await apiClient.post('/reviews', {
        orderId: order.id || order._id,
        productId: order.items[0].productId,
        rating: reviewRating,
        comment: reviewComment.trim() || 'Great authentic product!'
      });
      if (res?.ok || res?.id || res?._id) {
        setReviewModalOpen(false);
        setHasReviewed(true);
      }
    } catch (err) {
      alert(err.message || 'Could not submit review');
    } finally {
      setReviewing(false);
    }
  };

  const handleCreateSupportTicket = async () => {
    setSubmittingTicket(true);
    try {
      const res = await apiClient.post('/support/tickets', {
        orderId: order.id || order._id,
        category: 'ORDER_STATUS',
        subject: supportSubject.trim() || `Help with Order #${order.orderNo}`,
        description: supportDescription.trim() || 'Customer support inquiry'
      });
      const ticketId = res?.ticket?.id || res?.ticket?._id || res?.id || res?._id;
      if (ticketId) {
        setSupportModalOpen(false);
        navigate(`/support/${ticketId}`);
      }
    } catch (err) {
      alert(err.message || 'Could not create support ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="h-40 bg-cream-2 rounded-card animate-pulse" />
        <div className="h-64 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'ऑर्डर सापडली नाही' : 'Order Not Found'}
        </h2>
        <Link to="/orders" className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink font-semibold">
          {isMr ? 'माझ्या ऑर्डर्स' : 'Back to Orders'}
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = ['CANCELLED', 'REJECTED', 'DELIVERY_FAILED'].includes(order.status);
  const shopName =
    order.seller?.shopName?.[isMr ? 'mr' : 'en'] ||
    order.seller?.shopName?.mr ||
    order.seller?.shopName?.en ||
    order.seller?.shopName ||
    'Village Shop';
  const totalAmountRs = Math.round(
    (order.amounts?.totalPayablePaise || order.totalPayablePaise || 0) / 100
  );
  const itemsTotalRs = Math.round(
    (order.amounts?.itemsTotalPaise || order.itemsTotalPaise || 0) / 100
  );
  const deliveryFeeRs = Math.round(
    (order.amounts?.customerDeliveryChargePaise || order.customerDeliveryChargePaise || 0) / 100
  );

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink font-mono">
              #{order.orderNo}
            </h1>
            <button
              type="button"
              onClick={() => fetchOrderAndTracking(true)}
              className="p-1.5 text-ink-2 hover:text-ink rounded-full bg-cream-2"
              title="Refresh"
            >
              <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin text-clay')} />
            </button>
          </div>
          <p className="text-xs text-ink-2 mt-1">
            {new Date(order.createdAt).toLocaleString(isMr ? 'mr-IN' : 'en-IN')} · {shopName}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {order.status === 'PLACED' && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 rounded-full border border-danger text-danger text-xs font-semibold hover:bg-danger/10 transition-colors"
            >
              {isMr ? 'ऑर्डर रद्द करा' : 'Cancel Order'}
            </button>
          )}

          {order.status === 'DELIVERED' && !hasReviewed && (
            <button
              type="button"
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2 rounded-full bg-primary text-ink text-xs font-semibold hover:bg-primary-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Star className="w-4 h-4 fill-ink" />
              <span>{isMr ? 'अभिप्राय द्या' : 'Write Review'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSupportModalOpen(true)}
            className="px-4 py-2 rounded-full bg-cream-2 border border-line text-ink text-xs font-semibold hover:bg-cream transition-colors flex items-center gap-1.5"
          >
            <LifeBuoy className="w-4 h-4 text-clay" />
            <span>{isMr ? 'मदत हवी आहे?' : 'Need Help?'}</span>
          </button>
        </div>
      </div>

      {/* Prominent 4-Digit Delivery Code Box (Decision D9 / Correction C4) */}
      {order.deliveryCode && !['DELIVERED', 'CANCELLED', 'REJECTED', 'DELIVERY_FAILED'].includes(order.status) && (
        <div className="p-6 bg-gradient-to-r from-clay/10 via-primary-100/40 to-clay/10 border-2 border-clay rounded-card flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-clay font-bold text-xs uppercase tracking-wider">
              <KeyRound className="w-4 h-4" />
              <span>{isMr ? '४-अंकी डिलिव्हरी पडताळणी कोड' : '4-Digit Delivery Code'}</span>
            </div>
            <p className="text-xs sm:text-sm text-ink-2 max-w-md leading-relaxed">
              {isMr
                ? 'हा कोड सुरक्षित ठेवा. डिलिव्हरी पार्टनर तुमचे पार्सल घेऊन आल्यावरच हा कोड त्यांच्याशी शेअर करा.'
                : 'Keep this code safe. Share it with your delivery partner only when you inspect and receive your package.'}
            </p>
          </div>

          <div className="bg-surface px-6 py-3 rounded-2xl border-2 border-clay shadow-sm text-center">
            <span className="text-3xl sm:text-4xl font-mono font-extrabold tracking-widest text-clay select-all">
              {order.deliveryCode}
            </span>
          </div>
        </div>
      )}

      {/* Stepper Status Progression */}
      {!isCancelled ? (
        <div className="p-6 bg-surface border border-line rounded-card">
          <div className="grid grid-cols-5 gap-2 text-center">
            {ORDER_STEPS.map((st, idx) => {
              const isPast = currentStep > idx;
              const isCurrent = currentStep === idx;

              return (
                <div key={st.key} className="flex flex-col items-center space-y-2">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      isPast
                        ? 'bg-success text-cream'
                        : isCurrent
                        ? 'bg-primary text-ink ring-4 ring-primary-100'
                        : 'bg-cream-2 text-ink-2'
                    )}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={clsx(
                      'text-xs font-semibold',
                      isCurrent ? 'text-ink font-bold' : isPast ? 'text-success' : 'text-ink-2'
                    )}
                  >
                    {isMr ? st.mr : st.en}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-red-50 border border-red-200 rounded-card flex items-center gap-3 text-red-900 text-sm">
          <XCircle className="w-5 h-5 text-danger shrink-0" />
          <div>
            <span className="font-bold">{isMr ? 'ऑर्डर स्थिती:' : 'Order Status:'} </span>
            <span>{order.status}</span>
          </div>
        </div>
      )}

      {/* Live Checkpoint-Based Tracking Map (Feature F6, D2, D10) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-clay" />
            <h2 className="text-lg font-bold font-serif text-ink">
              {isMr ? 'थेट चेकपॉईंट डिलिव्हरी ट्रॅकिंग' : 'Live Checkpoint Delivery Tracking'}
            </h2>
          </div>
          {order.etaMins && !['DELIVERED', 'CANCELLED'].includes(order.status) && (
            <span className="text-xs font-semibold text-clay bg-clay/10 px-3 py-1 rounded-full">
              {isMr ? `अंदाजे पोहोच: ~${order.etaMins} मिनिटे` : `ETA: ~${order.etaMins} mins`}
            </span>
          )}
        </div>

        <LiveTrackingMap
          pickup={order.pickup}
          drop={order.address}
          partnerLocation={tracking?.partnerLocation}
          trail={tracking?.trail || []}
          checkpoints={tracking?.checkpoints || []}
          status={order.status}
        />
      </div>

      {/* Order Details & Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Items List */}
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <h3 className="font-bold font-serif text-base text-ink border-b border-line pb-2">
            {isMr ? 'मागवलेली उत्पादने' : 'Ordered Items'}
          </h3>
          <div className="space-y-3">
            {order.items?.map((it, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-cream-2 border border-line overflow-hidden shrink-0">
                    <img
                      src={it.image || '/placeholder-product.jpg'}
                      alt={it.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-ink block">{it.name}</span>
                    <span className="text-ink-2">
                      {it.qty} × ₹{Math.round(it.unitPricePaise / 100)}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-ink">
                  ₹{Math.round((it.lineTotalPaise || it.unitPricePaise * it.qty) / 100)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Summary & Delivery Address */}
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <h3 className="font-bold font-serif text-base text-ink border-b border-line pb-2">
            {isMr ? 'बिल व पत्ता' : 'Bill & Delivery Address'}
          </h3>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-ink-2">
              <span>{isMr ? 'उत्पादने एकूण' : 'Items Subtotal'}</span>
              <span className="font-semibold text-ink">₹{itemsTotalRs}</span>
            </div>
            <div className="flex justify-between text-ink-2">
              <span>{isMr ? 'डिलिव्हरी शुल्क' : 'Delivery Fee'}</span>
              <span className="font-semibold text-ink">
                {deliveryFeeRs === 0 ? (isMr ? 'मोफत' : 'Free') : `₹${deliveryFeeRs}`}
              </span>
            </div>
            <div className="pt-2 border-t border-line flex justify-between font-bold text-base text-ink">
              <span>{isMr ? 'एकूण रक्कम' : 'Total Paid / Payable'}</span>
              <span>₹{totalAmountRs}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-line space-y-1 text-xs">
            <span className="font-bold text-ink block">{isMr ? 'डिलिव्हरी पत्ता:' : 'Delivery Address:'}</span>
            <p className="text-ink-2">{order.address?.line}</p>
            <p className="text-ink-2">📞 {order.address?.phone}</p>
            <div className="pt-1 flex items-center gap-1.5 text-clay font-medium">
              <span>{isMr ? 'पेमेंट पद्धत:' : 'Payment:'}</span>
              <span>{order.paymentMethod === 'COD' ? 'Cash on Delivery (रोख)' : 'Online Razorpay'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={isMr ? 'ऑर्डर रद्द करायची आहे का?' : 'Cancel Order?'}
          maxWidth="max-w-md"
        >
          <div className="p-4 space-y-4">
            <p className="text-xs sm:text-sm text-ink-2">
              {isMr
                ? 'ऑर्डर रद्द केल्यास आरक्षित स्टॉक पूर्ववत केला जाईल. कृपया रद्द करण्याचे कारण सांगा:'
                : 'Cancelling will restore stock to the seller. Please tell us the reason:'}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder={isMr ? 'उदा. चुकीचा पत्ता किंवा ऑर्डर बदलली' : 'e.g., Placed by mistake'}
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
                {isMr ? 'मागे' : 'Back'}
              </Button>
              <Button variant="danger" loading={cancelling} onClick={handleCancelOrder}>
                {isMr ? 'होय, रद्द करा' : 'Confirm Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={isMr ? 'उत्पादनाचा अभिप्राय द्या' : 'Write Verified Review'}
          maxWidth="max-w-md"
        >
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-2">
                {isMr ? 'रेटिंग द्या' : 'Your Rating'}
              </label>
              <RatingStars
                rating={reviewRating}
                interactive
                onChange={(r) => setReviewRating(r)}
                size={24}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'तुमचा अनुभव व अभिप्राय' : 'Your Review & Comments'}
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                placeholder={isMr ? 'उत्पादनाची चव, ताजेपणा आणि पॅकिंगबद्दल लिहा...' : 'Share details on quality, taste, packing...'}
                className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setReviewModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button variant="primary" loading={reviewing} onClick={handleSubmitReview}>
                {isMr ? 'अभिप्राय सबमिट करा' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Support Ticket Modal */}
      {supportModalOpen && (
        <Modal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          title={isMr ? 'मदत किंवा तक्रार नोंदवा' : 'Raise Support Inquiry'}
          maxWidth="max-w-md"
        >
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'विषय' : 'Subject'}
              </label>
              <input
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder={isMr ? 'उदा. डिलिव्हरी उशीर किंवा पॅकेज नुकसान' : 'e.g. Delivery delay, damaged seal'}
                className="w-full h-10 px-3 bg-cream-2 border border-line rounded-lg text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
                {isMr ? 'तपशीलवार माहिती' : 'Description'}
              </label>
              <textarea
                value={supportDescription}
                onChange={(e) => setSupportDescription(e.target.value)}
                rows={4}
                placeholder={isMr ? 'समस्येचे सविस्तर वर्णन करा...' : 'Explain the issue in detail...'}
                className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setSupportModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                loading={submittingTicket}
                onClick={handleCreateSupportTicket}
              >
                {isMr ? 'तिकीट तयार करा' : 'Submit Ticket'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default OrderDetailPage;
