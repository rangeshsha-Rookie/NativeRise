// server/src/controllers/payments.controller.js
import crypto from 'crypto';
import Order from '../models/Order.js';
import config from '../config/env.js';
import { transition } from '../services/orders.service.js';

/**
 * Razorpay webhook handler
 */
export async function handleWebhook(req, res) {
  const secret = config.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return res.status(200).json({ ok: true, note: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ ok: false, message: 'Missing signature' });
  }

  const rawBody = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'utf8');
  const actualBuf = Buffer.from(signature, 'utf8');

  if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
    return res.status(400).json({ ok: false, message: 'Invalid webhook signature' });
  }

  const event = req.body?.event;
  const payload = req.body?.payload;

  try {
    if (event === 'payment.captured') {
      const payment = payload?.payment?.entity;
      const rzpOrderId = payment?.order_id;
      if (rzpOrderId) {
        const order = await Order.findOne({ 'payment.razorpayOrderId': rzpOrderId });
        if (order && order.status === 'AWAITING_PAYMENT') {
          order.payment.status = 'PAID';
          order.payment.razorpayPaymentId = payment.id;
          order.payment.paymentInstrument = payment.method || 'upi';
          order.payment.paidAt = new Date();
          await order.save();

          await transition(order._id, 'AWAITING_PAYMENT', 'PLACED', {
            byRole: 'system',
            note: 'Razorpay webhook: payment.captured'
          });
        }
      }
    } else if (event === 'payment.failed') {
      const payment = payload?.payment?.entity;
      const rzpOrderId = payment?.order_id;
      if (rzpOrderId) {
        const order = await Order.findOne({ 'payment.razorpayOrderId': rzpOrderId });
        if (order) {
          order.statusHistory.push({
            status: order.status,
            at: new Date(),
            byRole: 'system',
            note: `Webhook: payment.failed (${payment.error_description || 'Unknown'})`
          });
          await order.save();
        }
      }
    } else if (event === 'refund.processed') {
      const refund = payload?.refund?.entity;
      const paymentId = refund?.payment_id;
      if (paymentId) {
        await Order.updateOne(
          { 'payment.razorpayPaymentId': paymentId },
          {
            $set: {
              'payment.status': 'REFUNDED',
              'payment.refundId': refund.id,
              'payment.refundedAt': new Date()
            }
          }
        );
      }
    }
  } catch (err) {
    console.error('[Payments:Webhook] Error processing event:', err.message);
  }

  res.status(200).json({ ok: true });
}
