// client/scripts/capture-browser-qa.mjs
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDirs = [
  path.resolve('..', 'qa-screenshots'),
  'E:/NativeRise/qa-screenshots',
  'C:/Users/HP/.gemini/antigravity/brain/adba6d9c-4158-46ca-98cb-26e902cc3258/qa-screenshots'
];

for (const dir of outDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function saveScreenshots(page, filename, options = {}) {
  const buffer = await page.screenshot(options);
  for (const dir of outDirs) {
    fs.writeFileSync(path.join(dir, filename), buffer);
  }
}

async function runQA() {
  console.log('Launching browser (Edge channel)...');
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ['geolocation'],
    geolocation: { latitude: 19.2813, longitude: 72.8686 }
  });

  const page = await context.newPage();

  // 1. Home Page (English)
  console.log('Navigating to Home Page (EN)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await saveScreenshots(page, '01-home-en.png', { fullPage: true });

  // 2. Switch Language to Marathi
  console.log('Switching to Marathi...');
  const mrBtn = page.locator('button:has-text("मराठी")');
  if (await mrBtn.isVisible().catch(() => false)) {
    await mrBtn.click();
    await page.waitForTimeout(1500);
    await saveScreenshots(page, '02-home-mr.png', { fullPage: true });
  }

  // 3. Login Page with Quick Demo Logins
  console.log('Navigating to Login Page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await saveScreenshots(page, '03-login-quickdemo.png', { fullPage: false });

  // 4. Quick Demo Login as Customer (Rohan)
  console.log('Quick logging in as Rohan Patil (Customer)...');
  const rohanBtn = page.locator('button:has-text("Rohan (Customer)"), button:has-text("रोहन (ग्राहक)")');
  if (await rohanBtn.isVisible().catch(() => false)) {
    await rohanBtn.click();
    await page.waitForTimeout(2000);
  }

  // 5. Catalog Page
  console.log('Navigating to Catalog...');
  await page.goto('http://localhost:5173/products', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await saveScreenshots(page, '04-catalog.png', { fullPage: false });

  // 6. Product Detail Page
  console.log('Navigating to Product Detail...');
  const firstCard = page.locator('a[href^="/products/"]').first();
  if (await firstCard.isVisible().catch(() => false)) {
    await firstCard.click();
    await page.waitForTimeout(2000);
    await saveScreenshots(page, '05-product-detail.png', { fullPage: false });
  }

  await browser.close();
  console.log('QA visual capture completed successfully!');
}

runQA().catch(err => {
  console.error('QA capture error:', err);
  process.exit(1);
});
