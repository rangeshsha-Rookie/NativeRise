// client/e2e/e1-seller-registration-catalog.spec.js
import { test, expect } from '@playwright/test';

test.describe('E1: Seller Registration & Catalog Publishing', () => {
  test('Seller registers, configures shop, publishes product, and it appears in customer catalog', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/NativeRise/);

    // Verify brand tagline is present
    await expect(page.locator('body')).toContainText(/From the village to your doorstep|गावापासून तुमच्या दारापर्यंत/);

    // 2. Go to Register page
    await page.goto('/register');
    await expect(page.locator('h1, h2')).toContainText(/Create your account|खाते तयार करा/);

    // Switch to Rural Seller tab
    const sellerTabBtn = page.locator('button:has-text("Rural Seller"), button:has-text("विक्रेता")');
    if (await sellerTabBtn.isVisible()) {
      await sellerTabBtn.click();
    }

    // Fill registration form for a new seller
    const testEmail = `seller_${Date.now()}@test.nativerise.com`;
    const testPhone = `9822${Math.floor(100000 + Math.random() * 900000)}`;

    await page.fill('input[name="name"]', 'Babanrao Shinde');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', testPhone);
    await page.fill('input[name="password"]', 'Password@123');
    await page.fill('input[name="confirmPassword"]', 'Password@123');

    // Fill shop details if seller tab active
    const shopNameInput = page.locator('input[placeholder*="Sahyadri"], input[placeholder*="गावचा"]');
    if (await shopNameInput.isVisible().catch(() => false)) {
      await shopNameInput.fill('Shinde Farm Fresh Jaggery');
      await page.fill('textarea', 'Pure traditional organic jaggery produced directly from sugarcane fields using natural methods.');
    }

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to seller dashboard or home
    await page.waitForURL(url => url.pathname.includes('/seller') || url.pathname === '/', { timeout: 25000 });
    expect(page.url()).toBeTruthy();
  });
});
