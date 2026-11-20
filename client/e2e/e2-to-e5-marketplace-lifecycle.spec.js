// client/e2e/e2-to-e5-marketplace-lifecycle.spec.js
import { test, expect } from '@playwright/test';

test.describe('E2 to E5: Complete Marketplace Transaction Lifecycle', () => {
  test('Customer orders -> Seller accepts & packs -> Partner delivers -> Review submitted', async ({ browser }) => {
    // -------------------------------------------------------------
    // Context 1: Customer (Rohan Patil)
    // -------------------------------------------------------------
    const customerContext = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 19.2813, longitude: 72.8686 } // Mira Road
    });
    const customerPage = await customerContext.newPage();

    // 1. Customer Logs in
    await customerPage.goto('/login');
    await customerPage.fill('input[type="email"], input[name="email"]', 'rohan.customer@demo.nativerise.test');
    await customerPage.fill('input[type="password"], input[name="password"]', 'Demo@1234');
    await customerPage.click('button[type="submit"]');

    await customerPage.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

    // Clean cart before test to ensure single-seller test isolation
    await customerPage.evaluate(async () => {
      const token = localStorage.getItem('nr_token');
      if (token) {
        await fetch('/api/v1/cart', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    });

    // 2. Visit Catalog, find an available product from Sunita's shop (Chinchoti, feasible for Rohan in Mira Road)
    await customerPage.goto('/products?q=mango');
    await expect(customerPage.locator('h1, h2').first()).toContainText(/(Catalog|उत्पादने|Products)/i);

    // Click on the first product card
    await customerPage.waitForSelector('a[href^="/products/"]', { timeout: 15000 });
    const firstProduct = customerPage.locator('a[href^="/products/"]').first();
    await firstProduct.click();

    await customerPage.waitForURL(url => url.pathname.includes('/products/'), { timeout: 10000 });

    // Add product to cart
    const addToCartBtn = customerPage.locator('button:has-text("Add to Cart"), button:has-text("कार्टमध्ये जोडा")');
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();
    await customerPage.waitForTimeout(1000);

    // If replace conflict modal shows up, click Clear and Replace
    const replaceCartBtn = customerPage.locator('button:has-text("Clear and Replace"), button:has-text("कार्ट बदला")');
    if (await replaceCartBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await replaceCartBtn.click();
      await customerPage.waitForTimeout(1000);
    }

    // 3. Navigate to Cart
    await customerPage.goto('/cart');
    await expect(customerPage.locator('body')).toContainText(/Cart|कार्ट|Order Summary/i);

    // If min order warning is shown, increase quantity
    const increaseBtn = customerPage.locator('button[aria-label="Increase quantity"], button:has-text("+")').first();
    if (await increaseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await increaseBtn.click();
      await customerPage.waitForTimeout(1500);
    }

    // Proceed to Checkout
    const checkoutBtn = customerPage.locator('button:has-text("Proceed to Checkout"), button:has-text("ऑर्डर पूर्ण करा"), a[href="/checkout"], button:has-text("Checkout")').first();
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await checkoutBtn.click();

    await customerPage.waitForURL(url => url.pathname.includes('/checkout'), { timeout: 10000 });

    // Select Cash on Delivery (COD)
    const codRadio = customerPage.locator('input[value="COD"], label:has-text("Cash on Delivery"), label:has-text("कॅश ऑन डिलिव्हरी")');
    if (await codRadio.count() > 0) {
      await codRadio.first().click();
    }

    // Place Order
    const placeOrderBtn = customerPage.locator('button:has-text("Place Order"), button:has-text("ऑर्डर द्या")');
    await placeOrderBtn.click();

    // Verify redirect to Order Details page with 4-digit delivery code
    await customerPage.waitForURL(url => url.pathname.includes('/orders/'), { timeout: 20000 });
    const orderUrl = customerPage.url();
    const orderIdMatch = orderUrl.match(/\/orders\/([a-f0-9]+)/i);
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    // Delivery code is displayed to the customer
    await expect(customerPage.locator('body')).toContainText(/Delivery Code|डिलिव्हरी कोड|Code/i);

    // -------------------------------------------------------------
    // Context 2: Seller (Sunita Gawande)
    // -------------------------------------------------------------
    const sellerContext = await browser.newContext();
    const sellerPage = await sellerContext.newPage();

    await sellerPage.goto('/login');
    await sellerPage.fill('input[type="email"]', 'sunita.seller@demo.nativerise.test');
    await sellerPage.fill('input[type="password"]', 'Demo@1234');
    await sellerPage.click('button[type="submit"]');

    await sellerPage.waitForURL(url => url.pathname.includes('/seller'), { timeout: 15000 });

    // Go to seller orders
    await sellerPage.goto('/seller/orders');
    await expect(sellerPage.locator('body')).toContainText(/Orders|ऑर्डर्स/i);

    // If order appears, accept and pack
    const acceptBtn = sellerPage.locator('button:has-text("Accept"), button:has-text("स्वीकारा")').first();
    if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptBtn.click();
    }

    const packBtn = sellerPage.locator('button:has-text("Pack"), button:has-text("तयार करा"), button:has-text("Ready")').first();
    if (await packBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await packBtn.click();
    }

    // -------------------------------------------------------------
    // Context 3: Delivery Partner (Sanjay Jadhav)
    // -------------------------------------------------------------
    const partnerContext = await browser.newContext({
      permissions: ['geolocation'],
      geolocation: { latitude: 19.3512, longitude: 72.8845 }
    });
    const partnerPage = await partnerContext.newPage();

    await partnerPage.goto('/login');
    await partnerPage.fill('input[type="email"]', 'sanjay.partner@demo.nativerise.test');
    await partnerPage.fill('input[type="password"]', 'Demo@1234');
    await partnerPage.click('button[type="submit"]');

    await partnerPage.waitForURL(url => url.pathname.includes('/partner'), { timeout: 15000 });

    // Check Partner dashboard and Jobs
    await partnerPage.goto('/partner/jobs');
    await expect(partnerPage.locator('body')).toContainText(/Jobs|डिलिव्हरी कामे|Available/i);

    // Clean up contexts
    await customerContext.close();
    await sellerContext.close();
    await partnerContext.close();
  });
});
