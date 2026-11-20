// client/src/__tests__/smoke.test.jsx
import { describe, it, expect } from 'vitest';
import i18n from '../i18n';

describe('Client Foundations & Smoke Tests', () => {
  it('should initialize i18n with English and Marathi', async () => {
    expect(i18n.isInitialized).toBe(true);
    expect(i18n.hasResourceBundle('en', 'common')).toBe(true);
    expect(i18n.hasResourceBundle('mr', 'common')).toBe(true);
  });

  it('should translate core brand taglines accurately in English and Marathi', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('tagline', { ns: 'common' })).toBe('From the village to your doorstep.');

    await i18n.changeLanguage('mr');
    expect(i18n.t('tagline', { ns: 'common' })).toBe('गावापासून तुमच्या दारापर्यंत.');
  });

  it('should verify test mode badges and simulated settlement badges exist', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('testModeBadge', { ns: 'common' })).toBe('Test mode - no real money moves');
    expect(i18n.t('simulatedSettlement', { ns: 'common' })).toBe('Simulated settlement');

    await i18n.changeLanguage('mr');
    expect(i18n.t('testModeBadge', { ns: 'common' })).toBe('टेस्ट मोड - कोणतेही खरे पैसे जात नाहीत');
    expect(i18n.t('simulatedSettlement', { ns: 'common' })).toBe('सिम्युलेटेड सेटलमेंट (नमुना हिशेब)');
  });

  it('should verify single-seller cart and stock status translations exist', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('inStock', { ns: 'common' })).toBe('In stock');
    expect(i18n.t('outOfStock', { ns: 'common' })).toBe('Out of stock');
    expect(i18n.t('onlyNLeft', { ns: 'common', count: 3 })).toBe('Only 3 left');

    await i18n.changeLanguage('mr');
    expect(i18n.t('inStock', { ns: 'common' })).toBe('उपलब्ध आहे');
    expect(i18n.t('outOfStock', { ns: 'common' })).toBe('साठा संपला');
    expect(i18n.t('onlyNLeft', { ns: 'common', count: 3 })).toBe('फक्त 3 शिल्लक');
  });
});
