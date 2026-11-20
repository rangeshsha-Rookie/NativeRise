// client/src/pages/auth/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, UserPlus, AlertCircle, Store, User, Truck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageToggle } from '../../components/LanguageToggle';
import { LocationPicker } from '../../components/map/LocationPicker';
import { Button } from '../../components/ui/Button';
import apiClient from '../../api/client';

export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState('customer'); // 'customer' | 'seller' | 'partner'

  // Common fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Seller specific fields
  const [shopName, setShopName] = useState('');
  const [story, setStory] = useState('');
  const [village, setVillage] = useState('Chinchoti');
  const [district, setDistrict] = useState('Palghar');
  const [pincode, setPincode] = useState('401208');
  const [location, setLocation] = useState({ lat: 19.3512, lng: 72.8845, line: 'Main Road, Chinchoti, Palghar' });
  const [deliveryMode, setDeliveryMode] = useState('INCLUDED'); // 'INCLUDED' | 'CUSTOMER_PAYS'
  const [maxDeliveryKm, setMaxDeliveryKm] = useState(30);
  const [minOrderRupees, setMinOrderRupees] = useState(150);
  const [prepTimeMins, setPrepTimeMins] = useState(120);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Partner specific fields
  const [vehicleType, setVehicleType] = useState('BIKE');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [partnerRadiusKm, setPartnerRadiusKm] = useState(25);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setIsLocationModalOpen(false);
    if (loc.village && !village) setVillage(loc.village);
    if (loc.district && !district) setDistrict(loc.district);
    if (loc.pincode && !pincode) setPincode(loc.pincode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (role === 'seller') {
      if (!shopName.trim()) {
        setError(t('auth.enterShopName', 'Please enter your shop name'));
        return;
      }
      if (story.length < 40 || story.length > 600) {
        setError(t('auth.storyLength', 'Story must be between 40 and 600 characters'));
        return;
      }
      if (!location?.lat || !location?.lng) {
        setError(t('auth.selectLocation', 'Please select your shop location on the map'));
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        role,
        name,
        email,
        phone,
        password,
        preferredLang: i18n.language || 'en'
      };

      if (role === 'seller') {
        payload.shop = {
          shopName: shopName.trim(),
          story: story.trim(),
          village: village.trim() || 'Chinchoti',
          district: district.trim() || 'Palghar',
          pincode: pincode.trim() || '401208',
          location: {
            lat: Number(location.lat),
            lng: Number(location.lng),
            line: location.line || `${village}, ${district}`
          },
          deliveryMode,
          maxDeliveryKm: Number(maxDeliveryKm),
          minOrderPaise: Math.round(Number(minOrderRupees) * 100),
          prepTimeMins: Number(prepTimeMins)
        };
      } else if (role === 'partner') {
        payload.partner = {
          vehicleType: vehicleType === 'SCOOTER' ? 'BIKE' : (vehicleType === 'TEMPO' ? 'AUTO' : vehicleType),
          vehicleNumber: vehicleNumber || 'MH04XX1234',
          serviceRadiusKm: Number(partnerRadiusKm),
          baseLocation: {
            lat: location?.lat || 19.2813,
            lng: location?.lng || 72.8686,
            line: location?.line || 'Mira Road Station'
          }
        };
      }

      await apiClient.post('/auth/register', payload);

      // Auto login after successful registration
      await login(email, password);

      if (role === 'seller') {
        navigate('/seller');
      } else if (role === 'partner') {
        navigate('/partner');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.message || err?.response?.data?.error?.message || t('errors.UNKNOWN', 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6">
          <Link to="/" className="text-2xl font-black font-serif text-bark flex items-center gap-1.5">
            <span>NativeRise</span>
          </Link>
          <LanguageToggle />
        </div>

        <h1 className="text-center text-3xl font-bold font-serif text-ink tracking-tight">
          {t('auth.createAccount', 'Create your account')}
        </h1>
        <p className="mt-2 text-center text-sm text-ink-2">
          {t('auth.haveAccount', 'Already have an account?')}{' '}
          <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800 hover:underline">
            {t('auth.signInHere', 'Sign in here')}
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-surface py-8 px-5 shadow-sm border border-line rounded-card sm:px-10">
          {/* Role Switcher Tabs per Section 21.1 */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-cream-2/60 rounded-btn mb-6 border border-line">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-btn text-xs font-semibold transition ${
                role === 'customer'
                  ? 'bg-surface text-ink shadow-sm border border-line'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('auth.roleCustomer', 'Customer')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-btn text-xs font-semibold transition ${
                role === 'seller'
                  ? 'bg-surface text-ink shadow-sm border border-line'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('auth.roleSeller', 'Rural Seller')}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('partner')}
              className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-btn text-xs font-semibold transition ${
                role === 'partner'
                  ? 'bg-surface text-ink shadow-sm border border-line'
                  : 'text-ink-2 hover:text-ink'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{t('auth.rolePartner', 'Delivery Partner')}</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-danger/10 border border-danger/30 rounded-btn flex items-start gap-2.5 text-danger text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Common Inputs */}
            <div>
              <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                {t('common.name', 'Full Name')} *
              </label>
              <input
                type="text"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Patil / Sunita Gawande"
                className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                  {t('common.email', 'Email Address')} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                  {t('common.phone', 'Phone Number')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                  {t('auth.password', 'Password')} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 px-3.5 pr-10 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink p-1 rounded transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                  {t('auth.confirmPassword', 'Confirm Password')} *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>

            {/* SELLER SPECIFIC SECTION */}
            {role === 'seller' && (
              <div className="pt-4 border-t border-line space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <Store className="w-4 h-4" />
                  <span>{t('seller.shopDetails', 'Shop Profile & Rural Story')}</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                    {t('seller.shopName', 'Shop Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Sahyadri Organic Honey / गावचा अस्सल स्वाद"
                    className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider">
                      {t('seller.story', 'Your Craft / Village Story')} *
                    </label>
                    <span className={`text-[11px] ${story.length < 40 || story.length > 600 ? 'text-danger font-semibold' : 'text-ink-2'}`}>
                      {story.length}/600 chars (min 40)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    required
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Tell your customers about your village, traditional recipes, and pure ingredients..."
                    className="w-full p-3 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                      {t('seller.village', 'Village')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="e.g. Chinchoti"
                      className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                      {t('seller.district', 'District')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Palghar / Thane"
                      className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                      {t('seller.pincode', 'Pincode')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="401208"
                      className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm"
                    />
                  </div>
                </div>

                {/* Map Location Selector */}
                <div>
                  <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1.5">
                    {t('seller.shopLocation', 'Shop Location on Map')} *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLocationModalOpen(true)}
                      className="flex-1 h-11 px-4 border border-line rounded-btn bg-cream-2/40 hover:bg-cream text-left flex items-center justify-between text-xs text-ink transition"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-primary-700 shrink-0" />
                        <span className="truncate">
                          {location ? location.line || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : t('seller.pickLocation', 'Pin your shop location on map')}
                        </span>
                      </div>
                      <span className="font-semibold text-primary-800 shrink-0 ml-2">Choose &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Delivery Mode & Minimums */}
                <div className="p-3.5 bg-cream-2/40 rounded-card border border-line space-y-3">
                  <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                    {t('seller.deliveryPricing', 'Delivery Pricing Model')}
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMode"
                        value="INCLUDED"
                        checked={deliveryMode === 'INCLUDED'}
                        onChange={() => setDeliveryMode('INCLUDED')}
                        className="mt-1"
                      />
                      <span className="text-xs text-ink">
                        <strong>Delivery included in prices (Free delivery to customer)</strong> — Cost is deducted from your seller net payout.
                      </span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="deliveryMode"
                        value="CUSTOMER_PAYS"
                        checked={deliveryMode === 'CUSTOMER_PAYS'}
                        onChange={() => setDeliveryMode('CUSTOMER_PAYS')}
                        className="mt-1"
                      />
                      <span className="text-xs text-ink">
                        <strong>Customer pays delivery separately</strong> — Delivery fee added to customer checkout.
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-2 uppercase mb-1">
                        Max Delivery (km)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="80"
                        value={maxDeliveryKm}
                        onChange={(e) => setMaxDeliveryKm(e.target.value)}
                        className="w-full h-9 px-3 rounded-btn border border-line bg-surface text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-ink-2 uppercase mb-1">
                        Min Order (₹)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        value={minOrderRupees}
                        onChange={(e) => setMinOrderRupees(e.target.value)}
                        className="w-full h-9 px-3 rounded-btn border border-line bg-surface text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PARTNER SPECIFIC SECTION */}
            {role === 'partner' && (
              <div className="pt-4 border-t border-line space-y-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 uppercase tracking-wider">
                  <Truck className="w-4 h-4" />
                  <span>{t('partner.vehicleDetails', 'Vehicle & Delivery Range')}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                      {t('partner.vehicleType', 'Vehicle Type')}
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm focus:outline-none"
                    >
                      <option value="BIKE">Motorcycle / Bike (मोटारसायकल)</option>
                      <option value="SCOOTER">Scooter (स्कूटर)</option>
                      <option value="AUTO">Auto Rickshaw (रिक्षा)</option>
                      <option value="TEMPO">Small Tempo (छोटा टेम्पो)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                      {t('partner.vehicleNumber', 'Vehicle Reg Number')}
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="MH 04 AB 1234"
                      className="w-full h-11 px-3.5 rounded-btn border border-line bg-surface text-ink text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-2 uppercase tracking-wider mb-1">
                    Service Radius: {partnerRadiusKm} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={partnerRadiusKm}
                    onChange={(e) => setPartnerRadiusKm(e.target.value)}
                    className="w-full accent-primary-700"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center mt-6"
              disabled={loading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? t('common.loading', 'Creating account...') : t('auth.createAccountBtn', 'Create Account')}
            </Button>
          </form>
        </div>
      </div>

      {/* Location Picker Modal */}
      {isLocationModalOpen && (
        <LocationPicker
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSelect={handleLocationSelect}
          initialPosition={location || { lat: 19.3512, lng: 72.8845 }}
        />
      )}
    </div>
  );
}

export default RegisterPage;
