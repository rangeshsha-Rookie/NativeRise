// client/src/pages/seller/ShopSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Store, MapPin, Truck, Save, AlertCircle, CheckCircle } from 'lucide-react';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import LocationPicker from '../../components/map/LocationPicker';

export function ShopSettingsPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [shopNameMr, setShopNameMr] = useState('');
  const [shopNameEn, setShopNameEn] = useState('');
  const [storyMr, setStoryMr] = useState('');
  const [storyEn, setStoryEn] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [coords, setCoords] = useState({ lat: 19.3512, lng: 72.8845 });
  const [addressLine, setAddressLine] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('SELLER_PAYS');
  const [maxDeliveryKm, setMaxDeliveryKm] = useState(30);
  const [minOrderValueRs, setMinOrderValueRs] = useState(200);
  const [prepTimeMins, setPrepTimeMins] = useState(30);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    apiClient
      .get('/seller/shop')
      .then((res) => {
        if (res?.ok && res.data) {
          const s = res.data.shop || res.data;
          setShopNameMr(s.shopName?.mr || '');
          setShopNameEn(s.shopName?.en || '');
          setStoryMr(s.story?.mr || '');
          setStoryEn(s.story?.en || '');
          setVillage(s.location?.village || '');
          setDistrict(s.location?.district || '');
          setAddressLine(s.location?.line || '');
          if (s.location?.lat && s.location?.lng) {
            setCoords({ lat: s.location.lat, lng: s.location.lng });
          }
          setDeliveryMode(s.deliveryMode || 'SELLER_PAYS');
          setMaxDeliveryKm(s.maxDeliveryKm || 30);
          setMinOrderValueRs(Math.round((s.minOrderValuePaise || 0) / 100));
          setPrepTimeMins(s.prepTimeMins || 30);
          setIsAcceptingOrders(s.isAcceptingOrders !== false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLocationSelected = (loc) => {
    setCoords({ lat: loc.lat, lng: loc.lng });
    setAddressLine(loc.line || 'Shop Location');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const payload = {
        shopName: {
          mr: shopNameMr.trim(),
          en: shopNameEn.trim() || shopNameMr.trim()
        },
        story: {
          mr: storyMr.trim(),
          en: storyEn.trim() || storyMr.trim()
        },
        location: {
          village: village.trim(),
          district: district.trim(),
          line: addressLine.trim(),
          lat: coords.lat,
          lng: coords.lng
        },
        deliveryMode,
        maxDeliveryKm: parseInt(maxDeliveryKm, 10) || 30,
        minOrderValuePaise: (parseInt(minOrderValueRs, 10) || 0) * 100,
        prepTimeMins: parseInt(prepTimeMins, 10) || 30,
        isAcceptingOrders
      };

      const res = await apiClient.put('/seller/shop', payload);
      if (res?.ok) {
        setSuccessMessage(isMr ? 'दुकान माहिती यशस्वीपणे जतन केली!' : 'Shop settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update shop');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-12">
        <div className="h-8 w-48 bg-cream-2 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
          {isMr ? 'दुकान सेटिंग्ज व वितरण नियम' : 'Shop Settings & Delivery Rules'}
        </h1>
        <p className="text-xs sm:text-sm text-ink-2 mt-1">
          {isMr
            ? 'दुकान माहिती, स्थान, किमान ऑर्डर मर्यादा आणि डिलिव्हरी नियम व्यवस्थापित करा.'
            : 'Configure shop profile, geographic coordinates, delivery pricing mode, and minimum order limits.'}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-card flex items-center gap-2 text-emerald-900 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="p-6 sm:p-8 bg-surface border border-line rounded-card space-y-6">
        {/* Shop Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'दुकानाचे नाव (मराठी)' : 'Shop Name (Marathi)'} *
            </label>
            <input
              type="text"
              value={shopNameMr}
              onChange={(e) => setShopNameMr(e.target.value)}
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'दुकानाचे नाव (इंग्रजी)' : 'Shop Name (English)'} *
            </label>
            <input
              type="text"
              value={shopNameEn}
              onChange={(e) => setShopNameEn(e.target.value)}
              className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>

        {/* Story */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'दुकानाची गोष्ट / परंपरा (मराठी)' : 'Shop Story & Rural Heritage (Marathi)'}
            </label>
            <textarea
              value={storyMr}
              onChange={(e) => setStoryMr(e.target.value)}
              rows={3}
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink-2 block mb-1">
              {isMr ? 'दुकानाची गोष्ट (इंग्रजी)' : 'Shop Story (English)'}
            </label>
            <textarea
              value={storyEn}
              onChange={(e) => setStoryEn(e.target.value)}
              rows={3}
              className="w-full p-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Village & Geographic Location */}
        <div className="pt-4 border-t border-line space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-2">
              {isMr ? 'भौगोलिक स्थान व पत्ता' : 'Village Location & Pin'}
            </span>
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="text-xs font-semibold text-clay hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isMr ? 'नकाशावर स्थान निवडा' : 'Set Pin on Map'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-ink-2 block mb-1">{isMr ? 'गाव' : 'Village'}</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
            <div>
              <label className="text-xs text-ink-2 block mb-1">{isMr ? 'जिल्हा' : 'District'}</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>

          <p className="text-xs text-ink-2">
            Address line: {addressLine || 'Set via map'} (Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)})
          </p>
        </div>

        {/* Delivery Settings (D8, C5, C6) */}
        <div className="pt-4 border-t border-line space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-2 block">
            {isMr ? 'डिलिव्हरी मॉडेल व नियम' : 'Delivery Pricing & Radius Settings'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-xl border cursor-pointer space-y-1 ${
                deliveryMode === 'SELLER_PAYS'
                  ? 'bg-cream-2 border-clay'
                  : 'bg-surface border-line hover:border-ink'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deliveryMode"
                  checked={deliveryMode === 'SELLER_PAYS'}
                  onChange={() => setDeliveryMode('SELLER_PAYS')}
                  className="w-4 h-4 text-clay"
                />
                <span className="font-bold text-sm text-ink">
                  {isMr ? 'मोफत डिलिव्हरी (विक्रेता देय)' : 'Free Delivery (Seller Pays)'}
                </span>
              </div>
              <p className="text-xs text-ink-2">
                {isMr
                  ? 'ग्राहकांना "Free Delivery" दिसते; खर्च तुमच्या नफ्यातून वळता होतो.'
                  : 'Customer sees Free Delivery; cost deducted from gross order.'}
              </p>
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer space-y-1 ${
                deliveryMode === 'CUSTOMER_PAYS'
                  ? 'bg-cream-2 border-clay'
                  : 'bg-surface border-line hover:border-ink'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="deliveryMode"
                  checked={deliveryMode === 'CUSTOMER_PAYS'}
                  onChange={() => setDeliveryMode('CUSTOMER_PAYS')}
                  className="w-4 h-4 text-clay"
                />
                <span className="font-bold text-sm text-ink">
                  {isMr ? 'ग्राहक देय डिलिव्हरी' : 'Customer Pays Standard Delivery'}
                </span>
              </div>
              <p className="text-xs text-ink-2">
                {isMr
                  ? 'डिलिव्हरी शुल्क ग्राहकाच्या बिलात जोडले जाते.'
                  : 'Delivery fee added to customer invoice upon checkout.'}
              </p>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs text-ink-2 font-bold block mb-1">
                {isMr ? 'कमाल डिलिव्हरी अंतर (किमी)' : 'Max Delivery Radius (km)'}
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={maxDeliveryKm}
                onChange={(e) => setMaxDeliveryKm(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            {/* Correction C6: Minimum Order Value */}
            <div>
              <label className="text-xs text-ink-2 font-bold block mb-1">
                {isMr ? 'किमान ऑर्डर मर्यादा (₹)' : 'Minimum Order Value (₹)'}
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={minOrderValueRs}
                onChange={(e) => setMinOrderValueRs(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label className="text-xs text-ink-2 font-bold block mb-1">
                {isMr ? 'पॅकिंग तयारी वेळ (मिनिटे)' : 'Prep Time (minutes)'}
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={prepTimeMins}
                onChange={(e) => setPrepTimeMins(e.target.value)}
                className="w-full h-11 px-3 bg-cream-2 border border-line rounded-xl text-xs sm:text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-line flex justify-end">
          <Button type="submit" variant="primary" loading={saving}>
            <Save className="w-4 h-4 mr-1.5" />
            <span>{isMr ? 'सेटिंग्ज जतन करा' : 'Save Settings'}</span>
          </Button>
        </div>
      </form>

      {/* Location Picker */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelected}
        />
      )}
    </div>
  );
}

export default ShopSettingsPage;
