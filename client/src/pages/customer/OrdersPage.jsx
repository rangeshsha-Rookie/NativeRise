// client/src/pages/customer/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ArrowRight, Clock, Store, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import apiClient from '../../api/client';
import clsx from 'clsx';

function getStatusBadge(status, t) {
  const styles = {
    PLACED: 'bg-blue-50 text-blue-700 border-blue-200',
    ACCEPTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PACKED: 'bg-amber-50 text-amber-700 border-amber-200',
    ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
    PICKED_UP: 'bg-sky-50 text-sky-700 border-sky-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
    REJECTED: 'bg-red-50 text-danger border-red-200',
    DELIVERY_FAILED: 'bg-red-50 text-danger border-red-200',
    AWAITING_PAYMENT: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  const labelKey = `orders.status.${status}`;
  const translated = t(labelKey);
  const label = translated !== labelKey ? translated : status;

  return (
    <span
      className={clsx(
        'px-2.5 py-1 rounded-full text-xs font-bold border',
        styles[status] || 'bg-cream-2 text-ink-2 border-line'
      )}
    >
      {label}
    </span>
  );
}

export function OrdersPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/orders');
        if (mounted && res) {
          const orderItems = res.items || res.orders || res.data?.items || res.data?.orders || (Array.isArray(res) ? res : []);
          setOrders(orderItems);
        }
      } catch (err) {
        // Handled
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'तुमच्या सर्व ऑर्डर्स' : 'My Orders'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'ऑर्डर स्थिती, थेट चेकपॉईंट ट्रॅकिंग आणि ४-अंकी डिलिव्हरी कोड येथे तपासा.'
            : 'Track status, live delivery map, and delivery confirmation codes.'}
        </p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((ord) => {
            const orderId = ord.id || ord._id;
            const shopName =
              ord.seller?.shopName?.[isMr ? 'mr' : 'en'] ||
              ord.seller?.shopName?.mr ||
              ord.seller?.shopName?.en ||
              ord.seller?.shopName ||
              'Village Shop';
            const items = ord.items || [];
            const totalRs = Math.round((ord.amounts?.totalPayablePaise || ord.totalPayablePaise || 0) / 100);
            const dateStr = new Date(ord.createdAt).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={orderId}
                className="bg-surface border border-line rounded-card p-5 space-y-4 hover:shadow-sm transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink text-sm sm:text-base font-mono">
                      #{ord.orderNo}
                    </span>
                    <span className="text-xs text-ink-2">· {dateStr}</span>
                  </div>
                  <div>{getStatusBadge(ord.status, t)}</div>
                </div>

                {/* Seller & Items snippet */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-ink-2 font-medium">
                      <Store className="w-3.5 h-3.5 text-clay" />
                      <span>{shopName}</span>
                    </div>
                    <p className="text-sm font-semibold text-ink">
                      {items.map((it) => `${it.qty} × ${it.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-xs text-ink-2 block">{isMr ? 'एकूण रक्कम' : 'Total'}</span>
                      <span className="text-base font-bold text-ink">₹{totalRs}</span>
                    </div>

                    <Link
                      to={`/orders/${orderId}`}
                      className="px-4 py-2 rounded-full bg-cream-2 border border-line hover:border-ink text-ink text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>{isMr ? 'ट्रॅक करा / तपशील' : 'Track Order'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-surface border border-line rounded-card space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-cream-2 flex items-center justify-center text-ink-2">
            <Package className="w-8 h-8" />
          </div>
          <p className="text-base font-semibold text-ink">
            {isMr ? 'तुम्ही अद्याप कोणतीही ऑर्डर दिलेली नाही.' : 'You have not placed any orders yet.'}
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink text-xs sm:text-sm font-semibold hover:bg-primary-600"
          >
            {isMr ? 'खरेदी करा' : 'Explore Village Products'}
          </Link>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
