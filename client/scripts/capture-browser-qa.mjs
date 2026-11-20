// client/scripts/capture-browser-qa.mjs
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('..', 'qa-screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function runQA() {
  console.log('Launching browser (Edge channel)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['geolocation'],
    geolocation: { latitude: 19.2813, longitude: 72.8686 }
  });

  const page = await context.newPage();

  // 1. Home Page (English)
  console.log('Navigating to Home Page (EN)...');
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, '01-home-en.png'), fullPage: false });

  // 2. Switch Language to Marathi
  console.log('Switching to Marathi...');
  const mrBtn = page.locator('button:has-text("मराठी")');
  if (await mrBtn.isVisible().catch(() => false)) {
    await mrBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, '02-home-mr.png'), fullPage: false });
  }

  // 3. Login Page with Quick Demo Logins
  console.log('Navigating to Login Page...');
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, '03-login-quickdemo.png'), fullPage: false });

  // 4. Quick Demo Login as Customer (Rohan)
  console.log('Quick logging in as Rohan Patil (Customer)...');
  const rohanBtn = page.locator('button:has-text("Rohan (Customer)"), button:has-text("रोहन (ग्राहक)")');
  if (await rohanBtn.isVisible().catch(() => false)) {
    await rohanBtn.click();
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 });
  }

  // 5. Catalog Page
  console.log('Navigating to Catalog...');
  await page.goto('http://localhost:5173/products');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(outDir, '04-catalog.png'), fullPage: false });

  // 6. Product Detail Page
  console.log('Navigating to Product Detail...');
  const firstProd = page.locator('a[href^="/products/"]').first();
  if (await firstProd.isVisible().catch(() => false)) {
    await firstProd.click();
    await page.waitForURL(url => url.pathname.includes('/products/'), { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '05-product-detail.png'), fullPage: false });
  }

  // 7. Login as Seller (Sunita)
  console.log('Quick logging in as Sunita (Seller)...');
  await page.goto('http://localhost:5173/login');
  const sunitaBtn = page.locator('button:has-text("Sunita (Seller)"), button:has-text("सुनीता (विक्रेता)")');
  if (await sunitaBtn.isVisible().catch(() => false)) {
    await sunitaBtn.click();
    await page.waitForURL(url => url.pathname.includes('/seller'), { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '06-seller-dashboard.png'), fullPage: false });
  }

  // 8. Login as Partner (Sanjay)
  console.log('Quick logging in as Sanjay (Partner)...');
  await page.goto('http://localhost:5173/login');
  const sanjayBtn = page.locator('button:has-text("Sanjay (Partner)"), button:has-text("संजय (डिलिव्हरी पार्टनर)")');
  if (await sanjayBtn.isVisible().catch(() => false)) {
    await sanjayBtn.click();
    await page.waitForURL(url => url.pathname.includes('/partner'), { timeout: 10000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '07-partner-dashboard.png'), fullPage: false });
  }

  await browser.close();
  console.log('QA visual capture completed successfully! Screenshots saved in /qa-screenshots.');
}

runQA().catch((err) => {
  console.error('QA capture error:', err);
  process.exit(1);
});
