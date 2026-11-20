// client/src/components/layout/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Compass, Package, ShoppingBag, User, Briefcase, Navigation, TrendingUp, Menu } from 'lucide-react';
import clsx from 'clsx';

export function BottomNav({ role = 'customer', onOpenDrawer, cartCount = 0 }) {
  const { t } = useTranslation();

  const customerItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/products', icon: Compass, label: t('nav.shop') },
    { to: '/orders', icon: Package, label: t('nav.orders') },
    { to: '/cart', icon: ShoppingBag, label: t('nav.cart'), badge: cartCount },
    { to: '/account', icon: User, label: t('nav.account') }
  ];

  const sellerItems = [
    { to: '/seller', icon: Home, label: t('nav.home') },
    { to: '/seller/orders', icon: Package, label: t('nav.orders') },
    { to: '/seller/products', icon: Compass, label: t('nav.products') },
    { to: '/seller/growth', icon: TrendingUp, label: t('nav.growthCoach') },
    { action: onOpenDrawer, icon: Menu, label: t('nav.more') }
  ];

  const partnerItems = [
    { to: '/partner', icon: Home, label: t('nav.home') },
    { to: '/partner/jobs', icon: Briefcase, label: t('nav.jobs') },
    { to: '/partner/active', icon: Navigation, label: t('nav.activeOrder') },
    { to: '/partner/earnings', icon: TrendingUp, label: t('nav.earnings') },
    { to: '/partner/profile', icon: User, label: t('nav.profile') }
  ];

  const items =
    role === 'seller' ? sellerItems : role === 'partner' ? partnerItems : customerItems;

  const hideBreakpoint = role === 'seller' ? 'lg:hidden' : 'md:hidden';

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line h-16',
        hideBreakpoint
      )}
      aria-label="Mobile Navigation"
    >
      <div className="flex h-full items-center justify-around px-2">
        {items.map((item, idx) => {
          const Icon = item.icon;

          if (item.action) {
            return (
              <button
                key={idx}
                type="button"
                onClick={item.action}
                className="flex flex-col items-center justify-center flex-1 h-full text-ink-2 hover:text-ink focus:outline-none"
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-medium leading-none truncate max-w-[64px]">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/' || item.to === '/seller' || item.to === '/partner'}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center flex-1 h-full transition-colors relative',
                  isActive ? 'text-clay font-bold' : 'text-ink-2 hover:text-ink font-medium'
                )
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-1" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-clay text-cream text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-none truncate max-w-[64px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
