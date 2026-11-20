// client/src/pages/customer/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, ShoppingBag, ArrowRight, Store, AlertTriangle, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import clsx from 'clsx';

export function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, updateQty, removeItem, clearCart, loading } = useCart();
  const isMr = i18n.language === 'mr';

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [mutatingId, setMutatingId] = useState(null);

  // Fetch Quote from /cart/quote
  useEffect(() => {
    let mounted = true;
    if (!cart.items || cart.items.length === 0) {
      setQuote(null);
      return;
    }

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        let queryStr = '';
        if (user?.addresses?.length > 0) {
          const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
          if (def?._id) queryStr = `?addressId=${def._id}`;
        }
        const res = await apiClient.get(`/cart/quote${queryStr}`);
        if (mounted && res?.ok && res.data) {
          setQuote(res.data);
        }
      } catch (err) {
        if (mounted) setQuote(null);
      } finally {
        if (mounted) setQuoteLoading(false);
      }
    };

    fetchQuote();
    return () => {
      mounted = false;
    };
  }, [cart.items, user]);

  const handleUpdateQty = async (productId, newQty) => {
    setMutatingId(productId);
    try {
      if (newQty <= 0) {
        await removeItem(productId);
      } else {
        await updateQty(productId, newQty);
      }
    } catch (err) {
      // Handled
    } finally {
      setMutatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setMutatingId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      // Handled
    } finally {
      setMutatingId(null);
    }
  };

  if (loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-12 space-y-6">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
        <div className="h-40 bg-cream-2 rounded-card animate-pulse" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-cream-2 flex items-center justify-center text-ink-2">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'तुमची कार्ट रिकामी आहे' : 'Your Shopping Cart is Empty'}
          </h1>
          <p className="text-sm text-ink-2">
            {isMr
              ? 'गावातील महिला आणि शेतकऱ्यांनी बनवलेली ताजी उत्पादने खरेदी करा.'
              : 'Explore authentic homemade pickles, spices, and honey straight from rural makers.'}
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-primary text-ink font-semibold hover:bg-primary-600 transition-all shadow-sm"
        >
          <span>{isMr ? 'खरेदी सुरू करा' : 'Start Shopping'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const seller = cart.seller;
  const shopName = seller?.shopName?.[isMr ? 'mr' : 'en'] || seller?.shopName?.mr || seller?.shopName?.en || 'Village Shop';
  const village = seller?.location?.village || '';
  const district = seller?.location?.district || '';

  // Calculate totals from items or quote
  const itemsSubtotalPaise = cart.items.reduce(
    (sum, item) => sum + (item.pricePaise || item.product?.pricePaise || 0) * item.qty,
    0
  );
  const itemsSubtotalRs = Math.round(itemsSubtotalPaise / 100);

  const deliveryChargePaise = quote ? quote.deliveryChargePaise : (seller?.deliveryMode === 'SELLER_PAYS' ? 0 : 4000);
  const deliveryChargeRs = Math.round(deliveryChargePaise / 100);

  const minOrderValuePaise = seller?.minOrderValuePaise || 0;
  const minOrderValueRs = Math.round(minOrderValuePaise / 100);
  const isBelowMinOrder = minOrderValuePaise > 0 && itemsSubtotalPaise < minOrderValuePaise;
  const deficitRs = Math.round((minOrderValuePaise - itemsSubtotalPaise) / 100);

  const totalPayableRs = itemsSubtotalRs + deliveryChargeRs;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title & Clear Cart */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'तुमची कार्ट' : 'Shopping Cart'}
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs sm:text-sm text-danger hover:underline font-semibold"
        >
          {isMr ? 'कार्ट रिकामी करा' : 'Clear Cart'}
        </button>
      </div>

      {/* Seller Origin Banner */}
      {seller && (
        <div className="p-4 bg-surface border border-line rounded-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-clay text-cream flex items-center justify-center font-bold text-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-clay">
                  {isMr ? 'थेट या गावातून ऑर्डर:' : 'Ordering directly from:'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-ink">
                {shopName} {village && <span className="text-xs font-normal text-ink-2">({village}, {district})</span>}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-cream-2 border border-line rounded-full text-xs font-semibold text-ink-2">
            {t('cart.singleSellerNotice', 'Single-seller cart')}
          </span>
        </div>
      )}

      {/* Below Min Order Warning Banner (Correction C6) */}
      {isBelowMinOrder && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-card flex items-start gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">
              {isMr
                ? `या दुकानासाठी किमान ऑर्डर मर्यादा ₹${minOrderValueRs} आहे.`
                : `Minimum order value for ${shopName} is ₹${minOrderValueRs}.`}
            </p>
            <p className="mt-0.5 text-amber-800">
              {isMr
                ? `ऑर्डर करण्यासाठी कृपया आणखी ₹${deficitRs} किमतीची उत्पादने जोडा.`
                : `Please add ₹${deficitRs} more worth of items to proceed with checkout.`}
            </p>
          </div>
        </div>
      )}

      {/* Grid: Cart Items (Left) vs Summary Bill (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => {
            const prod = item.product || {};
            const prodId = prod._id || prod.id || item.productId;
            const name = prod.name?.[isMr ? 'mr' : 'en'] || prod.name?.mr || prod.name?.en || 'Product';
            const priceRs = Math.round((item.pricePaise || prod.pricePaise || 0) / 100);
            const itemTotalRs = priceRs * item.qty;
            const isMutating = mutatingId === prodId;

            return (
              <div
                key={prodId}
                className="p-4 sm:p-5 bg-surface border border-line rounded-card flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cream-2 border border-line overflow-hidden shrink-0">
                    <img
                      src={prod.images?.[0] || '/placeholder-product.jpg'}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=60';
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <Link
                      to={`/products/${prodId}`}
                      className="text-sm sm:text-base font-bold text-ink hover:text-clay transition-colors line-clamp-1"
                    >
                      {name}
                    </Link>
                    <div className="text-xs text-ink-2">
                      ₹{priceRs} {prod.unit && <span>/ {prod.unit}</span>}
                    </div>
                    <div className="text-sm font-bold text-ink sm:hidden">
                      ₹{itemTotalRs}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Stepper */}
                  <div className="flex items-center border border-line rounded-full bg-cream h-9 px-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(prodId, item.qty - 1)}
                      disabled={isMutating}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-ink disabled:opacity-40 text-sm font-bold"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-bold text-xs sm:text-sm text-ink">
                      {isMutating ? '...' : item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQty(prodId, item.qty + 1)}
                      disabled={isMutating || item.qty >= 10}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-ink disabled:opacity-40 text-sm font-bold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:block text-right min-w-[70px]">
                    <span className="text-base font-bold text-ink">₹{itemTotalRs}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(prodId)}
                    disabled={isMutating}
                    className="p-2 text-ink-2 hover:text-danger rounded-full transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bill Summary Column */}
        <div className="space-y-4">
          <div className="p-6 bg-surface border border-line rounded-card space-y-5">
            <h2 className="text-lg font-bold font-serif text-ink border-b border-line pb-3">
              {isMr ? 'ऑर्डर सारांश' : 'Order Summary'}
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-ink-2">
                <span>{isMr ? 'उत्पादने एकूण' : 'Items Subtotal'}</span>
                <span className="font-semibold text-ink">₹{itemsSubtotalRs}</span>
              </div>

              <div className="flex items-center justify-between text-ink-2">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-clay" />
                  <span>{isMr ? 'डिलिव्हरी शुल्क' : 'Delivery Fee'}</span>
                </span>
                <span className="font-semibold text-ink">
                  {deliveryChargePaise === 0
                    ? isMr
                      ? 'मोफत'
                      : 'Free'
                    : `₹${deliveryChargeRs}`}
                </span>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-between text-base sm:text-lg font-bold text-ink">
                <span>{isMr ? 'एकूण देय रक्कम' : 'Total Amount'}</span>
                <span>₹{totalPayableRs}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              disabled={isBelowMinOrder}
              className={clsx(
                'w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-sm',
                isBelowMinOrder
                  ? 'bg-cream-2 text-ink-2 cursor-not-allowed border border-line'
                  : 'bg-primary text-ink hover:bg-primary-600 active:scale-95'
              )}
            >
              <span>{isMr ? 'ऑर्डर पूर्ण करा' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-ink-2 text-center leading-relaxed">
            {isMr
              ? 'पुढील पानावर पत्ता निवडा व कॅश ऑन डिलिव्हरी किंवा ऑनलाइन पेमेंट करा.'
              : 'Delivery address and Cash on Delivery / Razorpay Test payment on next step.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
