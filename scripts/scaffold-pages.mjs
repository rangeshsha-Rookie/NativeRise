// scripts/scaffold-pages.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.resolve(__dirname, '../client/src/pages');

const pages = [
  { path: 'public/HomePage.jsx', title: 'Home' },
  { path: 'public/CatalogPage.jsx', title: 'Catalog' },
  { path: 'public/ProductDetailPage.jsx', title: 'Product Detail' },
  { path: 'public/ShopsPage.jsx', title: 'Shops' },
  { path: 'public/ShopDetailPage.jsx', title: 'Shop Detail' },
  { path: 'public/NotFoundPage.jsx', title: 'Page Not Found' },
  { path: 'auth/LoginPage.jsx', title: 'Login' },
  { path: 'auth/RegisterPage.jsx', title: 'Register' },
  { path: 'customer/CartPage.jsx', title: 'Cart' },
  { path: 'customer/CheckoutPage.jsx', title: 'Checkout' },
  { path: 'customer/OrdersPage.jsx', title: 'Orders' },
  { path: 'customer/OrderDetailPage.jsx', title: 'Order Detail' },
  { path: 'customer/AccountPage.jsx', title: 'Account' },
  { path: 'customer/AddressesPage.jsx', title: 'Addresses' },
  { path: 'customer/SupportPage.jsx', title: 'Support' },
  { path: 'customer/TicketDetailPage.jsx', title: 'Ticket Detail' },
  { path: 'seller/SellerDashboardPage.jsx', title: 'Seller Dashboard' },
  { path: 'seller/SellerOrdersPage.jsx', title: 'Seller Orders' },
  { path: 'seller/SellerOrderDetailPage.jsx', title: 'Seller Order Detail' },
  { path: 'seller/SellerProductsPage.jsx', title: 'Seller Products' },
  { path: 'seller/AddEditProductPage.jsx', title: 'Add or Edit Product' },
  { path: 'seller/WhatToSellPage.jsx', title: 'What to Sell' },
  { path: 'seller/GrowthCoachPage.jsx', title: 'Growth Coach' },
  { path: 'seller/SellerEarningsPage.jsx', title: 'Seller Earnings' },
  { path: 'seller/SellerReviewsPage.jsx', title: 'Seller Reviews' },
  { path: 'seller/SellerSupportPage.jsx', title: 'Seller Support' },
  { path: 'seller/SellerTicketDetailPage.jsx', title: 'Seller Ticket Detail' },
  { path: 'seller/ShopSettingsPage.jsx', title: 'Shop Settings' },
  { path: 'seller/SellerAssistantPage.jsx', title: 'Seller Assistant' },
  { path: 'seller/SellerAccountPage.jsx', title: 'Seller Account' },
  { path: 'partner/PartnerHomePage.jsx', title: 'Partner Home' },
  { path: 'partner/PartnerJobsPage.jsx', title: 'Partner Jobs' },
  { path: 'partner/PartnerActivePage.jsx', title: 'Partner Active Delivery' },
  { path: 'partner/PartnerHistoryPage.jsx', title: 'Partner History' },
  { path: 'partner/PartnerEarningsPage.jsx', title: 'Partner Earnings' },
  { path: 'partner/PartnerProfilePage.jsx', title: 'Partner Profile' }
];

for (const p of pages) {
  const fullPath = path.join(pagesDir, p.path);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  if (!fs.existsSync(fullPath)) {
    const compName = path.basename(p.path, '.jsx');
    const content = `import React from 'react';
import { useTranslation } from 'react-i18next';

export function ${compName}() {
  const { t } = useTranslation();

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif text-ink mb-4">
        ${p.title}
      </h1>
      <p className="text-ink-2">
        {t('common.loading', 'Loading content...')}
      </p>
    </div>
  );
}

export default ${compName};
`;
    fs.writeFileSync(fullPath, content);
  }
}

console.log(`Scaffolded ${pages.length} page components.`);
