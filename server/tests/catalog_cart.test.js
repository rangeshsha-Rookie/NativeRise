// server/tests/catalog_cart.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

describe('Phase 1 Integration Tests: Auth, Catalog, and Cart', () => {
  let customerToken = '';
  let sellerToken = '';
  let _partnerToken = '';
  let customerUser = null;
  let testProductId = '';
  let _testSellerId = '';

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Authentication & Profile', () => {
    it('should log in customer and return token + profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'rohan.customer@demo.nativerise.test',
          password: 'Demo@1234'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'customer');
      expect(res.body.user.name.en).toBe('Rohan Patil');
      customerToken = res.body.token;
      customerUser = res.body.user;
    });

    it('should log in seller and return seller profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sunita.seller@demo.nativerise.test',
          password: 'Demo@1234'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'seller');
      expect(res.body.profile).toBeDefined();
      expect(res.body.profile.shopName.en).toBe("Sunita's Home Pickles");
      sellerToken = res.body.token;
      _testSellerId = res.body.profile._id;
      expect(_testSellerId).toBeDefined();
    });

    it('should log in partner and return partner profile', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sanjay.partner@demo.nativerise.test',
          password: 'Demo@1234'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'partner');
      expect(res.body.profile).toBeDefined();
      expect(res.body.profile.vehicleType).toBe('BIKE');
      _partnerToken = res.body.token;
      expect(_partnerToken).toBeDefined();
    });

    it('should get authenticated me profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('rohan.customer@demo.nativerise.test');
    });

    it('should reject wrong password with AUTH_INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'rohan.customer@demo.nativerise.test',
          password: 'WrongPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTH_INVALID_CREDENTIALS');
    });
  });

  describe('Me & Badges', () => {
    it('should get customer addresses', async () => {
      const res = await request(app)
        .get('/api/v1/me/addresses')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should get customer badges', async () => {
      const res = await request(app)
        .get('/api/v1/me/badges')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('activeOrders');
      expect(res.body).toHaveProperty('unreadTickets');
    });

    it('should get seller badges', async () => {
      const res = await request(app)
        .get('/api/v1/me/badges')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('newOrders');
    });
  });

  describe('Catalog & Products', () => {
    it('GET /api/v1/categories returns 8 categories', async () => {
      const res = await request(app).get('/api/v1/categories');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(8);
      expect(res.body[0]).toHaveProperty('slug');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('icon');
    });

    it('GET /api/v1/home returns real counts and data', async () => {
      const res = await request(app).get('/api/v1/home');

      expect(res.status).toBe(200);
      expect(res.body.categories.length).toBe(8);
      expect(res.body.stats.sellers).toBe(8);
      expect(res.body.stats.products).toBe(40);
      expect(res.body.stats.delivered).toBeGreaterThanOrEqual(280);
      expect(res.body.trending.length).toBeGreaterThan(0);
      expect(res.body.sellerStories.length).toBe(4);
    });

    it('GET /api/v1/products returns paginated products with bilingual pick', async () => {
      const res = await request(app)
        .get('/api/v1/products?pageSize=10')
        .set('Accept-Language', 'mr');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.items.length).toBe(10);
      expect(res.body.meta.total).toBe(40);
      testProductId = res.body.items[0].id;
    });

    it('GET /api/v1/products/:id returns detailed product, seller summary, ratingBreakdown', async () => {
      const res = await request(app).get(`/api/v1/products/${testProductId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('product');
      expect(res.body).toHaveProperty('seller');
      expect(res.body).toHaveProperty('ratingBreakdown');
      expect(res.body.ratingBreakdown).toHaveProperty('5');
    });

    it('GET /api/v1/products/:id/reviews returns reviews list', async () => {
      const res = await request(app).get(`/api/v1/products/${testProductId}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
      if (res.body.items.length > 0) {
        expect(res.body.items[0]).toHaveProperty('reviewerName');
        expect(res.body.items[0]).toHaveProperty('rating');
        expect(res.body.items[0].verified).toBe(true);
      }
    });

    it('GET /api/v1/sellers returns 8 sellers', async () => {
      const res = await request(app).get('/api/v1/sellers');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(8);
      expect(res.body[0]).toHaveProperty('shopName');
      expect(res.body[0]).toHaveProperty('village');
    });
  });

  describe('Cart & Quote', () => {
    it('GET /api/v1/cart returns empty cart initially', async () => {
      // Clear first to ensure clean state
      await request(app)
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.lines.length).toBe(0);
      expect(res.body.seller).toBeNull();
    });

    it('PUT /api/v1/cart/items adds an item to cart', async () => {
      const res = await request(app)
        .put('/api/v1/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          productId: testProductId,
          qty: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.lines.length).toBe(1);
      expect(res.body.lines[0].productId).toBe(testProductId);
      expect(res.body.lines[0].qty).toBe(2);
      expect(res.body.seller).toBeDefined();
    });

    it('GET /api/v1/cart/quote computes quote with feasibility and pricing', async () => {
      const defaultAddrId = customerUser.addresses[0]._id;

      const res = await request(app)
        .get(`/api/v1/cart/quote?addressId=${defaultAddrId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('itemsTotalPaise');
      expect(res.body).toHaveProperty('totalPayableOnlinePaise');
      expect(res.body).toHaveProperty('canCheckout');
      expect(res.body).toHaveProperty('feasibility');
    });
  });
});
