// client/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, MapPin, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../LanguageToggle';
import apiClient from '../../api/client';

export function Header({ locationLabel, onOpenLocationPicker, cartCount = 0 }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      try {
        const res = await apiClient.get(`/search/suggest?q=${encodeURIComponent(val)}`);
        if (res?.ok && res.data) {
          setSuggestions(res.data);
          setShowSuggestions(true);
        }
      } catch (err) {
        // Silent on suggest failure
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group focus:outline-none">
            <img src="/logo.svg" alt="NativeRise" className="h-9 w-auto" />
          </Link>
          <LanguageToggle />
        </div>

        {/* Search Bar (desktop) */}
        <div className="hidden md:block flex-1 max-w-md relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={t('home.searchPlaceholder', 'Search pickles, masalas, honey...')}
              className="w-full h-11 pl-11 pr-4 bg-cream-2 border border-line rounded-full text-sm text-ink placeholder:text-ink-2/60 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Search className="w-4 h-4 text-ink-2 absolute left-4 top-3.5 pointer-events-none" />
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
            <div className="absolute left-0 right-0 top-12 bg-surface border border-line rounded-card shadow-lg p-3 z-50">
              {suggestions.categories.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs font-semibold text-ink-2 uppercase tracking-wider px-2">
                    {t('catalog.allCategories')}
                  </span>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/products?category=${cat.slug}`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm font-medium text-ink hover:bg-cream-2 rounded-lg flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-ink-2 uppercase tracking-wider px-2">
                    {t('nav.products')}
                  </span>
                  {suggestions.products.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/products/${prod.id}`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-sm text-ink hover:bg-cream-2 rounded-lg truncate block"
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location Chip */}
        <button
          type="button"
          onClick={onOpenLocationPicker}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-cream-2 border border-line rounded-full text-sm text-ink hover:border-ink transition-colors max-w-[200px]"
        >
          <MapPin className="w-4 h-4 text-clay shrink-0" />
          <span className="truncate font-medium">
            {locationLabel || t('home.setYourLocation', 'Set location')}
          </span>
        </button>

        {/* Right side navigation & actions */}
        <div className="flex items-center gap-3">
          {user?.role === 'seller' ? (
            <Link
              to="/seller"
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-ink text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              {t('nav.myDashboard', 'Go to my dashboard')}
            </Link>
          ) : user?.role === 'partner' ? (
            <Link
              to="/partner"
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-ink text-sm font-semibold hover:bg-primary-600 transition-colors"
            >
              {t('nav.myDashboard', 'Go to my dashboard')}
            </Link>
          ) : (
            <>
              {/* Orders Link (desktop) */}
              <Link
                to="/orders"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-ink hover:text-clay transition-colors"
              >
                {t('nav.orders')}
              </Link>

              {/* Cart Icon Button */}
              <Link
                to="/cart"
                aria-label={t('nav.cart')}
                className="relative p-2.5 rounded-full bg-cream-2 border border-line text-ink hover:bg-cream transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-clay text-cream text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account / Login */}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  aria-label={t('nav.account')}
                  className="p-2.5 rounded-full bg-cream-2 border border-line text-ink hover:bg-cream transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-semibold text-ink hover:text-clay transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold rounded-full bg-primary text-ink hover:bg-primary-600 transition-colors"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
