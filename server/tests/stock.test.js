// server/tests/stock.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import SellerProfile from '../src/models/SellerProfile.js';

describe('Phase 2 Integration Tests: Concurrency, Atomic Stock & Restoration', () => {
  let customer1Token = '';
  let customer2Token = '';
  let limitedProduct = null;
  let winningOrderId = '';

  beforeAll(async () => {
    await connectDB();

    // 1. Log in Rohan
    const c1 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohan.customer@demo.nativerise.test', password: 'Demo@1234' });
    customer1Token = c1.body.token;

    // 2. Log in Priya
    const c2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'priya.customer@demo.nativerise.test', password: 'Demo@1234' });
    customer2Token = c2.body.token;

    // 3. Find a seller profile to attach limited product
    const seller = await SellerProfile.findOne();
    expect(seller).toBeDefined();

    // 4. Create a test product with stock = 1
    limitedProduct = await Product.create({
      seller: seller._id,
      category: 'Pickles & Chutneys',
      name: { en: 'Limited Edition Mango Chutney', mr: 'मर्यादित आंबा चटणी' },
      description: { en: 'Handmade single batch fresh mango chutney', mr: 'घरगुती आणि अस्सल चवीची ताजी मर्यादित आंबा चटणी' },
      pricePaise: 25000,
      stock: 1,
      quantityValue: 250,
      quantityUnit: 'g',
      images: ['/seed-images/mango-pickle.svg'],
      isDemo: true
    });
  });

  afterAll(async () => {
    if (limitedProduct) {
      await Product.findByIdAndDelete(limitedProduct._id);
    }
    await disconnectDB();
  });

  it('should allow only one customer to order when stock is 1 and both order simultaneously', async () => {
    // Both customers add the item to their cart
    await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${customer1Token}`);

    await request(app)
      .delete('/api/v1/cart')
      .set('Authorization', `Bearer ${customer2Token}`);

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customer1Token}`)
      .send({ productId: limitedProduct._id.toString(), qty: 1 });

    await request(app)
      .post('/api/v1/cart/items')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ productId: limitedProduct._id.toString(), qty: 1 });

    const addr1 = {
      name: 'Rohan Patil',
      phone: '9822011111',
      line1: 'Shop 4, Shanti Nagar, Mira Road East',
      city: 'Mira Bhayandar',
      district: 'Thane',
      pincode: '401107',
      lat: 19.2813,
      lng: 72.8686
    };

    const addr2 = {
      name: 'Priya Kulkarni',
      phone: '9822022222',
      line1: 'Bungalow 7, Ram Nagar, Mira Road East',
      city: 'Mira Bhayandar',
      district: 'Thane',
      pincode: '401107',
      lat: 19.2815,
      lng: 72.8690
    };

    // Both attempt to checkout simultaneously
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({ paymentMethod: 'COD', deliveryAddress: addr1 }),
      request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({ paymentMethod: 'COD', deliveryAddress: addr2 })
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 400]);

    let winnerRes;
    let loserRes;
    let winningToken;
    if (res1.status === 201) {
      winnerRes = res1;
      loserRes = res2;
      winningToken = customer1Token;
    } else {
      winnerRes = res2;
      loserRes = res1;
      winningToken = customer2Token;
    }

    expect(loserRes.body.code).toBe('INSUFFICIENT_STOCK');
    winningOrderId = winnerRes.body.order.id;

    // Check product stock in DB is now 0
    const prodAfter = await Product.findById(limitedProduct._id);
    expect(prodAfter.stock).toBe(0);

    // Winning customer cancels their order
    const cancelRes = await request(app)
      .post(`/api/v1/orders/${winningOrderId}/cancel`)
      .set('Authorization', `Bearer ${winningToken}`)
      .send({ reason: 'Changed mind' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('CANCELLED');

    // Verify stock is restored to 1
    const prodRestored = await Product.findById(limitedProduct._id);
    expect(prodRestored.stock).toBe(1);
  });
});
