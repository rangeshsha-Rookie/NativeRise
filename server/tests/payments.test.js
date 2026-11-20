// server/tests/payments.test.js
import crypto from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import config from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Order from '../src/models/Order.js';

describe('Phase 2 Integration Tests: Razorpay Payments, Signatures & Reconcile', () => {
  let customerToken = '';
  let testProductId = '';
  let awaitingOrderId = '';
  let razorpayOrderId = '';
  const mockPaymentId = `pay_mock_${Date.now()}`;

  beforeAll(async () => {
    await connectDB();

    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohan.customer@demo.nativerise.test', password: 'Demo@1234' });
    customerToken = custRes.body.token;

    const prodRes = await request(app).get('/api/v1/products?limit=1');
    testProductId = prodRes.body.items[0].id;
  });

  afterAll(async () => {
    await disconnectDB();
  });

  it('should create a RAZORPAY order in AWAITING_PAYMENT status with Razorpay payload', async () => {
    await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId, qty: 1 });

    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethod: 'RAZORPAY',
        deliveryAddress: {
          name: 'Rohan Patil',
          phone: '9822011111',
          line1: 'Shop 4, Shanti Nagar, Mira Road East',
          city: 'Mira Bhayandar',
          district: 'Thane',
          pincode: '401107',
          lat: 19.2813,
          lng: 72.8686
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.order).toBeDefined();
    expect(res.body.order.status).toBe('AWAITING_PAYMENT');
    expect(res.body.razorpay).toBeDefined();
    expect(res.body.razorpay.orderId).toBeDefined();

    awaitingOrderId = res.body.order.id;
    razorpayOrderId = res.body.razorpay.orderId;
  });

  it('should reject payment verification when HMAC signature is invalid/tampered', async () => {
    const res = await request(app)
      .post(`/api/v1/orders/${awaitingOrderId}/payment/verify`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'tampered_invalid_signature_hex'
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('PAYMENT_SIGNATURE_INVALID');
  });

  it('should verify payment successfully when valid HMAC signature is provided', async () => {
    const validSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${mockPaymentId}`)
      .digest('hex');

    const res = await request(app)
      .post(`/api/v1/orders/${awaitingOrderId}/payment/verify`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: validSignature
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('PLACED');

    // Confirm DB record updated
    const updated = await Order.findById(awaitingOrderId);
    expect(updated.status).toBe('PLACED');
    expect(updated.payment.status).toBe('PAID');
    expect(updated.payment.razorpayPaymentId).toBe(mockPaymentId);
  });

  it('should reconcile an unconfirmed order using reconcile endpoint', async () => {
    // Create another RAZORPAY order
    await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ productId: testProductId, qty: 1 });

    const orderRes = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        paymentMethod: 'RAZORPAY',
        deliveryAddress: {
          name: 'Rohan Patil',
          phone: '9822011111',
          line1: 'Shop 4, Shanti Nagar, Mira Road East',
          city: 'Mira Bhayandar',
          district: 'Thane',
          pincode: '401107',
          lat: 19.2813,
          lng: 72.8686
        }
      });

    expect(orderRes.status).toBe(201);
    const newOrderId = orderRes.body.order.id;

    const reconcileRes = await request(app)
      .post(`/api/v1/orders/${newOrderId}/reconcile`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(reconcileRes.status).toBe(200);
    expect(reconcileRes.body.status).toBe('PLACED');
  });
});
