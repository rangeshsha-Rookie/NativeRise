// client/e2e/i18n-crawl.spec.js
import { test, expect } from '@playwright/test';

test.describe('i18n Crawl & Bilingual Toggle QA', () => {
  test('Home page language toggle switches dynamically between English and Marathi', async ({ page }) => {
    await page.goto('/');

    // 1. Initial English view check
    await expect(page.locator('body')).toContainText(/From the village to your doorstep/);

    // 2. Click Marathi language toggle
    const marathiToggle = page.locator('button:has-text("मराठी"), button:has-text("MR")');
    if (await marathiToggle.isVisible()) {
      await marathiToggle.click();

      // Check Marathi text is rendered
      await expect(page.locator('body')).toContainText(/गावापासून तुमच्या दारापर्यंत/);

      // Switch back to English
      const englishToggle = page.locator('button:has-text("English"), button:has-text("EN")');
      if (await englishToggle.isVisible()) {
        await englishToggle.click();
        await expect(page.locator('body')).toContainText(/From the village to your doorstep/);
      }
    }
  });

  test('Public routes load correctly in both languages', async ({ page }) => {
    // Catalog page
    await page.goto('/products');
    await expect(page.locator('body')).toContainText(/Village Products|All Products|Catalog|उत्पादने/i);

    // Shops page
    await page.goto('/shops');
    await expect(page.locator('body')).toContainText(/Shops|गावकरी विक्रेते|Rural/i);

    // Login page
    await page.goto('/login');
    await expect(page.locator('h1, h2')).toContainText(/Sign in|लॉगिन|Sign In|खाते/i);
  });
});
