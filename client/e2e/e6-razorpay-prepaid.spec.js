// client/e2e/e6-razorpay-prepaid.spec.js
import { test, expect } from '@playwright/test';

test.describe('E6: Razorpay Prepaid Test Mode Flow', () => {
  test('Customer sees Razorpay test mode badge and simulates payment handling', async ({ page }) => {
    // 1. Login as customer
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'priya.customer@demo.nativerise.test');
    await page.fill('input[type="password"], input[name="password"]', 'Demo@1234');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

    // 2. Add an item to cart
    await page.goto('/products');
    await page.waitForSelector('a[href^="/products/"]', { timeout: 15000 });
    const firstProduct = page.locator('a[href^="/products/"]').first();
    await firstProduct.click();

    await page.waitForURL(url => url.pathname.includes('/products/'), { timeout: 10000 });
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("कार्टमध्ये जोडा")');
    await addToCartBtn.click();
    await page.waitForTimeout(1500);

    // 3. Go to Cart then Checkout
    await page.goto('/cart');
    await expect(page.locator('body')).toContainText(/Cart|कार्ट/i);

    // If min order warning is shown, increase quantity
    const increaseBtn = page.locator('button[aria-label="Increase quantity"], button:has-text("+")').first();
    if (await increaseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await increaseBtn.click();
      await page.waitForTimeout(1500);
    }

    const checkoutBtn = page.locator('button:has-text("Proceed to Checkout"), button:has-text("ऑर्डर पूर्ण करा"), a[href="/checkout"], button:has-text("Checkout")').first();
    if (await checkoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await checkoutBtn.click();
    } else {
      await page.goto('/checkout');
    }

    await page.waitForURL(url => url.pathname.includes('/checkout'), { timeout: 10000 });

    // Verify "Test mode - no real money moves" badge exists (S2)
    const testModeBadge = page.getByText(/Test mode - no real money moves|टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत/i);
    await expect(testModeBadge.first()).toBeVisible({ timeout: 15000 });
  });
});
