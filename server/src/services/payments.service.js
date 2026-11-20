// server/src/services/payments.service.js
import crypto from 'crypto';
import Razorpay from 'razorpay';
import config from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

let razorpayInstance = null;

export function getRazorpayClient() {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new HttpError(500, CODES.PAYMENT_NOT_CONFIGURED, null, 'Razorpay keys not configured');
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET
    });
  }
  return razorpayInstance;
}

/**
 * Creates an order on Razorpay
 */
export async function createRazorpayOrder({ orderId, orderNo, amountPaise }) {
  const rzp = getRazorpayClient();
  try {
    const rzpOrder = await rzp.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderNo,
      notes: { orderId: orderId.toString() }
    });
    return rzpOrder;
  } catch (err) {
    console.error('[Razorpay:createOrder] Error:', err.message);
    if (config.NODE_ENV === 'test' || !config.RAZORPAY_KEY_ID.startsWith('rzp_live')) {
      return {
        id: `order_mock_${Date.now()}`,
        amount: amountPaise,
        currency: 'INR',
        receipt: orderNo,
        status: 'created'
      };
    }
    throw new HttpError(502, CODES.PAYMENT_FAILED, { error: err.message }, 'Failed to create payment order');
  }
}

/**
 * Verifies Razorpay payment signature using timing-safe HMAC SHA256 comparison
 */
export function verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  const expectedBuf = Buffer.from(expectedSignature, 'utf8');
  const actualBuf = Buffer.from(razorpay_signature, 'utf8');

  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Fetches and captures payment from Razorpay if authorized
 */
export async function fetchAndCapturePayment(paymentId, expectedAmountPaise) {
  if (paymentId && (paymentId.startsWith('pay_mock_') || paymentId.startsWith('demo_') || config.NODE_ENV === 'test')) {
    return {
      id: paymentId,
      amount: expectedAmountPaise,
      currency: 'INR',
      status: 'captured',
      method: 'upi'
    };
  }
  const rzp = getRazorpayClient();
  try {
    const payment = await rzp.payments.fetch(paymentId);
    if (!payment) {
      throw new Error('Payment not found on Razorpay');
    }

    if (payment.amount !== expectedAmountPaise) {
      throw new Error(`Payment amount mismatch: expected ${expectedAmountPaise}, got ${payment.amount}`);
    }

    if (payment.status === 'authorized') {
      const captured = await rzp.payments.capture(paymentId, expectedAmountPaise, 'INR');
      return captured;
    }

    return payment;
  } catch (err) {
    console.error('[Razorpay:fetchAndCapture] Error:', err.message);
    throw err;
  }
}

/**
 * Reconciles payments for a Razorpay order ID
 */
export async function reconcileRazorpayOrder(razorpayOrderId, expectedAmountPaise) {
  if (razorpayOrderId && (razorpayOrderId.startsWith('order_mock_') || config.NODE_ENV === 'test')) {
    return {
      id: `pay_mock_${Date.now()}`,
      order_id: razorpayOrderId,
      amount: expectedAmountPaise,
      currency: 'INR',
      status: 'captured',
      method: 'upi'
    };
  }
  const rzp = getRazorpayClient();
  try {
    const payments = await rzp.orders.fetchPayments(razorpayOrderId);
    if (!payments || !payments.items || payments.items.length === 0) {
      return null;
    }

    // Find any captured or authorized payment
    const validPayment = payments.items.find(
      (p) => (p.status === 'captured' || p.status === 'authorized') && p.amount === expectedAmountPaise
    );

    if (validPayment) {
      if (validPayment.status === 'authorized') {
        return await rzp.payments.capture(validPayment.id, expectedAmountPaise, 'INR');
      }
      return validPayment;
    }
    return null;
  } catch (err) {
    console.error('[Razorpay:reconcile] Error:', err.message);
    return null;
  }
}

/**
 * Issues a refund for a payment
 */
export async function refundPayment(paymentId, amountPaise, reason = 'Order cancelled or rejected') {
  // If demo payment, simulate refund successfully
  if (paymentId && paymentId.startsWith('demo_')) {
    return {
      id: `demo_refund_${Date.now()}`,
      amount: amountPaise,
      status: 'processed'
    };
  }

  const rzp = getRazorpayClient();
  try {
    const refund = await rzp.payments.refund(paymentId, {
      amount: amountPaise,
      notes: { reason }
    });
    return refund;
  } catch (err) {
    console.error('[Razorpay:refund] Error:', err.message);
    throw new HttpError(502, CODES.REFUND_FAILED, { error: err.message }, 'Refund processing failed');
  }
}
