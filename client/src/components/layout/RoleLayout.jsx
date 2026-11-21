// client/src/components/layout/RoleLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import LanguageToggle from '../LanguageToggle';
import LocationPicker from '../map/LocationPicker';
import CustomerAssistantModal from '../assistant/CustomerAssistantModal';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import {
  Home,
  Package,
  Compass,
  Lightbulb,
  TrendingUp,
  DollarSign,
  Star,
  LifeBuoy,
  MessageSquare,
  Settings,
  User,
  LogOut,
  X,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

export function CustomerLayout() {
  const { t } = useTranslation();
  const { count, conflictModal, handleConfirmConflict, handleCancelConflict } = useCart();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const guestLoc = typeof window !== 'undefined' ? localStorage.getItem('nr_guest_loc') : null;
  const guestLocLabel = guestLoc ? JSON.parse(guestLoc)?.label : null;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <Header
        locationLabel={guestLocLabel}
        onOpenLocationPicker={() => setShowLocationPicker(true)}
        cartCount={count}
      />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav role="customer" cartCount={count} />
      <CustomerAssistantModal />
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={(loc) => {
            localStorage.setItem('nr_guest_loc', JSON.stringify(loc));
            setShowLocationPicker(false);
            window.location.reload();
          }}
        />
      )}

      {/* Single Seller Cart Conflict Modal */}
      {conflictModal?.isOpen && (
        <Modal
          isOpen={conflictModal.isOpen}
          onClose={handleCancelConflict}
          title={t('cart.conflictTitle', 'Replace items in cart?')}
          maxWidth="max-w-md"
        >
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3 text-ink">
              <div className="p-2 bg-clay/10 rounded-full text-clay shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm">
                {t(
                  'cart.conflictMessage',
                  'Your cart already contains items from {{currentShop}}. A cart can only contain items from one village shop at a time. Would you like to clear your cart and add this item from {{newShop}}?',
                  {
                    currentShop: conflictModal.currentSellerName,
                    newShop: conflictModal.newSellerName
                  }
                )}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={handleCancelConflict}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button variant="danger" onClick={handleConfirmConflict}>
                {t('cart.replaceCart', 'Clear and Replace')}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function SellerLayout() {
  const { t } = useTranslation();
  const { user, profile, logout } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);
  const location = useLocation();

  const sidebarLinks = [
    { to: '/seller', icon: Home, label: t('nav.home') },
    { to: '/seller/orders', icon: Package, label: t('nav.orders') },
    { to: '/seller/products', icon: Compass, label: t('nav.products') },
    { to: '/seller/what-to-sell', icon: Lightbulb, label: t('nav.whatToSell') },
    { to: '/seller/growth', icon: TrendingUp, label: t('nav.growthCoach') },
    { to: '/seller/earnings', icon: DollarSign, label: t('nav.earnings') },
    { to: '/seller/reviews', icon: Star, label: t('nav.reviews') },
    { to: '/seller/support', icon: LifeBuoy, label: t('nav.support') },
    { to: '/seller/assistant', icon: MessageSquare, label: t('nav.assistant') },
    { to: '/seller/shop', icon: Settings, label: t('nav.shopSettings') },
    { to: '/seller/account', icon: User, label: t('nav.account') }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      {/* Seller Top Bar */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link to="/seller" className="flex items-center gap-2">
            <img src="/logo.svg" alt="NativeRise" className="h-8 w-auto" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-clay text-cream">
              Seller
            </span>
          </Link>
          <LanguageToggle />
        </div>

        <div className="flex items-center gap-4">
          {profile?.shopName && (
            <span className="text-sm font-semibold text-ink truncate max-w-[180px]">
              {profile.shopName.mr || profile.shopName.en || ''}
            </span>
          )}
          <button
            type="button"
            onClick={logout}
            aria-label={t('nav.logout')}
            className="p-2 text-ink-2 hover:text-danger transition-colors rounded-full hover:bg-cream-2"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Desktop Sidebar (>= lg) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-line bg-surface p-6 gap-1 shrink-0">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-primary text-ink shadow-sm'
                    : 'text-ink-2 hover:bg-cream-2 hover:text-ink'
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-8 pb-24 lg:pb-8 max-w-full overflow-hidden">
          <Outlet />
        </main>
      </div>

      <BottomNav role="seller" onOpenDrawer={() => setShowDrawer(true)} />

      {/* Mobile More Drawer (< lg) */}
      {showDrawer && (
        <div
          className="fixed inset-0 z-50 bg-bark/60 backdrop-blur-sm lg:hidden flex justify-end"
          onClick={() => setShowDrawer(false)}
        >
          <div
            className="w-72 bg-surface h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
                <span className="font-serif font-bold text-lg text-ink">
                  {t('nav.more')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded-full text-ink-2 hover:text-ink hover:bg-cream-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1">
                {sidebarLinks.slice(3).map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setShowDrawer(false)}
                      className={clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-primary text-ink'
                          : 'text-ink-2 hover:bg-cream-2 hover:text-ink'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-danger hover:bg-danger-soft transition-colors w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PartnerLayout() {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();
  const location = useLocation();
  const isMr = i18n.language === 'mr';

  const partnerNavLinks = [
    { to: '/partner', label: isMr ? 'डॅशबोर्ड' : 'Dashboard' },
    { to: '/partner/jobs', label: isMr ? 'उपलब्ध ऑर्डर्स' : 'Available Jobs' },
    { to: '/partner/active', label: isMr ? 'चालू डिलिव्हरी' : 'Active Delivery' },
    { to: '/partner/earnings', label: isMr ? 'कमाई आणि हिशोब' : 'Earnings & Ledger' },
    { to: '/partner/profile', label: isMr ? 'वाहन प्रोफाईल' : 'Vehicle Profile' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900">
      {/* Partner Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE3D9] h-16 flex items-center justify-between px-4 sm:px-8 shadow-xs">
        <div className="flex items-center gap-6">
          <Link to="/partner" className="flex items-center gap-2">
            <img src="/logo.svg" alt="NativeRise" className="h-8 w-auto" />
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E09F3E] text-stone-950">
              Partner
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {partnerNavLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={clsx(
                    'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all',
                    isActive
                      ? 'bg-[#15803d] text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-[#FAF7F2]'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            type="button"
            onClick={logout}
            aria-label={t('nav.logout')}
            title="Log out"
            className="p-2 text-stone-500 hover:text-red-600 transition-colors rounded-full hover:bg-stone-100"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>

      <BottomNav role="partner" />
    </div>
  );
}

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <header className="p-4 sm:p-6 flex items-center justify-between max-w-[1200px] w-full mx-auto">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="NativeRise" className="h-9 w-auto" />
        </Link>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default {
  CustomerLayout,
  SellerLayout,
  PartnerLayout,
  AuthLayout
};
