// client/src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import all 30 English namespaces
import enCommon from './locales/en/common.json';
import enNav from './locales/en/nav.json';
import enAuth from './locales/en/auth.json';
import enHome from './locales/en/home.json';
import enCatalog from './locales/en/catalog.json';
import enProduct from './locales/en/product.json';
import enCart from './locales/en/cart.json';
import enCheckout from './locales/en/checkout.json';
import enOrders from './locales/en/orders.json';
import enTracking from './locales/en/tracking.json';
import enReviews from './locales/en/reviews.json';
import enSupport from './locales/en/support.json';
import enAssistant from './locales/en/assistant.json';
import enAccount from './locales/en/account.json';
import enSeller from './locales/en/seller.json';
import enSellerOrders from './locales/en/sellerOrders.json';
import enSellerProducts from './locales/en/sellerProducts.json';
import enSnap from './locales/en/snap.json';
import enWhatToSell from './locales/en/whatToSell.json';
import enGrowth from './locales/en/growth.json';
import enEarnings from './locales/en/earnings.json';
import enPartner from './locales/en/partner.json';
import enPartnerJobs from './locales/en/partnerJobs.json';
import enMap from './locales/en/map.json';
import enStatus from './locales/en/status.json';
import enUnits from './locales/en/units.json';
import enErrors from './locales/en/errors.json';
import enValidation from './locales/en/validation.json';
import enA11y from './locales/en/a11y.json';
import enFooter from './locales/en/footer.json';

// Import all 30 Marathi namespaces
import mrCommon from './locales/mr/common.json';
import mrNav from './locales/mr/nav.json';
import mrAuth from './locales/mr/auth.json';
import mrHome from './locales/mr/home.json';
import mrCatalog from './locales/mr/catalog.json';
import mrProduct from './locales/mr/product.json';
import mrCart from './locales/mr/cart.json';
import mrCheckout from './locales/mr/checkout.json';
import mrOrders from './locales/mr/orders.json';
import mrTracking from './locales/mr/tracking.json';
import mrReviews from './locales/mr/reviews.json';
import mrSupport from './locales/mr/support.json';
import mrAssistant from './locales/mr/assistant.json';
import mrAccount from './locales/mr/account.json';
import mrSeller from './locales/mr/seller.json';
import mrSellerOrders from './locales/mr/sellerOrders.json';
import mrSellerProducts from './locales/mr/sellerProducts.json';
import mrSnap from './locales/mr/snap.json';
import mrWhatToSell from './locales/mr/whatToSell.json';
import mrGrowth from './locales/mr/growth.json';
import mrEarnings from './locales/mr/earnings.json';
import mrPartner from './locales/mr/partner.json';
import mrPartnerJobs from './locales/mr/partnerJobs.json';
import mrMap from './locales/mr/map.json';
import mrStatus from './locales/mr/status.json';
import mrUnits from './locales/mr/units.json';
import mrErrors from './locales/mr/errors.json';
import mrValidation from './locales/mr/validation.json';
import mrA11y from './locales/mr/a11y.json';
import mrFooter from './locales/mr/footer.json';

const enCombined = {
  ...enCommon,
  nav: enNav,
  auth: enAuth,
  home: enHome,
  catalog: enCatalog,
  product: enProduct,
  cart: enCart,
  checkout: enCheckout,
  orders: enOrders,
  tracking: enTracking,
  reviews: enReviews,
  support: enSupport,
  assistant: enAssistant,
  account: enAccount,
  seller: enSeller,
  sellerOrders: enSellerOrders,
  sellerProducts: enSellerProducts,
  snap: enSnap,
  whatToSell: enWhatToSell,
  growth: enGrowth,
  earnings: enEarnings,
  partner: enPartner,
  partnerJobs: enPartnerJobs,
  map: enMap,
  status: enStatus,
  units: enUnits,
  errors: enErrors,
  validation: enValidation,
  a11y: enA11y,
  footer: enFooter
};

const mrCombined = {
  ...mrCommon,
  nav: mrNav,
  auth: mrAuth,
  home: mrHome,
  catalog: mrCatalog,
  product: mrProduct,
  cart: mrCart,
  checkout: mrCheckout,
  orders: mrOrders,
  tracking: mrTracking,
  reviews: mrReviews,
  support: mrSupport,
  assistant: mrAssistant,
  account: mrAccount,
  seller: mrSeller,
  sellerOrders: mrSellerOrders,
  sellerProducts: mrSellerProducts,
  snap: mrSnap,
  whatToSell: mrWhatToSell,
  growth: mrGrowth,
  earnings: mrEarnings,
  partner: mrPartner,
  partnerJobs: mrPartnerJobs,
  map: mrMap,
  status: mrStatus,
  units: mrUnits,
  errors: mrErrors,
  validation: mrValidation,
  a11y: mrA11y,
  footer: mrFooter
};

const resources = {
  en: {
    common: enCombined,
    nav: enNav,
    auth: enAuth,
    home: enHome,
    catalog: enCatalog,
    product: enProduct,
    cart: enCart,
    checkout: enCheckout,
    orders: enOrders,
    tracking: enTracking,
    reviews: enReviews,
    support: enSupport,
    assistant: enAssistant,
    account: enAccount,
    seller: enSeller,
    sellerOrders: enSellerOrders,
    sellerProducts: enSellerProducts,
    snap: enSnap,
    whatToSell: enWhatToSell,
    growth: enGrowth,
    earnings: enEarnings,
    partner: enPartner,
    partnerJobs: enPartnerJobs,
    map: enMap,
    status: enStatus,
    units: enUnits,
    errors: enErrors,
    validation: enValidation,
    a11y: enA11y,
    footer: enFooter
  },
  mr: {
    common: mrCombined,
    nav: mrNav,
    auth: mrAuth,
    home: mrHome,
    catalog: mrCatalog,
    product: mrProduct,
    cart: mrCart,
    checkout: mrCheckout,
    orders: mrOrders,
    tracking: mrTracking,
    reviews: mrReviews,
    support: mrSupport,
    assistant: mrAssistant,
    account: mrAccount,
    seller: mrSeller,
    sellerOrders: mrSellerOrders,
    sellerProducts: mrSellerProducts,
    snap: mrSnap,
    whatToSell: mrWhatToSell,
    growth: mrGrowth,
    earnings: mrEarnings,
    partner: mrPartner,
    partnerJobs: mrPartnerJobs,
    map: mrMap,
    status: mrStatus,
    units: mrUnits,
    errors: mrErrors,
    validation: mrValidation,
    a11y: mrA11y,
    footer: mrFooter
  }
};

const savedLang =
  typeof window !== 'undefined' && typeof localStorage !== 'undefined'
    ? localStorage.getItem('nr_lang') || 'en'
    : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    ns: Object.keys(resources.en),
    defaultNS: 'common',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
