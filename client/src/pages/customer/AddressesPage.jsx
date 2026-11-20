// client/src/pages/customer/AddressesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Plus, Trash2, CheckCircle, ArrowLeft } from 'lucide-react';
import apiClient from '../../api/client';
import LocationPicker from '../../components/map/LocationPicker';
import Button from '../../components/ui/Button';

export function AddressesPage() {
  const { t, i18n } = useTranslation();
  const isMr = i18n.language === 'mr';

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get('/me/addresses');
      if (res?.ok && res.data) {
        setAddresses(res.data.addresses || res.data || []);
      }
    } catch (err) {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddNew = async (loc) => {
    try {
      await apiClient.post('/me/addresses', {
        label: loc.label || 'Home',
        line: loc.line || 'Selected Location',
        landmark: loc.landmark || '',
        lat: loc.lat,
        lng: loc.lng,
        isDefault: addresses.length === 0
      });
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to add address');
    }
  };

  const handleSetDefault = async (id) => {
    setBusyId(id);
    try {
      await apiClient.patch(`/me/addresses/${id}/default`);
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to set default');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(isMr ? 'हा पत्ता हटवायचा आहे का?' : 'Delete this address?')) return;
    setBusyId(id);
    try {
      await apiClient.delete(`/me/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/account"
            className="inline-flex items-center gap-1 text-xs text-ink-2 hover:text-ink mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isMr ? 'खात्याकडे परत' : 'Back to Account'}</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
            {isMr ? 'साठवलेले पत्ते' : 'Saved Addresses'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-2 mt-1">
            {isMr ? 'ऑर्डरच्या अचूक डिलिव्हरीसाठी अचूक नकाशा स्थान जोडा.' : 'Manage locations for seamless checkpoint delivery.'}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowPicker(true)}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{isMr ? 'नवीन पत्ता' : 'Add Address'}</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-cream-2 rounded-card animate-pulse" />
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((addr) => {
            const isBusy = busyId === addr._id;

            return (
              <div
                key={addr._id}
                className="p-5 bg-surface border border-line rounded-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm sm:text-base">
                      {addr.label || 'Home'}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {isMr ? 'डीफॉल्ट' : 'Default'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">
                    {addr.line} {addr.landmark && `(${addr.landmark})`}
                  </p>
                  <p className="text-[11px] text-ink-2">
                    Lat: {addr.location?.coordinates?.[1]?.toFixed(4) || addr.lat?.toFixed(4)}, Lng:{' '}
                    {addr.location?.coordinates?.[0]?.toFixed(4) || addr.lng?.toFixed(4)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-xs font-semibold text-clay hover:underline disabled:opacity-50"
                    >
                      {isMr ? 'डीफॉल्ट करा' : 'Set as default'}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleDelete(addr._id)}
                    className="p-2 text-ink-2 hover:text-danger rounded-full transition-colors disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface border border-line rounded-card space-y-4">
          <MapPin className="w-10 h-10 mx-auto text-ink-2" />
          <p className="text-sm font-semibold text-ink">
            {isMr ? 'कोणतेही पत्ते साठवलेले नाहीत.' : 'No saved addresses yet.'}
          </p>
          <Button variant="primary" onClick={() => setShowPicker(true)}>
            {isMr ? 'पत्ता जोडा' : 'Add Your First Address'}
          </Button>
        </div>
      )}

      {/* Location Picker Modal */}
      {showPicker && (
        <LocationPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleAddNew}
        />
      )}
    </div>
  );
}

export default AddressesPage;
