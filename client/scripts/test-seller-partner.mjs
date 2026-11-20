import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const outDir = path.resolve('qa-screenshots', 'portals');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Launching browser for Seller & Partner QA test...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
    args: ['--disable-gpu', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['geolocation'],
    geolocation: { latitude: 19.2813, longitude: 72.8686 }
  });

  const page = await context.newPage();

  // 1. Seller Flow
  console.log('1. Going to /login for Seller...');
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  console.log('2. Clicking Sunita (Seller)...');
  const sunitaBtn = page.locator('button:has-text("Seller: Sunita Gawande")');
  await sunitaBtn.click();
  await page.waitForURL(url => url.pathname.includes('/seller'), { timeout: 15000 });
  console.log('Current URL after seller login:', page.url());
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'seller-01-dashboard.png'), fullPage: false });

  // Check Seller Sub-pages
  const sellerRoutes = [
    { name: 'orders', path: '/seller/orders' },
    { name: 'products', path: '/seller/products' },
    { name: 'what-to-sell', path: '/seller/what-to-sell' },
    { name: 'growth-coach', path: '/seller/growth-coach' },
    { name: 'earnings', path: '/seller/earnings' },
    { name: 'settings', path: '/seller/settings' }
  ];

  for (const r of sellerRoutes) {
    console.log(`Checking /seller/${r.name}...`);
    await page.goto(`http://localhost:5173${r.path}`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(outDir, `seller-${r.name}.png`), fullPage: false });
  }

  // 3. Clear session and Partner Flow
  console.log('3. Logging out to prepare Partner login...');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await context.clearCookies();

  console.log('4. Logging in as Sanjay (Partner)...');
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  const sanjayBtn = page.locator('button:has-text("Partner: Sanjay Jadhav")');
  await sanjayBtn.click();
  await page.waitForURL(url => url.pathname.includes('/partner'), { timeout: 15000 });
  console.log('Current URL after partner login:', page.url());
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, 'partner-01-home.png'), fullPage: false });

  const partnerRoutes = [
    { name: 'jobs', path: '/partner/jobs' },
    { name: 'active', path: '/partner/active' },
    { name: 'earnings', path: '/partner/earnings' },
    { name: 'profile', path: '/partner/profile' }
  ];

  for (const r of partnerRoutes) {
    console.log(`Checking /partner/${r.name}...`);
    await page.goto(`http://localhost:5173${r.path}`);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(outDir, `partner-${r.name}.png`), fullPage: false });
  }

  console.log('All Seller and Partner portal screenshots successfully captured in qa-screenshots/portals!');
  await browser.close();
}

run().catch(e => {
  console.error('Test run failed:', e);
  process.exit(1);
});
