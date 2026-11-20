// client/src/pages/seller/SellerOrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Clock, Truck, CheckCircle2, XCircle, ArrowRight, Store } from 'lucide-react';
import apiClient from '../../api/client';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import clsx from 'clsx';

const TABS = [
  { key: 'ALL', en: 'All Orders', mr: 'सर्व ऑर्डर्स' },
  { key: 'PLACED', en: 'New (Action Needed)', mr: 'नवीन (स्वीकृती आवश्यक)' },
  { key: 'ACCEPTED', en: 'Preparing', mr: 'तयार करत आहात' },
  { key: 'PACKED', en: 'Packed / Ready', mr: 'पॅक / तयार' },
  { key: 'DELIVERED', en: 'Delivered', mr: 'पूर्ण झालेल्या' },
  { key: 'CANCELLED', en: 'Cancelled / Rejected', mr: 'रद्द / नाकारलेल्या' }
];

export function SellerOrdersPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [activeTab, setActiveTab] = useState('ALL');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const [actionId, setActionId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/seller/orders');
      if (res?.ok && res.data) {
        setOrders(res.data.orders || res.data || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAccept = async (orderId) => {
    setActionId(orderId);
    try {
      await apiClient.post(`/seller/orders/${orderId}/accept`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to accept order');
    } finally {
      setActionId(null);
    }
  };

  const handlePack = async (orderId) => {
    setActionId(orderId);
    try {
      await apiClient.post(`/seller/orders/${orderId}/pack`);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to pack order');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectOrderId) return;
    setRejecting(true);
    try {
      await apiClient.post(`/seller/orders/${rejectOrderId}/reject`, {
        reason: rejectReason.trim() || 'Unavailable'
      });
      setRejectModalOpen(false);
      setRejectOrderId(null);
      setRejectReason('');
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to reject order');
    } finally {
      setRejecting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CANCELLED') {
      return ['CANCELLED', 'REJECTED', 'DELIVERY_FAILED'].includes(o.status);
    }
    return o.status === activeTab;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'ऑर्डर्स व्यवस्थापन' : 'Order Management'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'ऑर्डर स्वीकारा, पॅकिंग पूर्ण करा आणि डिलिव्हरी पार्टनरकडे सोपवा.'
            : 'Accept incoming orders, mark them packed for partner pickup, and track deliveries.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-line">
        {TABS.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all',
                isSelected
                  ? 'bg-clay text-cream shadow-sm'
                  : 'bg-surface border border-line text-ink hover:bg-cream-2'
              )}
            >
              {isMr ? tab.mr : tab.en}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const ordId = ord._id || ord.id;
            const isActing = actionId === ordId;
            const itemsTotalRs = Math.round((ord.amounts?.itemsTotalPaise || ord.itemsTotalPaise || 0) / 100);
            const netSellerRs = Math.round((ord.sellerNetPaise || 0) / 100);
            const platformFeeRs = Math.round((ord.platformFeePaise || 0) / 100);

            return (
              <div
                key={ordId}
                className="bg-surface border border-line rounded-card p-5 space-y-4 hover:shadow-sm transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-sm sm:text-base text-ink">
                      #{ord.orderNo}
                    </span>
                    <span className="text-xs text-ink-2">
                      {new Date(ord.createdAt).toLocaleDateString()} ·{' '}
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-line bg-cream text-ink">
                      {ord.status}
                    </span>
                  </div>

                  <span className="text-xs text-ink-2 font-medium">
                    {ord.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Paid Online (Razorpay)'}
                  </span>
                </div>

                {/* Items & Customer Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-ink">
                      {ord.items?.map((it) => `${it.qty} × ${it.name}`).join(', ')}
                    </p>
                    <p className="text-xs text-ink-2">
                      {isMr ? 'ग्राहक:' : 'Customer:'} {ord.address?.name || 'Customer'} (📞 {ord.address?.phone}) · {ord.address?.line}
                    </p>

                    {/* Correction C18: Transparent Seller Net Breakdown */}
                    <div className="text-[11px] text-ink-2 pt-1 flex flex-wrap gap-x-3">
                      <span>Items: ₹{itemsTotalRs}</span>
                      <span>Platform fee: -₹{platformFeeRs}</span>
                      <span className="font-bold text-emerald-700">
                        {isMr ? 'तुमची निव्वळ कमाई:' : 'Seller Net:'} ₹{netSellerRs || itemsTotalRs - platformFeeRs}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {ord.status === 'PLACED' && (
                      <>
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
                          onClick={() => handleAccept(ordId)}
                          className="px-5 py-2 rounded-full bg-primary text-ink text-xs font-semibold hover:bg-primary-600 disabled:opacity-50"
                        >
                          {isActing ? '...' : isMr ? 'स्वीकारा' : 'Accept Order'}
                        </button>
                      </>
                    )}

                    {ord.status === 'ACCEPTED' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => handlePack(ordId)}
                        className="px-5 py-2 rounded-full bg-clay text-cream text-xs font-semibold hover:opacity-90 disabled:opacity-50 shadow-sm"
                      >
                        {isActing ? '...' : isMr ? 'पॅक झाली (तयार)' : 'Mark as Packed'}
                      </button>
                    )}

                    <Link
                      to={`/seller/orders/${ordId}`}
                      className="px-4 py-2 rounded-full bg-cream-2 border border-line text-xs font-semibold hover:border-ink"
                    >
                      {isMr ? 'तपशील पहा' : 'View Details'}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-3">
          <Package className="w-10 h-10 mx-auto text-ink-2" />
          <p className="text-sm font-semibold text-ink">
            {isMr ? 'या विभागात कोणतीही ऑर्डर्स नाहीत.' : 'No orders in this category.'}
          </p>
        </div>
      )}

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

export default SellerOrdersPage;
