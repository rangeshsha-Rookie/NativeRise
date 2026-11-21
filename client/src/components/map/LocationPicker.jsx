// client/src/components/map/LocationPicker.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation, Search } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import apiClient from '../../api/client';

export function LocationPicker({
  isOpen,
  onClose,
  onSelect,
  initialLocation,
  title
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [addressLine, setAddressLine] = useState(initialLocation?.line || '');
  const [landmark, setLandmark] = useState(initialLocation?.landmark || '');
  const [label, setLabel] = useState('Home');
  const [coords, setCoords] = useState({
    lat: initialLocation?.lat || 19.2813,
    lng: initialLocation?.lng || 72.8686
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) return;
    setSearching(true);
    try {
      const res = await apiClient.get(`/geo/search?q=${encodeURIComponent(query)}`);
      if (res?.ok && res.data) {
        setSearchResults(res.data);
      }
    } catch (err) {
      // Ignore geocode error
    } finally {
      setSearching(false);
    }
  };

  const handlePickSearchResult = (item) => {
    setCoords({ lat: item.lat, lng: item.lng });
    setAddressLine(item.label);
    setSearchResults([]);
    setQuery('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        try {
          const res = await apiClient.get(`/geo/reverse?lat=${latitude}&lng=${longitude}`);
          if (res?.ok && res.data) {
            setAddressLine(res.data.line || res.data.label || '');
          }
        } catch (err) {
          // Keep coordinates
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    const loc = {
      lat: coords.lat,
      lng: coords.lng,
      line: addressLine || 'Saved Location',
      landmark,
      label
    };
    if (onSelect) {
      onSelect(loc);
    } else {
      localStorage.setItem('nr_guest_loc', JSON.stringify(loc));
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('map.locationPickerTitle')}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('map.searchAddressPlaceholder')}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" loading={searching}>
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Search Results list */}
        {searchResults.length > 0 && (
          <div className="border border-line rounded-input bg-cream-2 max-h-40 overflow-y-auto p-2 space-y-1">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickSearchResult(item)}
                className="w-full text-left p-2 rounded-lg text-sm hover:bg-surface text-ink flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 text-clay shrink-0 mt-0.5" />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Quick Demo Village Presets */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            {t('map.quickPresets', 'Quick Demo Locations (Direct Village Delivery):')}
          </span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { label: '🌾 Padgha Village (Patil Farm)', lat: 19.3361, lng: 73.1584, line: 'Padgha Main Village, Bhiwandi, Maharashtra' },
              { label: "🏺 Chinchoti (Sunita's Pickles)", lat: 19.3512, lng: 72.8942, line: 'Chinchoti Gaon, Vasai, Maharashtra' },
              { label: '🧵 Titwala (Lata Handloom)', lat: 19.2982, lng: 73.2081, line: 'Titwala Station Road, Kalyan, Maharashtra' },
              { label: '🍬 Manor (More Gul Udyog)', lat: 19.7420, lng: 72.9120, line: 'Manor Village Market, Palghar, Maharashtra' }
            ].map((preset, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  setCoords({ lat: preset.lat, lng: preset.lng });
                  setAddressLine(preset.line);
                  setLandmark('Village Center');
                }}
                className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 font-medium transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Location button */}
        <Button
          variant="secondary"
          className="w-full justify-center"
          loading={locating}
          onClick={handleUseCurrentLocation}
        >
          <Navigation className="w-4 h-4 mr-2 text-primary-600" />
          {t('map.useCurrentLocationBtn')}
        </Button>

        {/* Coords summary */}
        <div className="p-3 bg-cream-2 rounded-input border border-line text-xs text-ink-2 flex justify-between">
          <span>Lat: {coords.lat.toFixed(4)}, Lng: {coords.lng.toFixed(4)}</span>
          <span className="text-clay font-medium">{t('map.mapHint')}</span>
        </div>

        {/* Address and Landmark fields */}
        <Textarea
          label={t('map.addressLabel')}
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          rows={2}
        />

        <Input
          label={t('map.landmarkLabel')}
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          placeholder="e.g. Near Shiv temple, behind village school"
        />

        {/* Label options */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            {t('common.address')} Label
          </label>
          <div className="flex gap-2">
            {['Home', 'Work', 'Other'].map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setLabel(lbl)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  label === lbl
                    ? 'bg-primary border-primary text-ink'
                    : 'bg-surface border-line text-ink-2 hover:border-ink'
                }`}
              >
                {t(`map.label${lbl}`, lbl)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!addressLine.trim()}>
            {t('map.saveLocationBtn')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default LocationPicker;
