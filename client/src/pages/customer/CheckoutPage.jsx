// client/src/pages/customer/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Truck,
  CreditCard,
  Banknote,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Store,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import apiClient from '../../api/client';
import LocationPicker from '../../components/map/LocationPicker';
import clsx from 'clsx';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { cart, refreshCart, loading: cartLoading } = useCart();
  const isMr = i18n.language === 'mr';

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'RAZORPAY'
  const [customerNote, setCustomerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Feasibility & Quote calculation state
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [feasibilityError, setFeasibilityError] = useState(null);

  // Fallback temporary address if customer has none saved yet
  const [tempAddress, setTempAddress] = useState(null);

  // Determine current active address
  const savedAddresses = user?.addresses || [];
  const currentAddress =
    savedAddresses.length > 0 ? savedAddresses[selectedAddressIndex] : tempAddress;

  // Load guest location as default temp address if user has no saved addresses
  useEffect(() => {
    if (savedAddresses.length === 0 && !tempAddress) {
      const guestLoc = localStorage.getItem('nr_guest_loc');
      if (guestLoc) {
        try {
          const parsed = JSON.parse(guestLoc);
          if (parsed.lat && parsed.lng) {
            setTempAddress({
              name: user?.name?.en || user?.name?.mr || 'Customer',
              phone: user?.phone || '9876543210',
              line: parsed.line || 'Selected Location',
              landmark: parsed.landmark || '',
              lat: parsed.lat,
              lng: parsed.lng,
              label: parsed.label || 'Home'
            });
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [savedAddresses, user, tempAddress]);

  // Recalculate Quote & Feasibility whenever active address changes
  useEffect(() => {
    let mounted = true;
    if (!cart.items || cart.items.length === 0) {
      return;
    }

    if (!currentAddress || !currentAddress.lat) {
      setQuote(null);
      return;
    }

    const checkQuoteAndFeasibility = async () => {
      setQuoteLoading(true);
      setFeasibilityError(null);
      try {
        const addrPayload = currentAddress._id
          ? `addressId=${currentAddress._id}`
          : `lat=${currentAddress.lat}&lng=${currentAddress.lng}`;

        const res = await apiClient.get(`/cart/quote?${addrPayload}`);
        if (mounted && res?.ok && res.data) {
          setQuote(res.data);
          if (res.data.feasible === false) {
            setFeasibilityError(
              isMr
                ? 'हे दुकान तुमच्या पत्त्याच्या डिलिव्हरी क्षेत्राबाहेर आहे.'
                : 'Selected address is outside the seller’s delivery service radius.'
            );
          }
        }
      } catch (err) {
        if (mounted) {
          setFeasibilityError(
            err?.message || (isMr ? 'डिलिव्हरी तपासणी अयशस्वी' : 'Delivery check failed')
          );
        }
      } finally {
        if (mounted) setQuoteLoading(false);
      }
    };

    checkQuoteAndFeasibility();
    return () => {
      mounted = false;
    };
  }, [cart.items, currentAddress, isMr]);

  const handleAddNewAddress = (newLoc) => {
    const formatted = {
      name: user?.name?.en || user?.name?.mr || 'Customer',
      phone: user?.phone || '9876543210',
      line: newLoc.line || 'Pin location',
      landmark: newLoc.landmark || '',
      lat: newLoc.lat,
      lng: newLoc.lng,
      label: newLoc.label || 'Home'
    };
    setTempAddress(formatted);
  };

  const handlePlaceOrder = async () => {
    if (!currentAddress || !currentAddress.lat) {
      setErrorMessage(isMr ? 'कृपया डिलिव्हरी पत्ता निवडा.' : 'Please set a delivery address.');
      return;
    }

    if (feasibilityError) {
      setErrorMessage(feasibilityError);
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      const idempotencyKey = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      const payload = {
        paymentMethod,
        customerNote: customerNote.trim()
      };

      if (currentAddress._id) {
        payload.addressId = currentAddress._id;
      } else {
        payload.deliveryAddress = {
          name: currentAddress.name || user?.name?.en || 'Customer',
          phone: currentAddress.phone || user?.phone || '9876543210',
          line1: currentAddress.line || 'Location',
          landmark: currentAddress.landmark || '',
          lat: currentAddress.lat,
          lng: currentAddress.lng
        };
      }

      const res = await apiClient.post('/orders', payload, {
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });

      const orderData = res?.order || res?.data?.order;
      const razorpayData = res?.razorpay || res?.data?.razorpay;

      if (!orderData) {
        throw new Error('Order creation failed');
      }

      // Handle Cash on Delivery Flow
      if (paymentMethod === 'COD' || !razorpayData) {
        await refreshCart();
        navigate(`/orders/${orderData.id || orderData._id}`);
        return;
      }

      // Handle Razorpay Flow
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        // Fallback: order is in AWAITING_PAYMENT, go to order page to complete payment
        await refreshCart();
        navigate(`/orders/${orderData.id || orderData._id}`);
        return;
      }

      const rzpOptions = {
        key: razorpayData.keyId,
        amount: razorpayData.amountPaise,
        currency: razorpayData.currency || 'INR',
        name: 'NativeRise',
        description: `Order #${orderData.orderNo}`,
        order_id: razorpayData.orderId,
        prefill: {
          name: user?.name?.en || 'Customer',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#E09F3E'
        },
        handler: async function (response) {
          try {
            const verifyRes = await apiClient.post(`/orders/${orderData.id || orderData._id}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            await refreshCart();
            navigate(`/orders/${orderData.id || orderData._id}`);
          } catch (vErr) {
            navigate(`/orders/${orderData.id || orderData._id}`);
          }
        },
        modal: {
          ondismiss: function () {
            // User cancelled/closed popup
            refreshCart();
            navigate(`/orders/${orderData.id || orderData._id}`);
          }
        }
      };

      const rzpInstance = new window.Razorpay(rzpOptions);
      rzpInstance.open();
    } catch (err) {
      setErrorMessage(
        err?.message || (isMr ? 'ऑर्डर नोंदवण्यात त्रुटी आली.' : 'Failed to place order. Please try again.')
      );
      setSubmitting(false);
    }
  };

  if (authLoading || (cartLoading && (!cart.items || cart.items.length === 0))) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold font-serif text-ink">
          {isMr ? 'ऑर्डर करण्यासाठी कार्टमध्ये काहीही नाही' : 'No items in cart to checkout'}
        </h2>
        <Link
          to="/products"
          className="inline-block px-6 py-2.5 rounded-full bg-primary text-ink font-semibold"
        >
          {isMr ? 'उत्पादने पहा' : 'Browse Catalog'}
        </Link>
      </div>
    );
  }

  const seller = cart.seller;
  const shopName =
    seller?.shopName?.[isMr ? 'mr' : 'en'] ||
    seller?.shopName?.mr ||
    seller?.shopName?.en ||
    'Village Shop';

  const itemsTotalRs = Math.round(
    (quote?.itemsTotalPaise ||
      cart.items.reduce((sum, it) => sum + (it.pricePaise || 0) * it.qty, 0)) / 100
  );
  const deliveryFeeRs = Math.round((quote?.deliveryChargePaise || 0) / 100);
  const totalAmountRs = itemsTotalRs + deliveryFeeRs;

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'ऑर्डर पूर्ण करा (चेकआउट)' : 'Checkout & Payment'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? `${shopName} कडून थेट खरेदी`
            : `Review delivery location and choose payment method for ${shopName}`}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-card flex items-start gap-3 text-red-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="p-6 bg-surface border border-line rounded-card space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-clay" />
                <h2 className="text-base sm:text-lg font-bold text-ink">
                  {isMr ? '१. डिलिव्हरी पत्ता' : '1. Delivery Address'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="text-xs font-semibold text-clay hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isMr ? 'नवीन पत्ता जोडा' : 'Add / Change Location'}</span>
              </button>
            </div>

            {/* Address options */}
            {savedAddresses.length > 0 ? (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    className={clsx(
                      'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all',
                      selectedAddressIndex === idx
                        ? 'bg-cream-2 border-clay'
                        : 'bg-surface border-line hover:border-ink'
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                      className="w-4 h-4 text-clay mt-1 focus:ring-primary-600"
                    />
                    <div className="space-y-0.5 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{addr.label || 'Address'}</span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full bg-clay/10 text-clay text-[10px] font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-ink-2 leading-relaxed">
                        {addr.line || addr.line1}, {addr.landmark && `${addr.landmark}, `}
                        {addr.village || addr.city}
                      </p>
                      <p className="text-xs text-ink-2 font-medium">📞 {addr.phone || user?.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : tempAddress ? (
              <div className="p-4 bg-cream-2 border border-line rounded-xl space-y-1 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{tempAddress.label || 'Selected Location'}</span>
                  <button
                    type="button"
                    onClick={() => setShowLocationPicker(true)}
                    className="text-xs text-clay underline font-medium"
                  >
                    {isMr ? 'बदला' : 'Change'}
                  </button>
                </div>
                <p className="text-ink-2">{tempAddress.line}</p>
                <p className="text-xs text-ink-2 font-medium">📞 {tempAddress.phone}</p>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-line rounded-xl space-y-3">
                <p className="text-sm text-ink-2">
                  {isMr ? 'कोणताही पत्ता निवडलेला नाही.' : 'No delivery address selected yet.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className="px-5 py-2 rounded-full bg-primary text-ink text-xs font-semibold"
                >
                  {isMr ? 'पत्ता निवडा' : 'Select Delivery Location'}
                </button>
              </div>
            )}

            {/* Feasibility check info */}
            {quote && (
              <div
                className={clsx(
                  'p-3 rounded-xl text-xs flex items-center justify-between',
                  quote.feasible
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                )}
              >
                <div className="flex items-center gap-2">
                  {quote.feasible ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                  )}
                  <span>
                    {quote.feasible
                      ? isMr
                        ? `डिलिव्हरी उपलब्ध (~${quote.etaMins} मिनिटे, ${quote.distanceKm?.toFixed(1)} किमी)`
                        : `Feasible delivery (~${quote.etaMins} mins, ${quote.distanceKm?.toFixed(1)} km away)`
                      : isMr
                      ? 'डिलिव्हरी क्षेत्राबाहेर'
                      : 'Outside delivery range'}
                  </span>
                </div>
                <span className="font-bold">
                  {quote.deliveryChargePaise === 0
                    ? isMr
                      ? 'मोफत'
                      : 'Free'
                    : `₹${Math.round(quote.deliveryChargePaise / 100)}`}
                </span>
              </div>
            )}
          </div>

          {/* 2. Payment Method Card */}
          <div className="p-6 bg-surface border border-line rounded-card space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <CreditCard className="w-5 h-5 text-clay" />
              <h2 className="text-base sm:text-lg font-bold text-ink">
                {isMr ? '२. पेमेंट पद्धत निवडा' : '2. Payment Method'}
              </h2>
            </div>

            <div className="space-y-3">
              {/* Cash on Delivery */}
              <label
                className={clsx(
                  'flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all',
                  paymentMethod === 'COD'
                    ? 'bg-cream-2 border-clay'
                    : 'bg-surface border-line hover:border-ink'
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="w-4 h-4 text-clay mt-1 focus:ring-primary-600"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-ink text-sm sm:text-base">
                      {isMr ? 'कॅश ऑन डिलिव्हरी (COD)' : 'Cash on Delivery (COD)'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-2">
                    {isMr
                      ? 'ऑर्डर हातात मिळाल्यावर आणि ४-अंकी डिलिव्हरी कोड दिल्यावर रोख रक्कम द्या.'
                      : 'Pay cash upon receiving your order and sharing your 4-digit code.'}
                  </p>
                </div>
              </label>

              {/* Razorpay Online Payment (Test Mode - Decision S2) */}
              <label
                className={clsx(
                  'flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all',
                  paymentMethod === 'RAZORPAY'
                    ? 'bg-cream-2 border-clay'
                    : 'bg-surface border-line hover:border-ink'
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="w-4 h-4 text-clay mt-1 focus:ring-primary-600"
                />
                <div className="space-y-1 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-700" />
                      <span className="font-bold text-ink text-sm sm:text-base">
                        {isMr ? 'ऑनलाइन पेमेंट (Razorpay)' : 'Pay Online (Razorpay)'}
                      </span>
                    </div>

                    {/* Decision S2: Test mode badge */}
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
                      {t('payments.testModeBadge', 'Test mode - no real money moves')}
                    </span>
                  </div>
                  <p className="text-xs text-ink-2">
                    {isMr
                      ? 'UPI, क्रेडिट/डेबिट कार्ड किंवा नेटबँकिंगद्वारे सुरक्षित पेमेंट (चाचणी पद्धत).'
                      : 'Supports UPI, Cards, and Netbanking via Razorpay Test Gateway.'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="p-4 bg-surface border border-line rounded-card space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block">
              {isMr ? 'डिलिव्हरीसाठी विशेष सूचना (ऐच्छिक)' : 'Delivery Instructions (Optional)'}
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={isMr ? 'उदा. मुख्य दरवाज्यावर बेल वाजवा' : 'e.g., Leave at the door, ring bell'}
              className="w-full h-10 px-3 bg-cream-2 border border-line rounded-lg text-xs sm:text-sm text-ink placeholder:text-ink-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Right Column: Order Summary Bill */}
        <div className="space-y-4">
          <div className="p-6 bg-surface border border-line rounded-card space-y-5">
            <h2 className="text-lg font-bold font-serif text-ink border-b border-line pb-3">
              {isMr ? 'बिल सारांश' : 'Final Bill Summary'}
            </h2>

            {/* Items review */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.items.map((it) => {
                const prod = it.product || {};
                const name =
                  prod.name?.[isMr ? 'mr' : 'en'] || prod.name?.mr || prod.name?.en || 'Product';
                const price = Math.round((it.pricePaise || prod.pricePaise || 0) / 100);
                return (
                  <div key={prod._id || prod.id} className="flex justify-between text-xs">
                    <span className="text-ink-2 truncate max-w-[160px]">
                      {it.qty} × {name}
                    </span>
                    <span className="font-semibold text-ink">₹{price * it.qty}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-line space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-ink-2">
                <span>{isMr ? 'उत्पादने एकूण' : 'Items Subtotal'}</span>
                <span className="font-semibold text-ink">₹{itemsTotalRs}</span>
              </div>
              <div className="flex justify-between text-ink-2">
                <span>{isMr ? 'डिलिव्हरी शुल्क' : 'Delivery Fee'}</span>
                <span className="font-semibold text-ink">
                  {deliveryFeeRs === 0
                    ? isMr
                      ? 'मोफत'
                      : 'Free'
                    : `₹${deliveryFeeRs}`}
                </span>
              </div>
              <div className="pt-2 border-t border-line flex justify-between text-base font-bold text-ink">
                <span>{isMr ? 'एकूण देय' : 'Total Amount'}</span>
                <span>₹{totalAmountRs}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || quoteLoading || !currentAddress || (quote && !quote.feasible)}
              className={clsx(
                'w-full h-12 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-sm',
                submitting || quoteLoading || !currentAddress || (quote && !quote.feasible)
                  ? 'bg-cream-2 text-ink-2 cursor-not-allowed border border-line'
                  : 'bg-primary text-ink hover:bg-primary-600 active:scale-95'
              )}
            >
              <span>
                {submitting
                  ? isMr
                    ? 'ऑर्डर होत आहे...'
                    : 'Processing Order...'
                  : paymentMethod === 'COD'
                  ? isMr
                    ? 'ऑर्डर निश्चित करा (COD)'
                    : 'Place Order (COD)'
                  : isMr
                  ? `पेमेंट करा ₹${totalAmountRs}`
                  : `Pay & Place Order ₹${totalAmountRs}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-cream-2 border border-line rounded-card space-y-2 text-xs text-ink-2">
            <div className="flex items-center gap-2 font-semibold text-ink">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isMr ? 'सुरक्षित व खात्रीशीर' : 'Safe & Guaranteed'}</span>
            </div>
            <p className="leading-relaxed">
              {isMr
                ? 'ऑर्डर स्वीकारल्यानंतर तुम्हाला ४-अंकी डिलिव्हरी कोड मिळेल. डिलिव्हरी पार्टनरला माल मिळाल्यावरच तो कोड सांगा.'
                : 'You will receive a unique 4-digit code. Share it with your partner only when your parcel arrives.'}
            </p>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleAddNewAddress}
        />
      )}
    </div>
  );
}

export default CheckoutPage;
