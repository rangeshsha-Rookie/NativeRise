// client/src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, MapPin, User as UserIcon, Store, Sparkles, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageToggle from '../LanguageToggle';
import apiClient from '../../api/client';
import clsx from 'clsx';

export function Header({ locationLabel, onOpenLocationPicker, cartCount = 0 }) {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMr = i18n.language === 'mr';

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showShopMenu, setShowShopMenu] = useState(false);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      try {
        const res = await apiClient.get(`/search/suggest?q=${encodeURIComponent(val)}`);
        const data = res?.data || res;
        if (data && (data.products || data.categories)) {
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch {
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

  const isHome = location.pathname === '/';
  const isCatalog = location.pathname.startsWith('/products');

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line shadow-sm">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Main Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="font-serif font-black text-2xl tracking-tight text-ink block leading-none">
                NativeRise
              </span>
              <span className="text-[10px] text-ink-2 font-medium tracking-wider uppercase block mt-0.5">
                {isMr ? 'थेट गावाकडून' : 'Rural Marketplace'}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Pills */}
          <nav className="hidden lg:flex items-center gap-2">
            <Link
              to="/"
              className={clsx(
                'px-4 py-1.5 rounded-full text-sm font-semibold transition-all',
                isHome
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-ink hover:text-emerald-700 hover:bg-cream-2'
              )}
            >
              {isMr ? 'मुखपृष्ठ' : 'Home'}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowShopMenu((m) => !m)}
                onBlur={() => setTimeout(() => setShowShopMenu(false), 200)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 transition-all',
                  isCatalog
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'text-ink hover:text-emerald-700 hover:bg-cream-2'
                )}
              >
                <span>{isMr ? 'खरेदी करा' : 'Shop'}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showShopMenu && (
                <div className="absolute left-0 top-10 w-48 bg-surface border border-line rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <Link
                    to="/products"
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-ink hover:bg-cream-2 hover:text-emerald-700"
                  >
                    {isMr ? 'सर्व उत्पादने' : 'All Products'}
                  </Link>
                  <Link
                    to="/shops"
                    className="block px-3 py-2 rounded-xl text-xs font-semibold text-ink hover:bg-cream-2 hover:text-emerald-700"
                  >
                    {isMr ? 'गावची दुकाने' : 'Village Shops'}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block relative">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={
                isMr
                  ? 'उत्पादने, कारागीर किंवा गाव शोधा...'
                  : 'Search for products, artisans, or village...'
              }
              className="w-full h-11 pl-11 pr-4 bg-cream-2/80 hover:bg-cream-2 border border-line rounded-full text-sm text-ink placeholder:text-ink-2/60 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-surface transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-ink-2 absolute left-4 top-3.5 pointer-events-none" />
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && (suggestions.products?.length > 0 || suggestions.categories?.length > 0) && (
            <div className="absolute left-0 right-0 top-13 bg-surface border border-line rounded-2xl shadow-2xl p-3 z-50">
              {suggestions.categories?.length > 0 && (
                <div className="mb-2">
                  <span className="text-[11px] font-bold text-ink-2 uppercase tracking-wider px-2 block mb-1">
                    {isMr ? 'वर्गवारी' : 'Categories'}
                  </span>
                  {suggestions.categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/products?category=${cat.slug}`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-ink hover:bg-emerald-50 hover:text-emerald-800 rounded-xl flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.products?.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-ink-2 uppercase tracking-wider px-2 block mb-1">
                    {isMr ? 'उत्पादने' : 'Products'}
                  </span>
                  {suggestions.products.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate(`/products/${prod.id}`);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-ink hover:bg-emerald-50 hover:text-emerald-800 rounded-xl truncate block font-medium"
                    >
                      {prod.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions & Utilities */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Location Chip */}
          <button
            type="button"
            onClick={onOpenLocationPicker}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 bg-cream-2 border border-line rounded-full text-xs text-ink hover:border-emerald-700 transition-colors max-w-[170px]"
            title="Set delivery location"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate font-semibold">
              {locationLabel || (isMr ? 'स्थान निवडा' : 'Set location')}
            </span>
          </button>

          {/* Bilingual Language Switcher */}
          <LanguageToggle />

          {/* "Be a Seller" CTA Button */}
          {!isAuthenticated && (
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-all shadow-sm"
            >
              <Store className="w-3.5 h-3.5 text-amber-700" />
              <span>{isMr ? 'विक्रेता व्हा' : 'Be a Seller'}</span>
            </Link>
          )}

          {/* Role Dashboard or Customer Actions */}
          {user?.role === 'seller' ? (
            <Link
              to="/seller"
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              {isMr ? 'विक्रेता डॅशबोर्ड' : 'Seller Portal'}
            </Link>
          ) : user?.role === 'partner' ? (
            <Link
              to="/partner"
              className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm"
            >
              {isMr ? 'डिलिव्हरी डॅशबोर्ड' : 'Partner Portal'}
            </Link>
          ) : (
            <>
              {/* Cart Icon with Counter */}
              <Link
                to="/cart"
                aria-label="Shopping Cart"
                className="relative p-2.5 rounded-full bg-cream-2 hover:bg-cream border border-line text-ink transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-ink" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-ink text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Account / Login */}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  aria-label="User Account"
                  className="p-2.5 rounded-full bg-cream-2 hover:bg-cream border border-line text-ink transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-ink" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-xs font-bold rounded-full bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm"
                >
                  {isMr ? 'लॉगिन' : 'Login / Sign Up'}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
