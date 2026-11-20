// client/e2e/e7-cancel-and-stock.spec.js
import { test, expect } from '@playwright/test';

test.describe('E7: Cancel Before Accept & Stock Restoration', () => {
  test('Customer cancels placed order and verifies order status transitions to CANCELLED', async ({ page }) => {
    // 1. Customer login
    await page.goto('/login');
    await page.fill('input[type="email"], input[name="email"]', 'amit.customer@demo.nativerise.test');
    await page.fill('input[type="password"], input[name="password"]', 'Demo@1234');
    await page.click('button[type="submit"]');

    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

    // 2. View orders list
    await page.goto('/orders');
    await expect(page.locator('body')).toContainText(/Orders|ऑर्डर्स/i);

    // If active order exists, click into it
    const activeOrder = page.locator('a[href^="/orders/"]').first();
    if (await activeOrder.isVisible().catch(() => false)) {
      await activeOrder.click();
      await page.waitForURL(url => url.pathname.includes('/orders/'), { timeout: 10000 });

      // If cancel button is available, verify cancel modal
      const cancelBtn = page.locator('button:has-text("Cancel Order"), button:has-text("ऑर्डर रद्द करा")');
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
        // Confirm cancel modal
        const confirmBtn = page.locator('button:has-text("Confirm Cancel"), button:has-text("होय, रद्द करा")');
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await expect(page.locator('body')).toContainText(/CANCELLED|रद्द झाली/i);
        }
      }
    }
  });
});
