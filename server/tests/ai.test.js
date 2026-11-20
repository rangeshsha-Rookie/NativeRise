// server/tests/ai.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import SupportTicket from '../src/models/SupportTicket.js';

describe('Phase 3 Integration Tests: AI Features, Services & 10 Demo Questions', () => {
  let customerToken = '';
  let sellerToken = '';
  let partnerToken = '';
  let testTicketId = '';

  beforeAll(async () => {
    await connectDB();

    // Log in customer
    const cRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rohan.customer@demo.nativerise.test', password: 'Demo@1234' });
    customerToken = cRes.body.token;

    // Log in seller
    const sRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sunita.seller@demo.nativerise.test', password: 'Demo@1234' });
    sellerToken = sRes.body.token;

    // Log in partner
    const pRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'sanjay.partner@demo.nativerise.test', password: 'Demo@1234' });
    partnerToken = pRes.body.token;

    // Find a support ticket for seller
    const ticket = await SupportTicket.findOne({ seller: sRes.body.profile._id });
    if (ticket) {
      testTicketId = ticket._id.toString();
    }
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Assistant Access Control', () => {
    it('should forbid partner role from assistant', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({ messages: [{ role: 'user', content: 'hello' }] });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_ROLE');
    });
  });

  describe('2. Ten Required Demo Questions (Section 16.4)', () => {
    it('Q1: products under Rs 300 (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'Show me products under Rs 300' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.length).toBeGreaterThan(10);
      expect(res.body.cards.length).toBeGreaterThan(0);
      expect(res.body.cards[0].type).toBe('product');
    });

    it('Q2: pickles near me (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'What pickles near me can I buy?' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.cards.length).toBeGreaterThan(0);
      expect(res.body.cards[0].type).toBe('product');
    });

    it('Q3: where is my order (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'Where is my order?' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.toLowerCase()).toContain('order');
    });

    it('Q4: can you deliver to my location and how long (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'Can you deliver to my location and how long will it take?' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply).toMatch(/deliver|minute|min/i);
    });

    it('Q5: cancellation policy (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'What is your cancellation policy?' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.toLowerCase()).toContain('cancel');
    });

    it('Q6: tell me about the seller of this product (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'Tell me about the seller of this product' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.length).toBeGreaterThan(20);
    });

    it('Q7: report a problem with my order (customer)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ messages: [{ role: 'user', content: 'I want to report a problem with my order' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      if (res.body.suggestedAction) {
        expect(res.body.suggestedAction.type).toBe('CREATE_TICKET');
        expect(res.body.suggestedAction.draft).toBeDefined();
      }
    });

    it('Q8: how many orders this week (seller)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ messages: [{ role: 'user', content: 'How many orders this week?' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply).toMatch(/order/i);
    });

    it('Q9: write a description for my mango pickle (seller)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ messages: [{ role: 'user', content: 'Write a description for my mango pickle' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.length).toBeGreaterThan(30);
    });

    it('Q10: what do customers complain about most (seller)', async () => {
      const res = await request(app)
        .post('/api/v1/assistant/chat')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ messages: [{ role: 'user', content: 'What do customers complain about most?' }] });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBeDefined();
      expect(res.body.reply.length).toBeGreaterThan(10);
    });
  });

  describe('3. Seller AI Tooling Endpoints', () => {
    it('POST /api/v1/ai/what-to-sell returns grounded product ideas', async () => {
      const res = await request(app)
        .post('/api/v1/ai/what-to-sell')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          resources: ['cooking', 'spare_time'],
          budgetBand: '5k_20k',
          hoursPerDay: 4
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.ideas.length).toBe(4);
      expect(res.body.data.ideas[0]).toHaveProperty('title');
      expect(res.body.data.ideas[0]).toHaveProperty('whyItFits');
      expect(res.body.data.ideas[0]).toHaveProperty('demandSignal');
    });

    it('POST /api/v1/ai/snap-and-sell creates draft listing', async () => {
      const res = await request(app)
        .post('/api/v1/ai/snap-and-sell')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ transcript: 'Home made lemon pickle' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.recognized).toBe(true);
      expect(res.body.data.name).toBeDefined();
      expect(res.body.data.priceRangePaise).toBeDefined();
    });

    it('POST /api/v1/ai/voice-to-listing converts speech to listing fields', async () => {
      const res = await request(app)
        .post('/api/v1/ai/voice-to-listing')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ transcript: 'Fresh turmeric powder 500 grams 250 rupees' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.quantityValue).toBe(500);
      expect(res.body.data.quantityUnit).toBe('g');
      expect(res.body.data.priceRupees).toBe(250);
    });

    it('POST /api/v1/ai/describe returns bilingual descriptions', async () => {
      const res = await request(app)
        .post('/api/v1/ai/describe')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ name: 'Chili Pickle', category: 'pickles-preserves' });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.description.en.length).toBeGreaterThan(20);
      expect(res.body.data.description.mr.length).toBeGreaterThan(20);
    });

    it('GET /api/v1/ai/growth-coach returns structured coaching cards', async () => {
      const res = await request(app)
        .get('/api/v1/ai/growth-coach')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('makeMore');
      expect(res.body.data).toHaveProperty('improve');
      expect(res.body.data).toHaveProperty('tip');
    });

    it('POST /api/v1/ai/support/draft-reply drafts helpful response for ticket', async () => {
      if (!testTicketId) {
        return;
      }

      const res = await request(app)
        .post('/api/v1/ai/support/draft-reply')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ ticketId: testTicketId });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.draft).toBeDefined();
      expect(res.body.data.draft.length).toBeGreaterThan(10);
    });
  });
});
