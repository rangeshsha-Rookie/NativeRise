// client/src/pages/seller/SellerDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Package,
  Plus,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Store,
  DollarSign,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

export function SellerDashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isMr = i18n.language === 'mr';

  const [dashboard, setDashboard] = useState(null);
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingShop, setTogglingShop] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Action in flight
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, shopRes, ordRes] = await Promise.all([
        apiClient.get('/seller/dashboard'),
        apiClient.get('/seller/shop'),
        apiClient.get('/seller/orders?limit=10')
      ]);

      if (dashRes?.ok && dashRes.data) {
        setDashboard(dashRes.data);
      }
      if (shopRes?.ok && shopRes.data) {
        setShop(shopRes.data.shop || shopRes.data);
      }
      if (ordRes?.ok && ordRes.data) {
        setOrders(ordRes.data.orders || ordRes.data || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleAcceptingOrders = async () => {
    if (!shop || togglingShop) return;
    setTogglingShop(true);
    try {
      const updatedStatus = !shop.isAcceptingOrders;
      const res = await apiClient.put('/seller/shop', {
        isAcceptingOrders: updatedStatus
      });
      if (res?.ok) {
        setShop((prev) => ({ ...prev, isAcceptingOrders: updatedStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update shop status');
    } finally {
      setTogglingShop(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    setActionInProgress(orderId);
    try {
      const res = await apiClient.post(`/seller/orders/${orderId}/accept`);
      if (res?.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setActionInProgress(null);
    }
  };

  const handlePackOrder = async (orderId) => {
    setActionInProgress(orderId);
    try {
      const res = await apiClient.post(`/seller/orders/${orderId}/pack`);
      if (res?.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to pack order');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectOrderId) return;
    setRejecting(true);
    try {
      const res = await apiClient.post(`/seller/orders/${rejectOrderId}/reject`, {
        reason: rejectReason.trim() || 'Out of stock or unavailable'
      });
      if (res?.ok) {
        setRejectModalOpen(false);
        setRejectOrderId(null);
        setRejectReason('');
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Failed to reject order');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10 space-y-6">
        <div className="h-10 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const shopName =
    shop?.shopName?.[isMr ? 'mr' : 'en'] ||
    shop?.shopName?.mr ||
    shop?.shopName?.en ||
    'My Village Shop';
  const village = shop?.location?.village || '';

  const newOrders = orders.filter((o) => o.status === 'PLACED');
  const preparingOrders = orders.filter((o) => o.status === 'ACCEPTED');
  const readyOrders = orders.filter((o) => ['PACKED', 'ASSIGNED', 'PICKED_UP'].includes(o.status));

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Shop Banner with Orders Status Toggle */}
      <div className="p-6 bg-surface border border-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-clay" />
            <span className="text-xs font-bold uppercase tracking-wider text-clay">
              {isMr ? 'विक्रेता डॅशबोर्ड' : 'Seller Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">{shopName}</h1>
          <p className="text-xs text-ink-2">
            {village && <span>{village} · </span>}
            {shop?.deliveryMode === 'SELLER_PAYS'
              ? isMr
                ? 'मोफत डिलिव्हरी मॉडेल'
                : 'Free Delivery Model'
              : isMr
              ? 'ग्राहक देय डिलिव्हरी'
              : 'Customer Pays Delivery'}
          </p>
        </div>

        {/* Operating status toggle */}
        <div className="flex items-center gap-3 bg-cream-2 px-4 py-2.5 rounded-2xl border border-line">
          <div className="text-right">
            <span className="text-xs font-bold text-ink block">
              {shop?.isAcceptingOrders
                ? isMr
                  ? 'ऑर्डर स्वीकारणे सुरू'
                  : 'Accepting Orders'
                : isMr
                ? 'दुकान तात्पुरते बंद'
                : 'Paused'}
            </span>
            <span className="text-[11px] text-ink-2">
              {shop?.isAcceptingOrders
                ? isMr
                  ? 'ग्राहक ऑर्डर करू शकतात'
                  : 'Open for customers'
                : isMr
                ? 'नवीन ऑर्डर्स बंद'
                : 'Not accepting new orders'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleAcceptingOrders}
            disabled={togglingShop}
            className={clsx(
              'w-12 h-6 rounded-full transition-colors relative focus:outline-none',
              shop?.isAcceptingOrders ? 'bg-success' : 'bg-line'
            )}
            aria-label="Toggle orders"
          >
            <span
              className={clsx(
                'w-5 h-5 rounded-full bg-cream absolute top-0.5 transition-transform',
                shop?.isAcceptingOrders ? 'left-6' : 'left-1'
              )}
            />
          </button>
        </div>
      </div>

      {/* 4 Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'नवीन ऑर्डर्स' : 'New Orders'}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-blue-700">
            {newOrders.length}
          </p>
          <span className="text-[11px] text-ink-2 font-medium">
            {isMr ? 'स्वीकारणे आवश्यक' : 'Action needed'}
          </span>
        </div>

        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'तयार करत आहात' : 'Preparing'}</span>
            <Package className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-indigo-700">
            {preparingOrders.length}
          </p>
          <span className="text-[11px] text-ink-2 font-medium">
            {isMr ? 'पॅकिंग आवश्यक' : 'Needs packing'}
          </span>
        </div>

        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'पिकअप / मार्गावर' : 'Ready / Transit'}</span>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-purple-700">
            {readyOrders.length}
          </p>
          <span className="text-[11px] text-ink-2 font-medium">
            {isMr ? 'पार्टनरकडे सोपवले' : 'Assigned to partner'}
          </span>
        </div>

        <div className="p-5 bg-surface border border-line rounded-card space-y-1">
          <div className="flex items-center justify-between text-xs text-ink-2">
            <span>{isMr ? 'निव्वळ कमाई' : 'Net Earnings'}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-700">
            ₹{Math.round((dashboard?.totalEarningsPaise || 0) / 100)}
          </p>
          <span className="text-[11px] text-ink-2 font-medium">
            {isMr ? 'एकूण जमा रक्कम' : 'Simulated balance'}
          </span>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/seller/products/new"
          className="p-4 bg-primary/20 border border-primary-600/30 rounded-card flex items-center gap-3 hover:bg-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-primary text-ink flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-ink block leading-tight">
              {isMr ? 'नवीन उत्पादन जोडा' : 'Add Product'}
            </span>
            <span className="text-[11px] text-ink-2">
              {isMr ? 'फोटो किंवा आवाजाने' : 'Snap & Voice AI'}
            </span>
          </div>
        </Link>

        <Link
          to="/seller/what-to-sell"
          className="p-4 bg-amber-50 border border-amber-200 rounded-card flex items-center gap-3 hover:bg-amber-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-ink block leading-tight">
              {isMr ? 'काय विकावे? (AI)' : 'What to Sell AI'}
            </span>
            <span className="text-[11px] text-ink-2">
              {isMr ? 'मागणीनुसार कल्पना' : 'Market demand ideas'}
            </span>
          </div>
        </Link>

        <Link
          to="/seller/growth"
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-3 hover:bg-emerald-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-ink block leading-tight">
              {isMr ? 'ग्रोथ कोच (AI)' : 'Growth Coach'}
            </span>
            <span className="text-[11px] text-ink-2">
              {isMr ? 'ग्राहक अभिप्राय विश्लेषण' : 'Insights & tips'}
            </span>
          </div>
        </Link>

        <Link
          to="/seller/assistant"
          className="p-4 bg-purple-50 border border-purple-200 rounded-card flex items-center gap-3 hover:bg-purple-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-purple-200 text-purple-900 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-ink block leading-tight">
              {isMr ? 'विक्रेता AI सहाय्यक' : 'Seller AI Assistant'}
            </span>
            <span className="text-[11px] text-ink-2">
              {isMr ? 'माहिती व मदत' : 'Chat & support'}
            </span>
          </div>
        </Link>
      </div>

      {/* Action Needed Orders (PLACED) */}
      {newOrders.length > 0 && (
        <div className="p-6 bg-surface border-2 border-primary rounded-card space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 text-ink">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold font-serif">
                {isMr ? `नवीन ऑर्डर्स — स्वीकृती आवश्यक (${newOrders.length})` : `New Orders — Action Required (${newOrders.length})`}
              </h2>
            </div>
            <Link to="/seller/orders" className="text-xs font-semibold text-clay hover:underline">
              {isMr ? 'सर्व ऑर्डर्स' : 'View all'}
            </Link>
          </div>

          <div className="space-y-3">
            {newOrders.map((ord) => {
              const ordId = ord._id || ord.id;
              const isActing = actionInProgress === ordId;
              const totalRs = Math.round((ord.amounts?.totalPayablePaise || ord.totalPayablePaise || 0) / 100);

              return (
                <div
                  key={ordId}
                  className="p-4 bg-cream-2 border border-line rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink font-mono text-sm sm:text-base">
                        #{ord.orderNo}
                      </span>
                      <span className="text-xs text-ink-2">· {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {ord.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-ink">
                      {ord.items?.map((it) => `${it.qty} × ${it.name}`).join(', ')}
                    </p>
                    <p className="text-xs text-ink-2">
                      {isMr ? 'ग्राहक:' : 'Customer:'} {ord.address?.name || 'Customer'} (📞 {ord.address?.phone})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink text-sm sm:text-base mr-2">
                      ₹{totalRs}
                    </span>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => {
                        setRejectOrderId(ordId);
                        setRejectModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-full border border-danger text-danger text-xs font-semibold hover:bg-danger/10 disabled:opacity-50"
                    >
                      {isMr ? 'नाकारा' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      disabled={isActing}
                      onClick={() => handleAcceptOrder(ordId)}
                      className="px-5 py-2 rounded-full bg-primary text-ink text-xs font-semibold hover:bg-primary-600 disabled:opacity-50 shadow-sm"
                    >
                      {isActing ? '...' : isMr ? 'स्वीकारा' : 'Accept Order'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preparing Orders (ACCEPTED -> Pack) */}
      {preparingOrders.length > 0 && (
        <div className="p-6 bg-surface border border-line rounded-card space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 text-ink">
              <Package className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold font-serif">
                {isMr ? `तयार होत असलेल्या ऑर्डर्स (${preparingOrders.length})` : `Orders to Pack (${preparingOrders.length})`}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {preparingOrders.map((ord) => {
              const ordId = ord._id || ord.id;
              const isActing = actionInProgress === ordId;

              return (
                <div
                  key={ordId}
                  className="p-4 bg-cream rounded-xl border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink font-mono text-sm">
                        #{ord.orderNo}
                      </span>
                      <span className="text-xs text-ink-2">· {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-ink">
                      {ord.items?.map((it) => `${it.qty} × ${it.name}`).join(', ')}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handlePackOrder(ordId)}
                    className="px-5 py-2 rounded-full bg-clay text-cream text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-sm"
                  >
                    {isActing ? '...' : isMr ? 'ऑर्डर पॅक झाली (पार्टनरसाठी तयार)' : 'Mark Packed & Ready'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-ink">
            {isMr ? 'सर्व अलीकडील ऑर्डर्स' : 'Recent Orders'}
          </h2>
          <Link to="/seller/orders" className="text-xs sm:text-sm font-semibold text-clay hover:underline flex items-center gap-1">
            <span>{isMr ? 'सर्व ऑर्डर्स पहा' : 'View All Orders'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="bg-surface border border-line rounded-card divide-y divide-line overflow-hidden">
            {orders.slice(0, 5).map((o) => {
              const ordId = o._id || o.id;
              const totalRs = Math.round((o.amounts?.totalPayablePaise || o.totalPayablePaise || 0) / 100);

              return (
                <div key={ordId} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-cream-2 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-sm text-ink">#{o.orderNo}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-line bg-cream">
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-ink-2 truncate max-w-xs">
                      {o.items?.map((it) => `${it.qty} × ${it.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-ink">₹{totalRs}</span>
                    <Link
                      to={`/seller/orders/${ordId}`}
                      className="px-3 py-1.5 rounded-full bg-cream-2 border border-line text-xs font-semibold hover:border-ink"
                    >
                      {isMr ? 'तपशील' : 'Details'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-ink-2 italic">
            {isMr ? 'कोणतीही ऑर्डर्स नाहीत.' : 'No orders received yet.'}
          </p>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={isMr ? 'ऑर्डर नाकारण्याचे कारण' : 'Reject Order'}
          maxWidth="max-w-md"
        >
          <div className="p-4 space-y-4">
            <p className="text-xs sm:text-sm text-ink-2">
              {isMr
                ? 'ऑर्डर नाकारल्यास ग्राहकाला सूचना जाईल. कृपया कारण नमूद करा:'
                : 'Rejecting will inform customer and release stock. Please provide reason:'}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder={isMr ? 'उदा. ताजे साहित्य उपलब्ध नाही / स्टॉक संपला' : 'e.g. Out of stock / cannot fulfill today'}
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>
                {isMr ? 'रद्द करा' : 'Cancel'}
              </Button>
              <Button variant="danger" loading={rejecting} onClick={handleConfirmReject}>
                {isMr ? 'होय, ऑर्डर नाकारा' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SellerDashboardPage;
