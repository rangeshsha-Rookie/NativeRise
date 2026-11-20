// server/src/routes/orders.routes.js
import { Router } from 'express';
import { z } from 'zod';
import {
  createOrder,
  verifyPayment,
  paymentFailed,
  retryPayment,
  reconcilePayment,
  getCustomerOrders,
  getOrderById,
  getOrderTracking,
  getOrderRoute,
  cancelOrder
} from '../controllers/orders.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth, requireRole('customer'));

const createOrderSchema = z.object({
  addressId: z.string().optional(),
  deliveryAddress: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      line1: z.string().optional(),
      line2: z.string().optional(),
      landmark: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      pincode: z.string().optional(),
      lat: z.number(),
      lng: z.number()
    })
    .optional(),
  paymentMethod: z.enum(['RAZORPAY', 'ONLINE', 'COD']),
  expectedTotalPaise: z.number().int().optional()
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

const cancelOrderSchema = z.object({
  reason: z.string().optional()
});

router.post('/', validate({ body: createOrderSchema }), createOrder);
router.post('/:id/payment/verify', validate({ body: verifyPaymentSchema }), verifyPayment);
router.post('/:id/payment/failed', paymentFailed);
router.post('/:id/payment/retry', retryPayment);
router.post('/:id/reconcile', reconcilePayment);

router.get('/', getCustomerOrders);
router.get('/:id', getOrderById);
router.get('/:id/tracking', getOrderTracking);
router.get('/:id/route', getOrderRoute);
router.post('/:id/cancel', validate({ body: cancelOrderSchema }), cancelOrder);

export default router;
