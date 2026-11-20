// server/src/controllers/orders.controller.js
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import SupportTicket from '../models/SupportTicket.js';
import {
  createOrder as createOrderService,
  transition,
  formatCustomerOrder
} from '../services/orders.service.js';
import {
  verifySignature,
  fetchAndCapturePayment,
  reconcileRazorpayOrder
} from '../services/payments.service.js';
import { roadDistanceKm, haversineKm } from '../services/geo.service.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';
import { LOCATION_STALE_SECONDS } from '../config/constants.js';
import { pick } from '../utils/pick.js';
import config from '../config/env.js';
import { HttpError } from '../utils/httpError.js';
import { CODES } from '../utils/codes.js';

/**
 * POST /orders [customer]
 */
export async function createOrder(req, res, next) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    const { addressId, deliveryAddress, paymentMethod, expectedTotalPaise } = req.body;
    const lang = req.lang || 'en';

    const result = await createOrderService({
      customerUser: req.user,
      addressId,
      deliveryAddress,
      paymentMethod,
      expectedTotalPaise,
      idempotencyKey,
      lang
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /orders/:id/payment/verify [customer]
 */
export async function verifyPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const lang = req.lang || 'en';

    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    // Timing-safe HMAC check
    const isValid = verifySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      throw new HttpError(400, CODES.PAYMENT_SIGNATURE_INVALID, null, 'Invalid payment signature');
    }

    // Capture and verify amount
    const captured = await fetchAndCapturePayment(razorpay_payment_id, order.totalPayablePaise);

    // Transition AWAITING_PAYMENT -> PLACED
    order.payment.status = 'PAID';
    order.payment.razorpayPaymentId = razorpay_payment_id;
    order.payment.razorpaySignature = razorpay_signature;
    order.payment.paymentInstrument = captured.method || 'upi';
    order.payment.paidAt = new Date();
    await order.save();

    const updated = await transition(order._id, 'AWAITING_PAYMENT', 'PLACED', {
      byUser: req.user._id,
      byRole: 'customer',
      note: 'Payment verified successfully'
    });

    res.json(formatCustomerOrder(updated, lang));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /orders/:id/payment/failed [customer]
 */
export async function paymentFailed(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    order.statusHistory.push({
      status: order.status,
      at: new Date(),
      byUser: req.user._id,
      byRole: 'customer',
      note: `Payment failed attempt: ${reason || 'Unknown error'}`
    });
    await order.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /orders/:id/payment/retry [customer]
 */
export async function retryPayment(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.status !== 'AWAITING_PAYMENT') {
      throw new HttpError(400, CODES.ORDER_INVALID_TRANSITION, null, 'Order is not awaiting payment');
    }

    res.json({
      orderId: order.payment?.razorpayOrderId,
      amountPaise: order.totalPayablePaise,
      currency: 'INR',
      keyId: config.RAZORPAY_KEY_ID
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /orders/:id/reconcile [customer]
 */
export async function reconcilePayment(req, res, next) {
  try {
    const { id } = req.params;
    const lang = req.lang || 'en';

    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.status === 'AWAITING_PAYMENT' && order.payment?.razorpayOrderId) {
      const validPayment = await reconcileRazorpayOrder(
        order.payment.razorpayOrderId,
        order.totalPayablePaise
      );

      if (validPayment) {
        order.payment.status = 'PAID';
        order.payment.razorpayPaymentId = validPayment.id;
        order.payment.paymentInstrument = validPayment.method || 'upi';
        order.payment.paidAt = new Date();
        await order.save();

        const updated = await transition(order._id, 'AWAITING_PAYMENT', 'PLACED', {
          byUser: req.user._id,
          byRole: 'customer',
          note: 'Reconciled with Razorpay'
        });
        return res.json(formatCustomerOrder(updated, lang));
      }
    }

    res.json(formatCustomerOrder(order, lang));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders [customer]
 */
export async function getCustomerOrders(req, res, next) {
  try {
    const lang = req.lang || 'en';
    const { status = 'active' } = req.query;
    const { page, pageSize, skip, limit } = parsePagination(req.query);

    const filter = { customer: req.user._id };

    if (status === 'active') {
      filter.status = { $in: ['AWAITING_PAYMENT', 'PLACED', 'ACCEPTED', 'PACKED', 'ASSIGNED', 'PICKED_UP'] };
    } else if (status === 'completed') {
      filter.status = 'DELIVERED';
    } else if (status === 'closed') {
      filter.status = { $in: ['REJECTED', 'CANCELLED', 'DELIVERY_FAILED'] };
    }

    const [total, orders] = await Promise.all([
      Order.countDocuments(filter),
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('seller', 'shopName')
        .lean()
    ]);

    const items = orders.map((o) => ({
      id: o._id.toString(),
      orderNo: o.orderNo,
      status: o.status,
      createdAt: o.createdAt,
      seller: {
        id: o.seller?._id?.toString() || '',
        shopName: o.seller ? pick(o.seller.shopName, lang) : ''
      },
      firstItemImage: o.items?.[0]?.image || '',
      itemCount: o.items?.length || 0,
      totalPayablePaise: o.totalPayablePaise,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.payment?.status
    }));

    res.json({
      items,
      meta: buildPaginationMeta(total, page, pageSize)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders/:id [customer, owner]
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const lang = req.lang || 'en';

    const order = await Order.findOne({ _id: id, customer: req.user._id })
      .populate('seller')
      .populate('partner', 'name phone vehicleType')
      .select('+deliveryCode')
      .lean();

    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    // Check reviewable items if DELIVERED
    let reviewableItems = [];
    if (order.status === 'DELIVERED') {
      const existingReviews = await Review.find({
        order: order._id,
        customer: req.user._id
      }).lean();

      const reviewedProductIds = new Set(existingReviews.map((r) => r.product.toString()));

      reviewableItems = (order.items || []).map((it) => ({
        productId: it.product.toString(),
        name: pick(it.name, lang),
        reviewed: reviewedProductIds.has(it.product.toString())
      }));
    }

    const ticketCount = await SupportTicket.countDocuments({ order: order._id });

    const formatted = formatCustomerOrder(order, lang);
    formatted.reviewableItems = reviewableItems;
    formatted.ticketCount = ticketCount;

    res.json(formatted);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders/:id/tracking [customer, owner]
 */
export async function getOrderTracking(req, res, next) {
  try {
    const { id } = req.params;
    const lang = req.lang || 'en';

    const order = await Order.findOne({ _id: id, customer: req.user._id })
      .populate('partner', 'name phone')
      .lean();

    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    let isStale = false;
    let live = null;
    let remainingKm = order.roadDistanceKm;

    if (order.liveLocation && order.liveLocation.at) {
      const ageSeconds = (Date.now() - new Date(order.liveLocation.at).getTime()) / 1000;
      isStale = ageSeconds > LOCATION_STALE_SECONDS;

      live = {
        lat: order.liveLocation.lat,
        lng: order.liveLocation.lng,
        accuracy: order.liveLocation.accuracy,
        at: order.liveLocation.at,
        stale: isStale,
        simulated: !!order.liveLocation.simulated
      };

      if (order.address && order.address.lat && order.address.lng) {
        remainingKm = haversineKm(order.liveLocation.lat, order.liveLocation.lng, order.address.lat, order.address.lng);
      }
    }

    // Downsample trail to max 120 points
    let trail = order.trail || [];
    if (trail.length > 120) {
      const step = Math.ceil(trail.length / 120);
      trail = trail.filter((_, idx) => idx % step === 0);
    }

    res.json({
      status: order.status,
      etaMins: order.etaMins,
      remainingKm,
      live,
      trail: trail.map((t) => ({ lat: t.lat, lng: t.lng })),
      pickup: order.pickup,
      drop: order.address,
      milestones: order.milestones || {},
      partner: order.partner
        ? {
            id: order.partner._id.toString(),
            name: pick(order.partner.name, lang),
            phone: order.partner.phone
          }
        : null,
      steps: order.statusHistory || []
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /orders/:id/route [customer, owner]
 */
export async function getOrderRoute(req, res, next) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, customer: req.user._id }).lean();
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    const routeRes = await roadDistanceKm(order.pickup, order.address);
    let coords = routeRes.geometry || [];

    // Downsample <= 300 points
    if (coords.length > 300) {
      const step = Math.ceil(coords.length / 300);
      coords = coords.filter((_, idx) => idx % step === 0);
    }

    res.json({
      distanceKm: routeRes.distanceKm,
      estimated: routeRes.distanceEstimated,
      coordinates: coords
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /orders/:id/cancel [customer]
 */
export async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const lang = req.lang || 'en';

    const order = await Order.findOne({ _id: id, customer: req.user._id });
    if (!order) {
      throw new HttpError(404, CODES.ORDER_NOT_FOUND, null, 'Order not found');
    }

    if (order.status !== 'PLACED' && order.status !== 'AWAITING_PAYMENT') {
      throw new HttpError(400, CODES.ORDER_CANNOT_CANCEL, null, 'Order cannot be cancelled at this stage');
    }

    const updated = await transition(order._id, order.status, 'CANCELLED', {
      byUser: req.user._id,
      byRole: 'customer',
      reason: reason || 'Cancelled by customer'
    });

    res.json(formatCustomerOrder(updated, lang));
  } catch (err) {
    next(err);
  }
}

