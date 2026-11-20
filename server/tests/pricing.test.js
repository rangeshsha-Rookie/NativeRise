// server/tests/pricing.test.js
import { describe, it, expect } from 'vitest';
import {
  calculatePartnerPayout,
  calculatePlatformFee,
  calculateCustomerDeliveryCharge,
  calculateSellerNet,
  calculateMinItemsTotalForIncluded,
  calculateETA,
  calculateOrderAmounts
} from '../src/services/pricing.service.js';

describe('Pricing Service - Spec Section 24.1 Worked Numeric Examples', () => {
  it('Example A: items Rs 400 (40000), road 10 km, INCLUDED', () => {
    const itemsTotal = 40000;
    const roadKm = 10;
    const deliveryMode = 'INCLUDED';

    const payout = calculatePartnerPayout(roadKm);
    expect(payout).toBe(5500); // 1500 + 400*10 = 5500 (Rs 55)

    const fee = calculatePlatformFee(itemsTotal);
    expect(fee).toBe(2000); // 5% of 40000 = 2000 (Rs 20)

    const customerDelivery = calculateCustomerDeliveryCharge(deliveryMode, payout);
    expect(customerDelivery).toBe(0);

    const net = calculateSellerNet({
      itemsTotalPaise: itemsTotal,
      deliveryMode,
      partnerPayoutPaise: payout,
      platformFeePaise: fee
    });
    expect(net).toBe(32500); // 40000 - 2000 - 5500 = 32500 (Rs 325)

    const quote = calculateOrderAmounts({
      itemsTotalPaise: itemsTotal,
      deliveryMode,
      roadDistanceKm: roadKm
    });
    expect(quote.totalPayablePaise).toBe(40000);
    expect(quote.sellerNetPaise).toBe(32500);
  });

  it('Example B: items Rs 400 (40000), road 10 km, CUSTOMER_PAYS', () => {
    const itemsTotal = 40000;
    const roadKm = 10;
    const deliveryMode = 'CUSTOMER_PAYS';

    const payout = calculatePartnerPayout(roadKm);
    expect(payout).toBe(5500);

    const customerDelivery = calculateCustomerDeliveryCharge(deliveryMode, payout);
    expect(customerDelivery).toBe(5500);

    const quote = calculateOrderAmounts({
      itemsTotalPaise: itemsTotal,
      deliveryMode,
      roadDistanceKm: roadKm
    });
    expect(quote.totalPayablePaise).toBe(45500); // 40000 + 5500
    expect(quote.sellerNetPaise).toBe(38000); // 40000 - 2000
  });

  it('Example C: items Rs 150 (15000), road 30 km, INCLUDED', () => {
    const itemsTotal = 15000;
    const roadKm = 30;
    const deliveryMode = 'INCLUDED';

    const payout = calculatePartnerPayout(roadKm);
    expect(payout).toBe(13500); // 1500 + 400*30 = 13500

    const fee = calculatePlatformFee(itemsTotal);
    expect(fee).toBe(750); // 5% of 15000 = 750

    const net = calculateSellerNet({
      itemsTotalPaise: itemsTotal,
      deliveryMode,
      partnerPayoutPaise: payout,
      platformFeePaise: fee
    });
    expect(net).toBe(750); // 15000 - 750 - 13500 = 750 (>= 0, allowed)
  });

  it('Example D: items Rs 150 (15000), road 40 km, INCLUDED (negative net handling)', () => {
    const itemsTotal = 15000;
    const roadKm = 40;
    const deliveryMode = 'INCLUDED';

    const payout = calculatePartnerPayout(roadKm);
    expect(payout).toBe(17500); // 1500 + 400*40 = 17500

    const fee = calculatePlatformFee(itemsTotal);
    expect(fee).toBe(750);

    const net = calculateSellerNet({
      itemsTotalPaise: itemsTotal,
      deliveryMode,
      partnerPayoutPaise: payout,
      platformFeePaise: fee
    });
    expect(net).toBe(-3250); // negative net

    const neededPaise = calculateMinItemsTotalForIncluded(payout);
    expect(neededPaise).toBe(18500); // ceil(17500 / 0.95 / 100) * 100 = 18500
  });

  it('Example E: road 0.5 km raw 1700 -> minimum payout 2500', () => {
    const payout = calculatePartnerPayout(0.5);
    expect(payout).toBe(2500); // min 2500 paise (Rs 25)
  });

  it('Example F: ETA prep 120 min, 10 km -> 144 min; range 144 to 173', () => {
    const eta = calculateETA(120, 10);
    expect(eta.etaMins).toBe(144);
    expect(eta.minEtaMins).toBe(144);
    expect(eta.maxEtaMins).toBe(173);
  });

  it('Example G: fee items 33300 -> round(1665) = 1665', () => {
    const fee = calculatePlatformFee(33300);
    expect(fee).toBe(1665);
  });
});
