// server/tests/lifecycle.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import LedgerEntry from '../src/models/LedgerEntry.js';
import PartnerProfile from '../src/models/PartnerProfile.js';

describe('Phase 2 Integration Tests: Order Lifecycle, Concurrency & Logistics', () => {
  let customerToken = '';
  let sellerToken = '';
  let partner1Token = '';
  let partner2Token = '';

  let _customerUser = null;
  let testProductId = '';
  let orderId = '';
  let deliveryCode = '';
  let payableAmountPaise = 0;
  let assignedPartnerToken = '';

  beforeAll(async () => {
    await connectDB();

    // 1. Log in Customer (Rohan)
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohan.customer@demo.nativerise.test', password: 'Demo@1234' });
    expect(custRes.status).toBe(200);
    customerToken = custRes.body.token;
    _customerUser = custRes.body.user;

    // 2. Log in Seller (Sunita)
    const sellerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sunita.seller@demo.nativerise.test', password: 'Demo@1234' });
    expect(sellerRes.status).toBe(200);
    sellerToken = sellerRes.body.token;

    // 3. Log in Partner 1 (Sanjay)
    const p1Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sanjay.partner@demo.nativerise.test', password: 'Demo@1234' });
    expect(p1Res.status).toBe(200);
    partner1Token = p1Res.body.token;

    // 4. Log in Partner 2 (Vikas)
    const p2Res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'vikas.partner@demo.nativerise.test', password: 'Demo@1234' });
    expect(p2Res.status).toBe(200);
    partner2Token = p2Res.body.token;

    // Put partners online with fresh GPS near Mira Road and Vasai
    await PartnerProfile.updateMany(
      { user: { $in: [p1Res.body.user._id, p2Res.body.user._id] } },
      { $set: { activeOrder: null } }
    );

    await request(app)
      .patch('/api/v1/partner/online')
      .set('Authorization', `Bearer ${partner1Token}`)
      .send({ isOnline: true, lat: 19.2813, lng: 72.8686 });

    await request(app)
      .patch('/api/v1/partner/online')
      .set('Authorization', `Bearer ${partner2Token}`)
      .send({ isOnline: true, lat: 19.3644, lng: 72.8124 });
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Cart & Order Creation (COD)', () => {
    it('should find a product and add to cart', async () => {
      const catRes = await request(app).get('/api/v1/products?q=mango');
      expect(catRes.status).toBe(200);
      expect(catRes.body.items.length).toBeGreaterThan(0);
      testProductId = catRes.body.items[0].id;

      // Clear cart first
      await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      // Add to cart
      const addRes = await request(app)
        .put('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ productId: testProductId, qty: 2 });

      expect(addRes.status).toBe(200);
      expect(addRes.body.lines.length).toBe(1);
      expect(addRes.body.lines[0].qty).toBe(2);
    });

    it('should create a COD order and return 4-digit deliveryCode for customer', async () => {
      const orderRes = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          paymentMethod: 'COD',
          deliveryAddress: {
            name: 'Rohan Patil',
            phone: '9822011111',
            line1: 'Shop 4, Shanti Nagar, Mira Road East',
            landmark: 'Near Railway Station',
            city: 'Mira Bhayandar',
            district: 'Thane',
            pincode: '401107',
            lat: 19.2813,
            lng: 72.8686
          }
        });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.order).toBeDefined();
      expect(orderRes.body.order.status).toBe('PLACED');
      expect(orderRes.body.order.amounts).toBeDefined();
      expect(orderRes.body.order.amounts.totalPayablePaise).toBeGreaterThan(0);

      orderId = orderRes.body.order.id;
      deliveryCode = orderRes.body.order.deliveryCode;
      payableAmountPaise = orderRes.body.order.amounts.totalPayablePaise;

      expect(deliveryCode).toMatch(/^\d{4}$/);
    });
  });

  describe('2. Seller Workflow: Accept & Pack', () => {
    it('should allow seller to accept the placed order', async () => {
      const acceptRes = await request(app)
        .post(`/api/v1/seller/orders/${orderId}/accept`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.order.status).toBe('ACCEPTED');
    });

    it('should allow seller to pack the order (ready for partner pickup)', async () => {
      const packRes = await request(app)
        .post(`/api/v1/seller/orders/${orderId}/pack`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(packRes.status).toBe(200);
      expect(packRes.body.order.status).toBe('PACKED');
    });
  });

  describe('3. Partner Concurrency: Atomic First-Wins Assignment', () => {
    it('should allow exactly one partner to accept the PACKED order concurrently', async () => {
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/v1/partner/orders/${orderId}/accept`)
          .set('Authorization', `Bearer ${partner1Token}`),
        request(app)
          .post(`/api/v1/partner/orders/${orderId}/accept`)
          .set('Authorization', `Bearer ${partner2Token}`)
      ]);

      const statuses = [res1.status, res2.status].sort();
      expect(statuses).toEqual([200, 409]);

      if (res1.status === 200) {
        assignedPartnerToken = partner1Token;
        expect(res2.body.code).toBe('ORDER_ALREADY_ASSIGNED');
      } else {
        assignedPartnerToken = partner2Token;
        expect(res1.body.code).toBe('ORDER_ALREADY_ASSIGNED');
      }
    });

    it('should show active order to assigned partner without deliveryCode', async () => {
      const activeRes = await request(app)
        .get('/api/v1/partner/active')
        .set('Authorization', `Bearer ${assignedPartnerToken}`);

      expect(activeRes.status).toBe(200);
      expect(activeRes.body.order).toBeDefined();
      expect(activeRes.body.order.id).toBe(orderId);
      expect(activeRes.body.order.status).toBe('ASSIGNED');
      // Partner must NEVER see the delivery code
      expect(activeRes.body.order.deliveryCode).toBeUndefined();
    });
  });

  describe('4. Partner Pickup & Delivery with 4-Digit Code', () => {
    it('should transition to PICKED_UP by assigned partner', async () => {
      const pickupRes = await request(app)
        .post(`/api/v1/partner/orders/${orderId}/pickup`)
        .set('Authorization', `Bearer ${assignedPartnerToken}`);

      expect(pickupRes.status).toBe(200);
      expect(pickupRes.body.order.status).toBe('PICKED_UP');
    });

    it('should record GPS heartbeat and update tracking trail', async () => {
      const locRes = await request(app)
        .post('/api/v1/partner/location')
        .set('Authorization', `Bearer ${assignedPartnerToken}`)
        .send({ lat: 19.2820, lng: 72.8690, accuracy: 12 });

      expect(locRes.status).toBe(200);
      expect(locRes.body.ok).toBe(true);
      expect(locRes.body.tracking).toBe(true);
    });

    it('should reject delivery when partner enters wrong delivery code', async () => {
      const failCodeRes = await request(app)
        .post(`/api/v1/partner/orders/${orderId}/deliver`)
        .set('Authorization', `Bearer ${assignedPartnerToken}`)
        .send({ code: '9999' });

      expect(failCodeRes.status).toBe(400);
      expect(failCodeRes.body.code).toBe('DELIVERY_CODE_INVALID');
    });

    it('should accept delivery when partner enters customer 4-digit code', async () => {
      const deliverRes = await request(app)
        .post(`/api/v1/partner/orders/${orderId}/deliver`)
        .set('Authorization', `Bearer ${assignedPartnerToken}`)
        .send({
          code: deliveryCode,
          location: { lat: 19.2813, lng: 72.8686 }
        });

      expect(deliverRes.status).toBe(200);
      expect(deliverRes.body.order.status).toBe('DELIVERED');
      expect(deliverRes.body.collectAmountPaise).toBe(payableAmountPaise);
    });
  });

  describe('5. Ledger Verifications & COD Cash Settlement', () => {
    it('should verify seller and partner ledger entries were created atomically', async () => {
      const entries = await LedgerEntry.find({ order: orderId });
      expect(entries.length).toBeGreaterThanOrEqual(3);

      const sellerEntry = entries.find((e) => e.type === 'SELLER_EARNING');
      expect(sellerEntry).toBeDefined();
      expect(sellerEntry.amountPaise).toBeGreaterThan(0);
      expect(sellerEntry.breakdown.itemsTotalPaise).toBeGreaterThan(0);

      const partnerEarning = entries.find((e) => e.type === 'PARTNER_EARNING');
      expect(partnerEarning).toBeDefined();
      expect(partnerEarning.amountPaise).toBeGreaterThanOrEqual(2500); // min Rs 25

      const codEntry = entries.find((e) => e.type === 'COD_CASH_COLLECTED');
      expect(codEntry).toBeDefined();
      expect(codEntry.amountPaise).toBe(payableAmountPaise);
    });

    it('should allow partner to deposit collected COD cash', async () => {
      const depositRes = await request(app)
        .post('/api/v1/partner/cash-deposit')
        .set('Authorization', `Bearer ${assignedPartnerToken}`)
        .send({ amountPaise: 1000 });

      expect(depositRes.status).toBe(200);
      expect(depositRes.body.ok).toBe(true);
      expect(depositRes.body.depositedPaise).toBe(1000);
      expect(depositRes.body.label).toBe('SIMULATED_SETTLEMENT');
    });

    it('should reject cash deposit exceeding un-deposited balance', async () => {
      const excessRes = await request(app)
        .post('/api/v1/partner/cash-deposit')
        .set('Authorization', `Bearer ${assignedPartnerToken}`)
        .send({ amountPaise: 99999999 });

      expect(excessRes.status).toBe(400);
      expect(excessRes.body.code).toBe('AMOUNT_EXCEEDS_BALANCE');
    });
  });

  describe('6. Customer Review on Delivered Order', () => {
    it('should allow customer to post review for delivered product', async () => {
      const revRes = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId,
          productId: testProductId,
          rating: 5,
          text: 'Great taste and very fresh!'
        });

      expect(revRes.status).toBe(201);
      expect(revRes.body.rating).toBe(5);
      expect(revRes.body.sentiment).toBe('positive');
      expect(revRes.body.themes).toContain('taste');
    });

    it('should reject duplicate review for the same order and product', async () => {
      const dupRes = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId,
          productId: testProductId,
          rating: 4,
          text: 'Trying to review again'
        });

      expect(dupRes.status).toBe(409);
      expect(dupRes.body.code).toBe('REVIEW_DUPLICATE');
    });
  });
});
